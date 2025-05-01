import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Make sure this matches your backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

export const servicesApi = createApi({
    reducerPath: 'servicesApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: BACKEND_URL,
        prepareHeaders: (headers, { getState }) => {
            // Only add headers if we're on the client side
            if (typeof window !== 'undefined') {
                // Add any required headers here
                return headers;
            }
            return headers;
        }
    }),
    tagTypes: ['Services'],
    endpoints: (builder) => ({
        getServices: builder.query({ 
            query: () => {
                console.log('Fetching services from:', `${BACKEND_URL}/services`);
                return '/services';
            },
            transformResponse: (response) => {
                console.log('Raw services response:', response);
                if (response && response.success) {
                    return response.services || [];
                }
                if (response && response.data) {
                    return response.data;
                }
                console.error('Invalid response format:', response);
                return [];
            },
            providesTags: ['Services']
        }),
        getServiceById: builder.query({ 
            query: (id) => `/services/${id}`,
            transformResponse: (response) => {
                if (response && response.success) {
                    return response.service;
                }
                if (response && response.data) {
                    return response.data;
                }
                return null;
            },
            providesTags: (result, error, id) => [{ type: 'Services', id }]
        }),
        createService: builder.mutation({
            query: (service) => ({
                url: '/services',
                method: 'POST',
                body: service
            }),
            transformResponse: (response) => {
                if (response && response.success) {
                    return response.service;
                }
                if (response && response.data) {
                    return response.data;
                }
                throw new Error(response.message || 'Failed to create service');
            },
            invalidatesTags: ['Services']
        }),
        updateService: builder.mutation({
            query: ({ id, ...service }) => ({
                url: `/services/${id}`,
                method: 'PUT',
                body: service
            }),
            transformResponse: (response) => {
                if (response && response.success) {
                    return response.service;
                }
                if (response && response.data) {
                    return response.data;
                }
                throw new Error(response.message || 'Failed to update service');
            },
            invalidatesTags: ['Services']
        }),
        deleteService: builder.mutation({
            query: (id) => ({
                url: `/services/${id}`,
                method: 'DELETE'
            }),
            transformResponse: (response) => {
                if (response && response.success) {
                    return response.service;
                }
                if (response && response.data) {
                    return response.data;
                }
                throw new Error(response.message || 'Failed to delete service');
            },
            invalidatesTags: ['Services']
        })
    })
});

export const { 
    useGetServicesQuery,
    useGetServiceByIdQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation
} = servicesApi;
