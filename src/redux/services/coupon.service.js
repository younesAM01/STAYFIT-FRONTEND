import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const couponApi = createApi({
    reducerPath: 'couponApi',
    baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
    endpoints: (builder) => ({
        getCoupons: builder.query({ 
            query: (id) => id ? `/coupons/getcoupons?id=${id}` : '/coupons/getcoupons',
            providesTags: (result, error, id) => [{ type: 'Coupon', id }]
        }),
        createCoupon: builder.mutation({
            query: (coupon) => ({
                url: '/coupons/createcoupon',
                method: 'POST',
                body: coupon
            }),
            invalidatesTags: ['Coupon']
        }),
        updateCoupon: builder.mutation({
            query: ({ id, ...coupon }) => ({
                url: `/coupons/updatecoupon?id=${id}`,
                method: 'PUT',
                body: coupon
            }),
            invalidatesTags: ['Coupon']        }),
        deleteCoupon: builder.mutation({
            query: (id) => ({
                url: `/coupons/deletecoupon?id=${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Coupon']        })
    }),
    tagTypes: ['Coupon']
});

export const { 
    useGetCouponsQuery,
    useCreateCouponMutation,
    useUpdateCouponMutation,
    useDeleteCouponMutation
} = couponApi;