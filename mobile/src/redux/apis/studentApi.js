import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

/**
 * Global API for Student & Admin features.
 * Unified cache invalidation allows cross-role updates instantly.
 */
export const studentApi = createApi({
  reducerPath: 'studentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Folders', 'Questions', 'News', 'Students', 'Contacts'],
  endpoints: (builder) => ({
    // Folders
    getFolders: builder.query({
      query: (params) => ({ url: '/folders', params }),
      providesTags: ['Folders'],
    }),
    createFolder: builder.mutation({
      query: (newFolder) => ({ url: '/folders', method: 'POST', body: newFolder }),
      invalidatesTags: ['Folders'],
    }),
    updateFolder: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/folders/${id}`, method: 'PUT', body: patch }),
      invalidatesTags: ['Folders'],
    }),
    deleteFolder: builder.mutation({
      query: (id) => ({ url: `/folders/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Folders'],
    }),

    // PYQ Hub
    getPYQCategories: builder.query({
      query: () => '/pyqhub/categories',
      providesTags: ['Folders'],
    }),
    getPYQSubjects: builder.query({
      query: () => '/pyqhub/subjects',
      providesTags: ['Folders'],
    }),
    getPYQYears: builder.query({
      query: (params) => ({ url: '/pyqhub/years', params }),
      providesTags: ['Folders'],
    }),
    getPYQGroups: builder.query({
      query: () => '/pyqhub/groups',
      providesTags: ['Folders'],
    }),
    getPYQQuestions: builder.query({
      query: (params) => ({ url: '/pyqhub/questions', params }),
      providesTags: ['Questions'],
    }),
    createPYQGroup: builder.mutation({
      query: (body) => ({ url: '/pyqhub/groups', method: 'POST', body }),
      invalidatesTags: ['Folders'],
    }),
    createPYQSubject: builder.mutation({
      query: (body) => ({ url: '/pyqhub/subjects', method: 'POST', body }),
      invalidatesTags: ['Folders'],
    }),
    createPYQYear: builder.mutation({
      query: (body) => ({ url: '/pyqhub/years', method: 'POST', body }),
      invalidatesTags: ['Folders'],
    }),
    updatePYQHubFolder: builder.mutation({
      query: ({ id, name }) => ({ url: `/pyqhub/folders/${id}`, method: 'PUT', body: { name } }),
      invalidatesTags: ['Folders'],
    }),
    deletePYQHubFolder: builder.mutation({
      query: (id) => ({ url: `/pyqhub/folders/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Folders'],
    }),
    createPYQQuestion: builder.mutation({
      query: (formData) => ({ url: '/pyqhub/questions', method: 'POST', body: formData }),
      invalidatesTags: ['Questions'],
    }),
    deletePYQQuestion: builder.mutation({
      query: (id) => ({ url: `/pyqhub/questions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Questions'],
    }),
    updatePYQQuestion: builder.mutation({
      query: ({ id, formData }) => ({ url: `/pyqhub/questions/${id}`, method: 'PUT', body: formData }),
      invalidatesTags: ['Questions'],
    }),

    // Questions (Legacy/Mobile Support)
    getQuestions: builder.query({
      query: (folderId) => `/student/questions?folderId=${folderId}`,
      providesTags: ['Questions'],
    }),
    createQuestion: builder.mutation({
      query: (newQuestion) => ({ url: '/admin/questions', method: 'POST', body: newQuestion }),
      invalidatesTags: ['Questions'],
    }),
    updateQuestion: builder.mutation({
      query: ({ id, formData }) => ({ url: `/admin/questions/${id}`, method: 'PUT', body: formData }),
      invalidatesTags: ['Questions'],
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({ url: `/admin/questions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Questions'],
    }),

    // Practice Hub
    getPracticeSubjects: builder.query({
      query: () => '/practice-questions/subjects',
      providesTags: ['Folders'],
    }),
    getPracticeChapters: builder.query({
      query: (subjectId) => `/practice-questions/chapters/${subjectId}`,
      providesTags: ['Folders'],
    }),
    createPracticeSubject: builder.mutation({
      query: (body) => ({ url: '/practice-questions/subjects', method: 'POST', body }),
      invalidatesTags: ['Folders'],
    }),
    updatePracticeSubject: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/practice-questions/subjects/${id}`, method: 'PUT', body: patch }),
      invalidatesTags: ['Folders'],
    }),
    deletePracticeSubject: builder.mutation({
      query: (id) => ({ url: `/practice-questions/subjects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Folders'],
    }),
    createPracticeChapter: builder.mutation({
      query: (body) => ({ url: '/practice-questions/chapters', method: 'POST', body }),
      invalidatesTags: ['Folders'],
    }),
    updatePracticeChapter: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/practice-questions/chapters/${id}`, method: 'PUT', body: patch }),
      invalidatesTags: ['Folders'],
    }),
    deletePracticeChapter: builder.mutation({
      query: (id) => ({ url: `/practice-questions/chapters/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Folders'],
    }),

    getPracticeQuestions: builder.query({
      query: (params) => ({ url: '/questions', params: { ...params, type: 'Practice' } }),
      providesTags: ['Questions'],
    }),
    createPracticeQuestion: builder.mutation({
      query: (formData) => ({ url: '/admin/questions', method: 'POST', body: formData }),
      invalidatesTags: ['Questions'],
    }),
    deletePracticeQuestion: builder.mutation({
      query: (id) => ({ url: `/admin/questions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Questions'],
    }),

    // CMS View Queries
    getNotes: builder.query({
      query: () => '/admin/notes',
      providesTags: ['News'],
    }),
    addNote: builder.mutation({
      query: (formData) => ({ url: '/admin/notes', method: 'POST', body: formData }),
      invalidatesTags: ['News'],
    }),
    updateNote: builder.mutation({
      query: ({ id, formData }) => ({ url: `/admin/notes/${id}`, method: 'PUT', body: formData }),
      invalidatesTags: ['News'],
    }),
    deleteNote: builder.mutation({
      query: (id) => ({ url: `/admin/notes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['News'],
    }),
    getNewspapers: builder.query({
      query: () => '/admin/newspapers',
      providesTags: ['News'],
    }),
    addNewspaper: builder.mutation({
      query: (body) => ({ url: '/admin/newspapers', method: 'POST', body }),
      invalidatesTags: ['News'],
    }),
    deleteNewspaper: builder.mutation({
      query: (id) => ({ url: `/admin/newspapers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['News'],
    }),
    getStudents: builder.query({
      query: () => '/admin/students',
      providesTags: ['Students'],
    }),
    updateStudentStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/students/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Students'],
    }),
    getAllStudentsProgress: builder.query({
      query: () => '/admin/students/progress',
      providesTags: ['Questions'],
    }),
    saveProgress: builder.mutation({
      query: (data) => ({ url: '/student/progress', method: 'POST', body: data }),
      invalidatesTags: ['Questions'],
    }),
    getProgress: builder.query({
      query: () => '/student/progress',
      providesTags: ['Questions'],
    }),
    getContactQueries: builder.query({
      query: () => '/contacts',
      providesTags: ['Contacts'],
    }),
    submitContactQuery: builder.mutation({
      query: (body) => ({ url: '/contacts', method: 'POST', body }),
      invalidatesTags: ['Contacts'],
    }),
    deleteContactQuery: builder.mutation({
      query: (id) => ({ url: `/contacts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Contacts'],
    }),
  }),
});

export const {
  useGetFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetPYQCategoriesQuery,
  useGetPYQSubjectsQuery,
  useGetPYQYearsQuery,
  useGetPYQGroupsQuery,
  useGetPYQQuestionsQuery,
  useCreatePYQGroupMutation,
  useCreatePYQSubjectMutation,
  useCreatePYQYearMutation,
  useUpdatePYQHubFolderMutation,
  useDeletePYQHubFolderMutation,
  useCreatePYQQuestionMutation,
  useUpdatePYQQuestionMutation,
  useDeletePYQQuestionMutation,
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetPracticeSubjectsQuery,
  useGetPracticeChaptersQuery,
  useCreatePracticeSubjectMutation,
  useUpdatePracticeSubjectMutation,
  useDeletePracticeSubjectMutation,
  useCreatePracticeChapterMutation,
  useUpdatePracticeChapterMutation,
  useDeletePracticeChapterMutation,
  useGetPracticeQuestionsQuery,
  useCreatePracticeQuestionMutation,
  useDeletePracticeQuestionMutation,
  useGetNotesQuery,
  useAddNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetNewspapersQuery,
  useAddNewspaperMutation,
  useDeleteNewspaperMutation,
  useGetStudentsQuery,
  useUpdateStudentStatusMutation,
  useGetAllStudentsProgressQuery,
  useSaveProgressMutation,
  useGetProgressQuery,
  useGetContactQueriesQuery,
  useSubmitContactQueryMutation,
  useDeleteContactQueryMutation,
} = studentApi;
