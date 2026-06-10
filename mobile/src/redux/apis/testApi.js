import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const testApi = createApi({
  reducerPath: 'testApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Test', 'TestQuestion'],
  endpoints: (builder) => ({
    getTests: builder.query({
      query: (difficulty) => `/tests?difficulty=${difficulty}`,
      transformResponse: (res) => res?.data || [],
      providesTags: (result, error, difficulty) => [{ type: 'Test', id: difficulty }],
    }),
    createTest: builder.mutation({
      query: (body) => ({ url: '/tests', method: 'POST', body }),
      invalidatesTags: ['Test'],
    }),
    updateTest: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/tests/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Test'],
    }),
    deleteTest: builder.mutation({
      query: (id) => ({ url: `/tests/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Test'],
    }),
    getTestQuestions: builder.query({
      query: (testId) => `/tests/${testId}/questions`,
      transformResponse: (res) => res?.data || [],
      providesTags: (result, error, testId) => [{ type: 'TestQuestion', id: testId }],
    }),
    createTestQuestion: builder.mutation({
      query: (formData) => ({ url: '/tests/questions', method: 'POST', body: formData }),
      invalidatesTags: ['TestQuestion'],
    }),
    updateTestQuestion: builder.mutation({
      query: ({ id, formData }) => ({ url: `/tests/questions/${id}`, method: 'PUT', body: formData }),
      invalidatesTags: ['TestQuestion'],
    }),
    deleteTestQuestion: builder.mutation({
      query: (id) => ({ url: `/tests/questions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TestQuestion'],
    }),
  }),
});

export const {
  useGetTestsQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  useGetTestQuestionsQuery,
  useCreateTestQuestionMutation,
  useUpdateTestQuestionMutation,
  useDeleteTestQuestionMutation,
} = testApi;
