import { baseApi } from './baseApi';
import { GetRestockQueueResponse } from '@/type/type';

export const restockApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getRestockQueue: builder.query<GetRestockQueueResponse, void>({
            query: () => ({
                url: '/restock/queue',
                method: 'GET',
            }),
            providesTags: ['Restock', 'Product'],
        }),
    }),
});

export const { useGetRestockQueueQuery } = restockApi;
