import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';

// Use local IP for testing with physical devices
// Load from .env (Expo modern approach)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web' 
  ? 'http://localhost:5000/api' 
  : 'http://192.168.0.103:5000/api');

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the auth slice
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Folders', 'Questions', 'News'],
  endpoints: (builder) => ({
    // Auth Mutations
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Folder Queries & Mutations
    getFolders: builder.query({
      query: (params) => ({
        url: '/folders',
        params: params,
      }),
      providesTags: ['Folders'],
    }),
    createFolder: builder.mutation({
      query: (newFolder) => ({
        url: '/folders',
        method: 'POST',
        body: newFolder,
      }),
      invalidatesTags: ['Folders'],
    }),
    updateFolder: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/folders/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Folders'],
    }),
    deleteFolder: builder.mutation({
      query: (id) => ({
        url: `/folders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Folders'],
    }),

    // Question Queries & Mutations
    getFolderQuestions: builder.query({
      query: (folderId) => `/folders/${folderId}/questions`,
      providesTags: ['Questions'],
    }),
    getRandomQuestions: builder.query({
      query: (params) => ({
        url: '/admin/questions',
        params: { ...params, random: true },
      }),
      providesTags: ['Questions'],
    }),
    getQuestions: builder.query({
      query: (folderId) => `/questions?folderId=${folderId}`,
      providesTags: ['Questions'],
    }),
    createQuestion: builder.mutation({
      query: (newQuestion) => ({
        url: '/admin/questions',
        method: 'POST',
        body: newQuestion,
      }),
      invalidatesTags: ['Questions'],
    }),
    updateQuestion: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/questions/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Questions'],
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/admin/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Questions'],
    }),

    // Practice Questions
    getPracticeQuestions: builder.query({
      query: (params) => ({
        url: '/practice-questions',
        params,
      }),
      providesTags: ['Questions'],
    }),
    createPracticeQuestion: builder.mutation({
      query: (newQuestion) => ({
        url: '/practice-questions',
        method: 'POST',
        body: newQuestion,
      }),
      invalidatesTags: ['Questions'],
    }),

    // News/Current Affairs
    getNotes: builder.query({
      query: () => '/admin/notes',
      providesTags: ['News'],
    }),
    getNewspapers: builder.query({
      query: () => '/admin/newspapers',
      providesTags: ['News'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetQuestionsQuery,
  useGetFolderQuestionsQuery,
  useGetRandomQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetPracticeQuestionsQuery,
  useCreatePracticeQuestionMutation,
  useGetNotesQuery,
  useGetNewspapersQuery,
} = apiSlice;
