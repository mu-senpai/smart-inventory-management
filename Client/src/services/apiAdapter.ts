import { ProductSchema } from "../types/schemas";

export type UIProduct = {
    id: string;
    name: string;
    categoryId: string;
    categoryName: string;
    price: number;
    stockQuantity: number;
    minThreshold: number;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    priority: string;
};

export const ApiAdapter = {
    /**
     * Adapts a Mongoose/Zod backend product strictly into the generic UI shape.
     * Calculates restock priority tags during the transformation.
     */
    adaptProductDetailed(rawItem: unknown): UIProduct {
        // 1. Zod Validation — throws if strict type mismatch occurs
        const product = ProductSchema.parse(rawItem);

        // 2. Computed priority tag
        let priorityTag = "Low";
        const gap = product.minThreshold - product.stockQuantity;

        if (gap > 0) {
            const ratio = gap / product.minThreshold;
            if (ratio >= 0.75) {
                priorityTag = "High";
            } else if (ratio >= 0.5) {
                priorityTag = "Medium";
            } else {
                priorityTag = "Low";
            }
        } else {
            priorityTag = "Normal";
        }

        // 3. Safely extract category info
        // populate() sends an object; un-populated sends a plain ObjectId string
        const catIsObj = typeof product.category === "object" && product.category !== null;
        const categoryId   = catIsObj ? (product.category as any)._id        : product.category;
        const categoryName = catIsObj ? (product.category as any).name ?? "Unknown" : "Unknown";

        // 4. Data transformation — map `_id` → `id`, normalise dates
        return {
            id:            product._id,
            name:          product.name,
            categoryId,
            categoryName,
            price:         product.price,
            stockQuantity: product.stockQuantity,
            minThreshold:  product.minThreshold,
            description:   product.description ?? "",
            status:        product.status,
            createdAt:     product.createdAt ?? new Date().toISOString(),
            updatedAt:     product.updatedAt ?? new Date().toISOString(),
            priority:      priorityTag,
        };
    },

    adaptProductList(rawItems: unknown[]): UIProduct[] {
        if (!Array.isArray(rawItems)) return [];

        return rawItems
            .map((item) => {
                try {
                    return this.adaptProductDetailed(item);
                } catch (e) {
                    console.error("Zod Validation Error on Product:", e);
                    return null;
                }
            })
            .filter((p): p is UIProduct => p !== null);
    },
};
