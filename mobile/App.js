import Toast from 'react-native-toast-message';
import { StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { store } from './src/redux/store';
import { toggleTheme } from './src/redux/features/themeSlice';
import SplashScreen from './src/screens/SplashScreen';
import AuthStackNavigator from './src/navigation/AuthStackNavigator';
import DrawerNavigator from './src/navigation/DrawerNavigator';

import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from './src/redux/features/authSlice';

// Root navigation component to handle auth-based conditional routing
const RootNavigation = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        
        if (storedUser && storedToken) {
          dispatch(setUser({
            user: JSON.parse(storedUser),
            token: storedToken
          }));
        }
      } catch (e) {
        console.error('Failed to restore session', e);
      } finally {
        setShowSplash(false);
      }
    };

    checkUserSession();
  }, [dispatch]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      {isAuthenticated ? <DrawerNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigation />
        {/* Toast is used for notifications */}
        <Toast />
      </SafeAreaProvider>
    </Provider>
  );
}
