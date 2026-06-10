import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getBaseUrl } from '../../utils/config';
import { logout } from '../features/authSlice';

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    // Standard auth token handling
    const token = getState().auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Common base query logic for all APIs with automatic 401 logout handling.
 */
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  
  if (result?.error?.status === 401) {
    // If we get an unauthorized error (expired or invalid token), log out the user
    api.dispatch(logout());
  }
  
  return result;
};
