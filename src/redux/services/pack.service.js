import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
console.log(BACKEND_URL);

export const packApi = createApi({
    reducerPath: 'packApi',
    baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
    endpoints: (builder) => ({
        getPacks: builder.query({ 
            query: () => '/packs',
            providesTags: ['Pack']
        }),
        getPackById: builder.query({ 
            query: (id) => `/packs/${id}`,
            providesTags: (result, error, id) => [{ type: 'Pack', id }]
        }),
        createPack: builder.mutation({
            query: (pack) => ({
                url: '/packs',
                method: 'POST',
                body: pack
            }),
            invalidatesTags: ['Pack']
        }),
        updatePack: builder.mutation({
            query: ({ id, ...pack }) => ({
                url: `/packs/${id}`,
                method: 'PUT',
                body: pack
            }),
            invalidatesTags: ['Pack'],
            onQueryStarted: async ({ id, ...patch }, { dispatch, queryFulfilled }) => {
                const patchResult = dispatch(
                    packApi.util.updateQueryData('getPacks', undefined, (draft) => {
                        const pack = draft.packs.find(p => p._id === id)
                        if (pack) {
                            Object.assign(pack, patch)
                        }
                    })
                )
                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            }
        }),
        deletePack: builder.mutation({
            query: (id) => ({
                url: `/packs/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Pack']
        })
    }),
    tagTypes: ['Pack']
});

export const { 
    useGetPacksQuery,
    useGetPackByIdQuery,
    useCreatePackMutation,
    useUpdatePackMutation,
    useDeletePackMutation
} = packApi;