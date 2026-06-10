import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getBaseUrl } from '../../utils/config';

export const shortTricksApi = createApi({
  reducerPath: 'shortTricksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ShortTrick', 'Folder'],
  endpoints: (builder) => ({
    getShortTricks: builder.query({
      query: (subjectId) => `/short-tricks/subject/${subjectId}`,
      providesTags: ['ShortTrick'],
    }),
    createShortTrick: builder.mutation({
      query: (formData) => ({
        url: '/short-tricks',
        method: 'POST',
        body: formData,
        // Header for multipart/form-data is usually set automatically by the browser/app when sending FormData
      }),
      invalidatesTags: ['ShortTrick'],
    }),
    updateShortTrick: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/short-tricks/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['ShortTrick'],
    }),
    deleteShortTrick: builder.mutation({
      query: (id) => ({
        url: `/short-tricks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShortTrick'],
    }),
  }),
});

export const {
  useGetShortTricksQuery,
  useCreateShortTrickMutation,
  useUpdateShortTrickMutation,
  useDeleteShortTrickMutation,
} = shortTricksApi;
