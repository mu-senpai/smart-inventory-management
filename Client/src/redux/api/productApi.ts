import { ApiAdapter, UIProduct } from '@/services/apiAdapter';
import {
    CreateProductRequest,
    GetProductsParams,
    GetProductsResponse,
    SingleProductResponse,
    UpdateProductRequest,
} from '@/type/type';
import { baseApi } from './baseApi';

interface GetUIProductsResponse extends Omit<GetProductsResponse, 'data'> {
    data: UIProduct[];
}

interface SingleUIProductResponse extends Omit<SingleProductResponse, 'data'> {
    data: UIProduct;
}

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query<GetUIProductsResponse, GetProductsParams>({
            query: (params) => ({
                url: '/products',
                params: {
                    ...(params.page       && { page:       params.page }),
                    ...(params.limit      && { limit:      params.limit }),
                    ...(params.searchTerm && { searchTerm: params.searchTerm }),
                },
            }),
            transformResponse: (response: any) => ({
                ...response,
                data: ApiAdapter.adaptProductList(response.data),
            }),
            providesTags: ['Product'],
        }),

        getProduct: builder.query<SingleUIProductResponse, string>({
            query: (id) => `/products/${id}`,
            transformResponse: (response: any) => ({
                ...response,
                data: ApiAdapter.adaptProductDetailed(response.data),
            }),
            providesTags: ['Product'],
        }),

        createProduct: builder.mutation<SingleUIProductResponse, CreateProductRequest>({
            query: (body) => ({
                url: '/products',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Product'],
        }),

        updateProduct: builder.mutation<SingleUIProductResponse, UpdateProductRequest>({
            query: ({ id, data }) => ({
                url: `/products/${id}`,
                method: 'PATCH',
                body: data,
            }),
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    productApi.util.updateQueryData('getProducts', {}, (draft) => {
                        const product = draft.data.find((p) => p.id === id);
                        if (product) {
                            if (data.stockQuantity !== undefined) {
                                product.stockQuantity = data.stockQuantity;
                                const gap = product.minThreshold - product.stockQuantity;
                                if (gap > 0) {
                                    const ratio = gap / product.minThreshold;
                                    product.priority = ratio >= 0.75 ? "High" : ratio >= 0.5 ? "Medium" : "Low";
                                } else {
                                    product.priority = "Normal";
                                }
                            }
                            Object.assign(product, data);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: ['Product'],
        }),

        deleteProduct: builder.mutation<SingleProductResponse, string>({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = productApi;
