import { baseApi } from './baseApi';
import { GetActivityLogsResponse } from '@/type/type';

export const activityLogApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getActivityLogs: builder.query<GetActivityLogsResponse, void>({
            query: () => ({
                url: '/activity-logs',
                method: 'GET',
            }),
            providesTags: ['ActivityLog'],
        }),
    }),
});

export const { useGetActivityLogsQuery } = activityLogApi;
