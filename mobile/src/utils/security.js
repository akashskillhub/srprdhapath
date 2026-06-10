import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Hook to prevent screen capturing (screenshots and recording).
 * Call this inside any component that requires content protection.
 */
export const useCaptureProtection = (shouldProtect = true) => {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    /* 
    // Screenshot restriction temporarily disabled
    if (shouldProtect) {
      if (ScreenCapture.preventScreenCaptureAsync) {
        ScreenCapture.preventScreenCaptureAsync();
      }
    } else {
      if (ScreenCapture.allowScreenCaptureAsync) {
        ScreenCapture.allowScreenCaptureAsync();
      }
    }
    */

    return () => {
      if (Platform.OS === 'web') return;
      /*
      if (shouldProtect && ScreenCapture.allowScreenCaptureAsync) {
        ScreenCapture.allowScreenCaptureAsync();
      }
      */
    };
  }, [shouldProtect]);
};

/**
 * Logic for checking item access (Freemium)
 * Locked if: !isSubscribed AND !isFreeItem
 */
export const hasAccess = (user, item) => {
  if (user?.isSubscribed) return true;
  if (item?.isFree) return true;
  return false;
};
