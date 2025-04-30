import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const clientPackApi = createApi({
  reducerPath: "clientPackApi",
  baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
    endpoints: (builder) => ({
        getClientPacks: builder.query({ 
            query: () => '/clientpacks',
            providesTags: ['ClientPack']
        }),
        getClientPackById: builder.query({ 
            query: (id) => `/clientpacks/${id}`,
            providesTags: (result, error, id) => [{ type: 'ClientPack', id }]
        }),
        getClientPackByClientId: builder.query({
            query: (clientId) => `/clientpacks/client/${clientId}`,
            providesTags: (result, error, clientId) => [{ type: 'ClientPack', clientId }]
        }),
        createClientPack: builder.mutation({
            query: (clientPack) => ({
                url: '/clientpacks',
                method: 'POST',
                body: clientPack
            }),
            invalidatesTags: ['ClientPack']
        }),
        updateClientPack: builder.mutation({
            query: ({ id, ...clientPack }) => ({
                url: `/clientpacks/${id}`,
                method: 'PUT',
                body: clientPack
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'ClientPack', id }]
        }),
        deleteClientPack: builder.mutation({
            query: (id) => ({
                url: `/clientpacks/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'ClientPack', id }]
        })
    }),
    tagTypes: ['ClientPack']
});

export const { 
    useGetClientPacksQuery,
    useGetClientPackByIdQuery,
    useCreateClientPackMutation,
    useUpdateClientPackMutation,
    useDeleteClientPackMutation,
    useGetClientPackByClientIdQuery
} = clientPackApi;