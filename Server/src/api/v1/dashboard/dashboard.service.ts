import { getOrderModel } from "../../../api/v1/order/order.model";
import { getProductModel } from "../../../api/v1/product/product.model";
import { ProductStatus } from "../../../utils/constants";

export const getDashboardSummary = async () => {
  const Order = getOrderModel();
  const Product = getProductModel();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // Run all queries in parallel
  const [
    totalOrdersToday,
    pendingOrdersQuery,
    completedOrdersQuery,
    revenueResult,
    lowStockCount,
    productsList
  ] = await Promise.all([
    // Total Orders Today
    Order.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    }),

    // Pending Orders (All Time or Today? Let's do all active pending)
    Order.countDocuments({ status: "Pending" }),

    // Completed Orders (Shipped or Delivered)
    Order.countDocuments({ status: { $in: ["Shipped", "Delivered"] } }),

    // Revenue Today
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]),

    // Low Stock Count (Only HIGH PRIORITY: Gap >= 75%)
    Product.aggregate([
      {
        $match: {
          $expr: { $lt: ["$stockQuantity", "$minThreshold"] },
          status: { $ne: ProductStatus.OUT_OF_STOCK }
        }
      },
      {
        $project: {
          gapPercentage: {
            $cond: {
              if: { $gt: ["$minThreshold", 0] },
              then: { $multiply: [{ $divide: [{ $subtract: ["$minThreshold", "$stockQuantity"] }, "$minThreshold"] }, 100] },
              else: 100
            }
          }
        }
      },
      {
        $match: { gapPercentage: { $gte: 75 } }
      },
      {
        $count: "highPriorityCount"
      }
    ]),

    // Top 8 Products by Lowest Stock for Insights
    Product.find({})
        .sort({ stockQuantity: 1 })
        .limit(8)
        .select("name stockQuantity minThreshold status")
        .lean()
  ]);

  const highPriorityCount = lowStockCount.length > 0 ? lowStockCount[0].highPriorityCount : 0;

  const productSummaries = productsList.map(p => {
    const gap = p.minThreshold - p.stockQuantity;
    const gapPercentage = p.minThreshold > 0 ? (gap / p.minThreshold) * 100 : (gap > 0 ? 100 : 0);

    let healthStatus = "Normal";
    if (p.stockQuantity === 0 || p.status === ProductStatus.OUT_OF_STOCK || gapPercentage >= 75) {
      healthStatus = "High Priority";
    } else if (gapPercentage >= 40) {
      healthStatus = "Medium Priority";
    } else if (gapPercentage > 0) {
      healthStatus = "Low Priority";
    }

    return {
      productName: p.name,
      stockLeft: p.stockQuantity,
      healthStatus
    };
  });

  return {
    totalOrdersToday,
    pendingOrders: pendingOrdersQuery,
    completedOrders: completedOrdersQuery,
    revenueToday:
      revenueResult.length > 0
        ? Math.round(revenueResult[0].totalRevenue * 100) / 100
        : 0,
    lowStockCount: highPriorityCount,
    productSummaries
  };
};
