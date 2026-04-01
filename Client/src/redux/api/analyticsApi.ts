import { baseApi } from './baseApi';
import { DashboardSummaryResponse } from '@/type/type';

export const dashboardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardSummary: builder.query<DashboardSummaryResponse, void>({
            query: () => '/dashboard/summary',
            providesTags: ['Order', 'Product', 'Category'],
        }),
    }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
