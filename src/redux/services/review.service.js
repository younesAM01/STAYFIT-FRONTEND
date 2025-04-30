import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
    endpoints: (builder) => ({
        getReviews: builder.query({ 
            query: (id) => id ? `/getreviews?id=${id}` : '/getreviews',
            providesTags: (result, error, id) => [{ type: 'Review', id }]
        }),
        createReview: builder.mutation({
            query: (review) => ({
                url: '/createreview',
                method: 'POST',
                body: review
            }),
            invalidatesTags: ['Review']
        }),
        updateReview: builder.mutation({
            query: ({ id, ...review }) => ({
                url: `/updatereview?id=${id}`,
                method: 'PUT',
                body: review
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Review', id }]
        }),
        deleteReview: builder.mutation({
            query: (id) => ({
                url: `/deletereview?id=${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Review', id }]
        })
    }),
    tagTypes: ['Review']
});

export const { 
    useGetReviewsQuery,
    useCreateReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation
} = reviewApi;
