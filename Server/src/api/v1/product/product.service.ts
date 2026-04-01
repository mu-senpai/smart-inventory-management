import { ApiError } from "../../../utils/ApiError";
import { paginate, PaginationParams, PaginatedResult } from "../../../utils/paginationHelper";
import { IProduct, getProductModel } from "./product.model";
import { ProductStatus } from "../../../utils/constants";
import { getOrderModel } from "../order/order.model";

export const getAll = async (
  params: PaginationParams
): Promise<PaginatedResult<IProduct>> => {
  const Product = getProductModel();
  return paginate(Product, params, {
    searchFields: ["name"],
    populate: { path: "category", select: "name" },
    sort: { createdAt: -1 },
  });
};

export const getById = async (id: string): Promise<IProduct> => {
  const Product = getProductModel();
  const product = await Product.findById(id).populate("category", "name");
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

export const create = async (
  data: Partial<IProduct>
): Promise<IProduct> => {
  const Product = getProductModel();
  const product = await Product.create(data);
  return product.populate("category", "name");
};

export const update = async (
  id: string,
  data: Partial<IProduct>
): Promise<IProduct> => {
  const Product = getProductModel();
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("category", "name");
  if (!product) throw ApiError.notFound("Product not found");

  return product;
};

export const remove = async (id: string): Promise<void> => {
  const Product = getProductModel();
  const Order = getOrderModel();
  // Check if this product is part of any orders
  const linkedOrdersCount = await Order.countDocuments({ "products.product": id });
  if (linkedOrdersCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete product: It is part of ${linkedOrdersCount} existing order(s). You cannot delete a product that has a history of orders.`
    );
  }

  const product = await Product.findByIdAndDelete(id);
  if (!product) throw ApiError.notFound("Product not found");
};

export const getLowStock = async (): Promise<IProduct[]> => {
  const Product = getProductModel();
  return Product.find({
    $expr: { $lt: ["$stockQuantity", "$minThreshold"] },
  })
    .populate("category", "name")
    .sort({ stockQuantity: 1 });
};
