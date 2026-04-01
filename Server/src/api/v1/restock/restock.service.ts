import { IProduct, getProductModel } from "../../../api/v1/product/product.model";
import { RestockPriority } from "../../../utils/constants";

export interface RestockItem {
  product: IProduct;
  gap: number;
  priority: RestockPriority;
  gapPercentage: number;
}

export const getRestockQueue = async (): Promise<RestockItem[]> => {
  const Product = getProductModel();
  const products = await Product.find({
    $expr: { $lt: ["$stockQuantity", "$minThreshold"] },
  })
    .populate("category", "name")
    .sort({ stockQuantity: 1 });

  const queue: RestockItem[] = products.map((product) => {
    const gap = product.minThreshold - product.stockQuantity;
    const gapPercentage = product.minThreshold > 0
      ? (gap / product.minThreshold) * 100
      : 100;

    let priority: RestockPriority;
    if (gapPercentage >= 75) {
      priority = RestockPriority.HIGH;
    } else if (gapPercentage >= 40) {
      priority = RestockPriority.MEDIUM;
    } else {
      priority = RestockPriority.LOW;
    }

    return { product, gap, priority, gapPercentage };
  });

  // ✅ Sort by gapPercentage descending (most critical first)
  return queue.sort((a, b) => b.gapPercentage - a.gapPercentage);
};
