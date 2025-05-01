import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use hardcoded URL for testing
const BACKEND_URL = 'http://localhost:5500'

export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: BACKEND_URL,
        prepareHeaders: (headers) => {
            headers.set('Content-Type', 'application/json');
            return headers;
        }
    }),
    endpoints: (builder) => ({
        getReviews: builder.query({ 
            query: (id) => id ? `/api/reviews/getreviews?id=${id}` : '/api/reviews/getreviews',
            providesTags: ['Review']
        }),
        createReview: builder.mutation({
            query: (review) => ({
                url: '/api/reviews/createreview',
                method: 'POST',
                body: review
            }),
            invalidatesTags: ['Review']
        }),
        updateReview: builder.mutation({
            query: ({ id, ...review }) => ({
                url: `/api/reviews/updatereview?id=${id}`,
                method: 'PUT',
                body: review
            }),
            invalidatesTags: ['Review']
        }),
        deleteReview: builder.mutation({
            query: (id) => ({
                url: `/api/reviews/deletereview?id=${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Review']
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
