import { baseApi } from './baseApi';
import {
    CreateOrderRequest,
    GetOrdersParams,
    GetOrdersResponse,
    SingleOrderResponse,
    UpdateOrderStatusRequest,
} from '@/type/type';

export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getOrders: builder.query<GetOrdersResponse, GetOrdersParams>({
            query: (params) => ({
                url: '/orders',
                method: 'GET',
                params: {
                    page: params.page,
                    limit: params.limit,
                    ...(params.status && { status: params.status }),
                    ...(params.searchTerm && { searchTerm: params.searchTerm }),
                },
            }),
            providesTags: ['Order'],
        }),
        getSingleOrder: builder.query<SingleOrderResponse, string>({
            query: (id) => ({
                url: `/orders/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Order', id }],
        }),
        createOrder: builder.mutation<SingleOrderResponse, CreateOrderRequest>({
            query: (data) => ({
                url: '/orders',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Order', 'Product', 'Restock', 'ActivityLog'],
        }),
        updateOrderStatus: builder.mutation<SingleOrderResponse, UpdateOrderStatusRequest>({
            query: ({ id, status }) => ({
                url: `/orders/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Order', id },
                'Order',
                'ActivityLog'
            ],
        }),
        deleteOrder: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/orders/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Order', 'Product', 'Restock', 'ActivityLog'],
        }),
    }),
});

export const {
    useGetOrdersQuery,
    useGetSingleOrderQuery,
    useCreateOrderMutation,
    useUpdateOrderStatusMutation,
    useDeleteOrderMutation,
} = orderApi;
