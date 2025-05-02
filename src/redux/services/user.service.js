import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
  endpoints: (builder) => ({
    getUser: builder.query({
      query: () => "/users",
      providesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    getUserBySupabaseId: builder.query({
      query: (supabaseId) => `/users/supabase/${supabaseId}`,
      providesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    getCoach: builder.query({
      query: () => "/users/coach",
      providesTags: (result, error, ) => [{ type: "User" }],
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: "/users",
        method: "POST",
        body: user,
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    updateUser: builder.mutation({
      query: ({ id, user }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: user,
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
  }),
  tagTypes: ["User"],
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
