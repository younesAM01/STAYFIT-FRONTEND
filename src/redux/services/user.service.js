import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
  endpoints: (builder) => ({
    getUser: builder.query({
      query: () => "/users",
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
    }),
    getUserBySupabaseId: builder.query({
      query: (supabaseId) => `/users/supabase/${supabaseId}`,
    }),
    getCoach: builder.query({
      query: () => "/users/coach",
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: "/users",
        method: "POST",
        body: user,
      }),
    }),
    updateUser: builder.mutation({
      query: ({ id, user }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: user,
      }),
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});
export const {
  useGetUserQuery,
  useGetUserByIdQuery,
  useGetUserBySupabaseIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetCoachQuery,
} = userApi;
