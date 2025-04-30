import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const servicesApi = createApi({
    reducerPath: 'servicesApi',
    baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
    endpoints: (builder) => ({
        getServices: builder.query({ query: () => '/services' }),
        getServiceById: builder.query({ 
            query: (id) => `/services/${id}`,
            providesTags: (result, error, id) => [{ type: 'Service', id }]
        }),
        createService: builder.mutation({
            query: (service) => ({
                url: '/services',
                method: 'POST',
                body: service
            }),
            invalidatesTags: ['Service']
        }),
        updateService: builder.mutation({
            query: ({ id, ...service }) => ({
                url: `/services/${id}`,
                method: 'PUT',
                body: service
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Service', id }]
        }),
        deleteService: builder.mutation({
            query: (id) => ({
                url: `/services/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Service', id }]
        })
    }),
    tagTypes: ['Service']
});

export const { 
    useGetServicesQuery,
    useGetServiceByIdQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation
} = servicesApi;
