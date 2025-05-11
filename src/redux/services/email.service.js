import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const emailApi = createApi({
    reducerPath: 'emailApi',
    baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
    endpoints: (builder) => ({
        sendFreeSessionEmail: builder.mutation({
            query: (emailData) => ({
                url: '/contact/free-session',
                method: 'POST',
                body: emailData
            })
        })
    })
})

export const { useSendFreeSessionEmailMutation } = emailApi;
    