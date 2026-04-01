import { getProductModel } from "../../../api/v1/product/product.model";
import { ApiError } from "../../../utils/ApiError";
import { OrderStatus, ProductStatus } from "../../../utils/constants";
import { paginate, PaginationParams, PaginatedResult } from "../../../utils/paginationHelper";
import { IOrder, IOrderProduct, getOrderModel } from "./order.model";

interface OrderQueryParams extends PaginationParams {
  status?: OrderStatus;
}

export const getAll = async (
  params: OrderQueryParams
): Promise<PaginatedResult<IOrder>> => {
  const filter: Record<string, unknown> = {};
  if (params.status) {
    filter.status = params.status;
  }

  const Order = getOrderModel();
  return paginate(Order, params, {
    searchFields: ["customerName"],
    filter,
    populate: { path: "products.product", select: "name price status" },
    sort: { createdAt: -1 },
  });
};

export const getById = async (id: string): Promise<IOrder> => {
  const Order = getOrderModel();
  const order = await Order.findById(id).populate(
    "products.product",
    "name price status"
  );
  if (!order) throw ApiError.notFound("Order not found");
  return order;
};

export const create = async (
  customerName: string,
  products: IOrderProduct[]
): Promise<IOrder> => {
  const Order = getOrderModel();
  const Product = getProductModel();

  // ─── 1. Check for duplicate product IDs ────────────────────────
  const productIds = products.map((p) => p.product.toString());
  const uniqueIds = new Set(productIds);
  if (uniqueIds.size !== productIds.length) {
    throw ApiError.badRequest(
      "Duplicate products in the order are not allowed"
    );
  }

  // ─── 2. Fetch all ordered products from DB ─────────────────────
  const dbProducts = await Product.find({
    _id: { $in: productIds },
  });

  if (dbProducts.length !== productIds.length) {
    throw ApiError.notFound("One or more products not found");
  }

  // ─── 3. Validate each product ──────────────────────────────────
  let totalPrice = 0;

  for (const item of products) {
    const dbProduct = dbProducts.find(
      (p: any) => p._id.toString() === item.product.toString()
    );

    if (!dbProduct) {
      throw ApiError.notFound(`Product ${item.product} not found`);
    }

    // Block inactive products
    if (dbProduct.status !== ProductStatus.ACTIVE) {
      throw ApiError.badRequest(
        `Product "${dbProduct.name}" is inactive and cannot be ordered`
      );
    }

    // Check sufficient stock
    if (dbProduct.stockQuantity < item.quantity) {
      throw ApiError.badRequest(
        `Only ${dbProduct.stockQuantity} items available in stock for "${dbProduct.name}"`
      );
    }

    totalPrice += dbProduct.price * item.quantity;
  }

  // ─── 4. Atomically deduct stock (per-product atomic ops) ────────
  for (const item of products) {
    const result = await Product.findOneAndUpdate(
      {
        _id: item.product,
        stockQuantity: { $gte: item.quantity },
      },
      {
        $inc: { stockQuantity: -item.quantity },
      },
      { new: true }
    );

    if (!result) {
      throw ApiError.badRequest(
        `Insufficient stock during order placement. Please try again.`
      );
    }
  }

  const order = await Order.create({
    customerName,
    products,
    totalPrice: Math.round(totalPrice * 100) / 100,
  });

  return order.populate("products.product", "name price status");
};

export const updateStatus = async (
  id: string,
  status: OrderStatus
): Promise<IOrder> => {
  const Order = getOrderModel();
  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("products.product", "name price status");

  if (!order) throw ApiError.notFound("Order not found");
  return order;
};

export const remove = async (id: string): Promise<void> => {
  const Order = getOrderModel();
  const Product = getProductModel();

  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound("Order not found");

  // Prevent deleting SHIPPED or DELIVERED orders
  if (
    order.status === OrderStatus.SHIPPED ||
    order.status === OrderStatus.DELIVERED
  ) {
    throw ApiError.badRequest(
      `Cannot delete order: It has already been ${order.status}. Only pending, confirmed, or cancelled orders can be deleted.`
    );
  }

  // Restore stock when cancelling/deleting an order that is still pending
  if (
    order.status === OrderStatus.PENDING ||
    order.status === OrderStatus.CONFIRMED
  ) {
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
    }
  }

  await Order.findByIdAndDelete(id);
};
