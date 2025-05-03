import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: BACKEND_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUser: builder.query({
      query: () => "/users",
      
      providesTags: ['User']
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      
      providesTags: (result, error, id) => [{ type: 'User', id }]
    }),
    getUserBySupabaseId: builder.query({
      query: (supabaseId) => `/users/supabase/${supabaseId}`,
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: "/users",
        method: "POST",
        body: user,
      }),
    }),
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: userData
      }),
     
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE"
      }),
     
      invalidatesTags: ['User']
    })
  })
});

export const {
  useGetUserQuery,
  useGetUserByIdQuery,
  useGetUserBySupabaseIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} = userApi;