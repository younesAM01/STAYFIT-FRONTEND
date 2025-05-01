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
      transformResponse: (response) => {
        if (response && response.success) {
          return response.users;
        }
        return [];
      },
      providesTags: ['User']
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      transformResponse: (response) => {
        if (response && response.success) {
          return response.user;
        }
        return null;
      },
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
      transformResponse: (response) => {
        if (response && response.success) {
          return response;
        }
        throw new Error(response.message || 'Failed to update user');
      },
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data?.message || 'An error occurred while updating the user'
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE"
      }),
      transformResponse: (response) => {
        if (response && response.success) {
          return response;
        }
        throw new Error(response.message || 'Failed to delete user');
      },
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