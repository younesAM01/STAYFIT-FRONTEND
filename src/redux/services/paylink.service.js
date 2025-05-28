import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const paylinkApi = createApi({
    reducerPath: 'paylinkApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: BACKEND_URL,
        prepareHeaders: (headers) => {
            headers.set('Content-Type', 'application/json');
            return headers;
        }
    }),
    endpoints: (builder) => ({
        createPaylinkInvoice: builder.mutation({
            query: (invoiceData) => ({
                url: '/paylink',
                method: 'POST',
                body: invoiceData
            })
        }),
        verifyPayment: builder.query({
            query: (invoiceId) => `/paylink/verify-payment/${invoiceId}`
        })
    })
});

export const {
    useCreatePaylinkInvoiceMutation,
    useVerifyPaymentQuery
} = paylinkApi;

