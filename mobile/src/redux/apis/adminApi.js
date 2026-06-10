import { studentApi } from './studentApi';

/**
 * Admin API (Proxy)
 * All endpoints have been merged into studentApi to enable shared cache invalidation.
 * Re-exporting hooks for backwards compatibility.
 */
export const adminApi = studentApi;

export const {
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useCreatePYQHubFolderMutation,
  useCreatePYQSubjectMutation,
  useCreatePYQYearMutation,
  useUpdatePYQHubFolderMutation,
  useDeletePYQHubFolderMutation,
  useCreatePYQQuestionMutation,
  useUpdatePYQQuestionMutation,
  useUpdateQuestionMutation,
  useDeletePYQQuestionMutation,
  useGetPYQCategoriesQuery,
  useGetPYQSubjectsQuery,
  useGetPYQYearsQuery,
  useGetPYQGroupsQuery,
  useGetPYQQuestionsQuery,
  useCreatePYQGroupMutation,
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
  useDeleteNoteMutation,
  useGetNewspapersQuery,
  useAddNewspaperMutation,
  useDeleteNewspaperMutation,
  useGetStudentsQuery,
  useUpdateStudentStatusMutation,
  useGetAllStudentsProgressQuery,
} = studentApi;
