import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const sessionApi = createApi({
    reducerPath: 'sessionApi',
    baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
    endpoints: (builder) => ({
        getSessions: builder.query({ 
            query: () => '/sessions',
            providesTags: ['Session']
        }),
        getSessionById: builder.query({ 
            query: (id) => `/sessions/${id}`,
            providesTags: (result, error, id) => [{ type: 'Session', id }]
        }),
        createSession: builder.mutation({
            query: (session) => ({
                url: '/sessions',
                method: 'POST',
                body: session
            }),
            invalidatesTags: ['Session']
        }),
        updateSession: builder.mutation({
            query: ({ id, ...session }) => ({
                url: `/sessions/${id}`,
                method: 'PUT',
                body: session
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Session', id }]
        }),
        deleteSession: builder.mutation({
            query: (id) => ({
                url: `/sessions/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Session', id }]
        })
    }),
    tagTypes: ['Session']
});

export const { 
    useGetSessionsQuery,
    useGetSessionByIdQuery,
    useCreateSessionMutation,
    useUpdateSessionMutation,
    useDeleteSessionMutation
} = sessionApi;
