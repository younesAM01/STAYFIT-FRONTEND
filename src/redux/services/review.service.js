import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
<<<<<<< HEAD

// Use hardcoded URL for testing
=======
>>>>>>> 495cd1d (change client profile and booking)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
            query: (id) => id ? `/reviews/getreviews?id=${id}` : '/reviews/getreviews',
            providesTags: ['Review']
        }),
        createReview: builder.mutation({
            query: (review) => ({
                url: '/reviews/createreview',
                method: 'POST',
                body: review
            }),
            invalidatesTags: ['Review']
        }),
        updateReview: builder.mutation({
            query: ({ id, ...review }) => ({
                url: `/reviews/updatereview?id=${id}`,
                method: 'PUT',
                body: review
            }),
            invalidatesTags: ['Review']
        }),
        deleteReview: builder.mutation({
            query: (id) => ({
                url: `/reviews/deletereview?id=${id}`,
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
