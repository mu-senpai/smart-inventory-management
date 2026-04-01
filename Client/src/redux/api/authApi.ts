import { baseApi } from './baseApi';

import {
    GetMeResponse,
    LoginRequest,
    LoginResponse,
    SignupRequest,
    SignupResponse
} from '@/type/type';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        signup: builder.mutation<SignupResponse, SignupRequest>({
            query: (data) => ({
                url: '/auth/signup',
                method: 'POST',
                body: data,
            }),
        }),
        demoLogin: builder.mutation<LoginResponse, void>({
            query: () => ({
                url: '/auth/demo-login',
                method: 'POST',
            }),
        }),
        getMe: builder.query<GetMeResponse, void>({
            query: () => '/users/me',
            providesTags: ['Auth'],
        }),
    }),
});

export const {
    useLoginMutation,
    useSignupMutation,
    useDemoLoginMutation,
    useGetMeQuery,
    useLazyGetMeQuery,
} = authApi;
