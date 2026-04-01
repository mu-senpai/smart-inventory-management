import { baseApi } from './baseApi';

import {
  CreateCategoryRequest,
  GetCategoriesParams,
  GetCategoriesResponse,
  SingleCategoryResponse,
  UpdateCategoryRequest
} from '@/type/type';

// ── Endpoints ──────────────────────────────────────────

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<GetCategoriesResponse, GetCategoriesParams>({
            query: (params) => ({
                url: '/categories',
                params: {
                    ...(params.page && { page: params.page }),
                    ...(params.limit && { limit: params.limit }),
                    ...(params.searchTerm && { searchTerm: params.searchTerm }),
                },
            }),
            providesTags: ['Category'],
        }),

        getCategory: builder.query<SingleCategoryResponse, string>({
            query: (id) => `/categories/${id}`,
            providesTags: ['Category'],
        }),

        createCategory: builder.mutation<SingleCategoryResponse, CreateCategoryRequest>({
            query: (body) => ({
                url: '/categories',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Category'],
        }),

        updateCategory: builder.mutation<SingleCategoryResponse, UpdateCategoryRequest>({
            query: ({ id, data }) => ({
                url: `/categories/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Category'],
        }),

        deleteCategory: builder.mutation<SingleCategoryResponse, string>({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;
