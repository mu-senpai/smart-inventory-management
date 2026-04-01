import { Model, FilterQuery, SortOrder } from "mongoose";

export interface PaginationParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

/**
 * Reusable pagination helper for Mongoose models.
 * Supports text search across multiple fields and custom filters.
 */
export const paginate = async <T>(
  model: Model<T>,
  params: PaginationParams,
  options: {
    searchFields?: string[];
    filter?: FilterQuery<T>;
    populate?: string | { path: string; select?: string };
    sort?: Record<string, SortOrder>;
  } = {}
): Promise<PaginatedResult<T>> => {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
  const skip = (page - 1) * limit;

  // Build search conditions
  let searchFilter: FilterQuery<T> = {};
  if (params.searchTerm && options.searchFields?.length) {
    const regex = new RegExp(params.searchTerm, "i");
    searchFilter = {
      $or: options.searchFields!.map((field) => ({ [field]: regex })),
    } as FilterQuery<T>;
  }

  // Merge search + custom filters
  const finalFilter: FilterQuery<T> = {
    ...searchFilter,
    ...(options.filter || {}),
  } as FilterQuery<T>;

  const [data, total] = await Promise.all([
    model
      .find(finalFilter)
      .populate(options.populate as any)
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    model.countDocuments(finalFilter),
  ]);

  return {
    data: data as T[],
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};
