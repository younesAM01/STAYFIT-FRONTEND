import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
  endpoints: (builder) => ({
    getUser: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ["User"],
    }),
    getUserBySupabaseId: builder.query({
      query: (supabaseId) => `/users/supabase/${supabaseId}`,
      providesTags: ["User"],
    }),
    getCoach: builder.query({
      query: () => "/users/coach",
      providesTags: ["User"],
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: "/users",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ id, user }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: user,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
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
