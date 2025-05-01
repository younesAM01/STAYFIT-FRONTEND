import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const couponApi = createApi({
    reducerPath: 'couponApi',
    baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
    endpoints: (builder) => ({
        getCoupons: builder.query({ 
            query: (id) => id ? `/getcoupons?id=${id}` : '/getcoupons',
            providesTags: (result, error, id) => [{ type: 'Coupon', id }]
        }),
        createCoupon: builder.mutation({
            query: (coupon) => ({
                url: '/createcoupon',
                method: 'POST',
                body: coupon
            }),
            invalidatesTags: ['Coupon']
        }),
        updateCoupon: builder.mutation({
            query: ({ id, ...coupon }) => ({
                url: `/updatecoupon?id=${id}`,
                method: 'PUT',
                body: coupon
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Coupon', id }]
        }),
        deleteCoupon: builder.mutation({
            query: (id) => ({
                url: `/deletecoupon?id=${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Coupon', id }]
        })
    }),
    tagTypes: ['Coupon']
});

export const { 
    useGetCouponsQuery,
    useCreateCouponMutation,
    useUpdateCouponMutation,
    useDeleteCouponMutation
} = couponApi;