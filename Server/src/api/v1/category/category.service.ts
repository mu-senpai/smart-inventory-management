import { ApiError } from "../../../utils/ApiError";
import { paginate, PaginationParams, PaginatedResult } from "../../../utils/paginationHelper";
import { getCategoryModel, ICategory } from "./category.model";
import { getProductModel } from "../product/product.model";

export const getAll = async (
  params: PaginationParams
): Promise<PaginatedResult<ICategory>> => {
  const Category = getCategoryModel();
  return paginate(Category, params, {
    searchFields: ["name"],
    sort: { name: 1 },
  });
};

export const getById = async (id: string): Promise<ICategory> => {
  const Category = getCategoryModel();
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound("Category not found");
  return category;
};

export const create = async (
  data: Pick<ICategory, "name"> & Partial<Pick<ICategory, "description">>
): Promise<ICategory> => {
  const Category = getCategoryModel();
  return Category.create(data);
};

export const update = async (
  id: string,
  data: Partial<Pick<ICategory, "name" | "description">>
): Promise<ICategory> => {
  const Category = getCategoryModel();
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
};

export const remove = async (id: string): Promise<void> => {
  const Category = getCategoryModel();
  const Product = getProductModel();
  // Check if any products use this category
  const linkedProductsCount = await Product.countDocuments({ category: id });
  if (linkedProductsCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete category: It is currently linked to ${linkedProductsCount} product(s). Please reassign or delete these products first.`
    );
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) throw ApiError.notFound("Category not found");
};
