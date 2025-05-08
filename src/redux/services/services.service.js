import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Make sure this matches your backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

export const servicesApi = createApi({
    reducerPath: 'servicesApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: BACKEND_URL,
    }),
    tagTypes: ['Services'],
    endpoints: (builder) => ({
        getServices: builder.query({ 
            query: () => {
                return '/services';
            },
           
            providesTags: ['Services']
        }),
        getServiceById: builder.query({ 
            query: (id) => `/services/${id}`,
        
            providesTags: ['Services']
        }),
        createService: builder.mutation({
            query: (service) => ({
                url: '/services',
                method: 'POST',
                body: service
            }),
            
            invalidatesTags: ['Services']
        }),
        updateService: builder.mutation({
            query: ({ id, ...service }) => ({
                url: `/services/${id}`,
                method: 'PUT',
                body: service
            }),
           
            invalidatesTags: ['Services']
        }),
        deleteService: builder.mutation({
            query: (id) => ({
                url: `/services/${id}`,
                method: 'DELETE'
            }),
            
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