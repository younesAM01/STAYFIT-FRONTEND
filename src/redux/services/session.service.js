import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const sessionApi = createApi({
  reducerPath: "sessionApi",
  baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
  endpoints: (builder) => ({
    getSessions: builder.query({
      query: () => "/sessions",
      providesTags: ["Session"],
    }),
    getSessionById: builder.query({
      query: (id) => `/sessions/${id}`,
      providesTags: ["Session"],
    }),
    getSessionsByClientId: builder.query({
      query: (id) => `/sessions/client/${id}`,
      providesTags: ["Session"],
    }),
    getSessionsByCoachId: builder.query({
      query: (id) => `/sessions/coach/${id}`,
      providesTags: ["Session"],
    }),
    createSession: builder.mutation({
      query: (session) => ({
        url: "/sessions",
        method: "POST",
        body: session,
      }),
      invalidatesTags: ["Session"],
    }),
    updateSession: builder.mutation({
      query: ({ id, ...session }) => ({
        url: `/sessions/${id}`,
        method: "PUT",
        body: session,
      }),
      invalidatesTags: ["Session"],
    }),
    deleteSession: builder.mutation({
      query: (id) => ({
        url: `/sessions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Session"],
    }),
    cancelSession: builder.mutation({
      query: (id) => ({
        url: `/sessions/cancel/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Session"],
    }),
    completeSession: builder.mutation({
      query: (id) => ({
        url: `/sessions/complete/${id}`,
        method: "PUT",
      }),
    }),
  }),
  tagTypes: ["Session"],
});

export const {
  useGetSessionsQuery,
  useGetSessionByIdQuery,
  useGetSessionsByClientIdQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useCancelSessionMutation,
  useCompleteSessionMutation,
  useGetSessionsByCoachIdQuery,
} = sessionApi;