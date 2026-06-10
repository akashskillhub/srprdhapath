import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const materialsApi = createApi({
  reducerPath: 'materialsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Material'],
  endpoints: (builder) => ({
    getMaterials: builder.query({
      query: (subjectId) => `/materials/subject/${subjectId}`,
      transformResponse: (res) => res?.data || [],
      providesTags: (result, error, subjectId) => [{ type: 'Material', id: subjectId }],
    }),
    createMaterial: builder.mutation({
      query: (formData) => ({ url: '/materials', method: 'POST', body: formData }),
      invalidatesTags: ['Material'],
    }),
    updateMaterial: builder.mutation({
      query: ({ id, formData }) => ({ url: `/materials/${id}`, method: 'PUT', body: formData }),
      invalidatesTags: ['Material'],
    }),
    deleteMaterial: builder.mutation({
      query: (id) => ({ url: `/materials/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Material'],
    }),
  }),
});

export const {
  useGetMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} = materialsApi;
