import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import themeReducer from './features/themeSlice';
import { authApi } from './apis/authApi';
import { studentApi } from './apis/studentApi';
import { adminApi } from './apis/adminApi';
import { shortTricksApi } from './apis/shortTricksApi';
import { materialsApi } from './apis/materialsApi';
import { testApi } from './apis/testApi';

export const store = configureStore({
  reducer: {
    // Reducers
    auth: authReducer,
    theme: themeReducer,
    
    // API Reducers
    [authApi.reducerPath]: authApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [shortTricksApi.reducerPath]: shortTricksApi.reducer,
    [materialsApi.reducerPath]: materialsApi.reducer,
    [testApi.reducerPath]: testApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      authApi.middleware,
      studentApi.middleware,
      shortTricksApi.middleware,
      materialsApi.middleware,
      testApi.middleware
    ),
});

export default store;
