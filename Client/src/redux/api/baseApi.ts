import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: '/api/proxy',
    credentials: 'include', // No need for credentials to local proxy since we rely on cookies handled by the proxy
});

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQuery,
    tagTypes: ['Auth', 'Category', 'Product', 'Order', 'Restock', 'ActivityLog'],
    endpoints: () => ({}),
});
