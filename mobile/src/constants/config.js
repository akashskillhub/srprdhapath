import { Platform } from 'react-native';

// Use local IP for testing with physical devices
export const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export const COLORS = {
  primary: '#4338CA',         // Professional Indigo
  secondary: '#6366F1',       // Modern Indigo
  accent: '#F59E0B',          // Warning/Amber
  success: '#10B981',         // Green
  danger: '#EF4444',          // Red
  background: '#F8FAFC',      // Very Light Slate
  surface: '#FFFFFF',         // White
  text: '#0F172A',            // Slate 900
  textMuted: '#64748B',       // Slate 500
  border: '#E2E8F0',          // Slate 200
  locked: '#94A3B8',          // Grayed out for locked items
  gold: '#D4AF37',            // Premium/Pro badge
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const FONTS = {
  bold: 'Outfit-Bold',
  semiBold: 'Outfit-SemiBold',
  regular: 'Outfit-Regular',
  medium: 'Outfit-Medium',
};
