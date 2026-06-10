import { Platform } from 'react-native';

export const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Hardcoded fallback for local development if .env is missing
  return Platform.OS === 'web' 
    ? 'http://localhost:5000/api' 
    : 'http://192.168.0.102:5000/api';
};

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = getBaseUrl().replace('/api', '');
  return `${baseUrl}${path}`;
};
