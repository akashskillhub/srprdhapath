import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/features/authSlice';
import { useLoginMutation } from '../../redux/apis/authApi';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const [login, { isLoading: loading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please enter both email and password',
      });
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      console.log('Login Result:', result);

      if (!result || !result.user || !result.token) {
        throw new Error('Server returned incomplete user data');
      }
      
      // Save credentials to AsyncStorage for persistence
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      await AsyncStorage.setItem('token', result.token);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch(setUser({ user: result.user, token: result.token }));
      
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: `Successfully signed in as ${result.user.name}`,
      });
    } catch (err) {
      // Intentionally not logging with console.error to avoid on-screen redbox in dev
      console.log('Login Error Object:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Failed to sign in. Please try again.';
      
      // Extract specific error message from server
      if (err.data && err.data.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // If it's a 400 and we want to be specific
      if (err.status === 400 && errorMessage === 'Invalid credentials') {
        errorMessage = 'Your password or email is not valid';
      }

      Toast.show({ 
        type: 'error', 
        text1: 'Login Failed', 
        text2: errorMessage 
      });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#F0F9FF', '#F5F3FF']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.bgBlob1} />
        <View style={styles.bgBlob2} />
        <View style={styles.bgBlob3} />

        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Logo / App Name */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.logoIconImage}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <View style={styles.header}>
            <Text style={styles.marathiGreeting}>पुनरागमन केल्याबद्दल स्वागत!</Text>
            <Text style={styles.heroTitle}>SpardhaPath</Text>
            <Text style={styles.heroSubtitle}>Your gateway to excellence starts here.</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            {/* Email Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={22} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor="#CBD5E1"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  importantForAutofill="no"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={22} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#CBD5E1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCorrect={false}
                  importantForAutofill="no"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color="#94A3B8" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              onPress={handleLogin} 
              disabled={loading}
              style={{marginTop: 8}}
            >
              <LinearGradient
                colors={['#4F46E5', '#9333EA', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.primaryBtnText}>Sign In to Account</Text>
                    <MaterialCommunityIcons name="login-variant" size={20} color="#fff" style={{marginLeft: 8}}/>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New to SpardhaPath? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bgBlob1: {
    position: 'absolute',
    top: -50,
    right: -80,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#6366F1',
    opacity: 0.15,
  },
  bgBlob2: {
    position: 'absolute',
    bottom: 50,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#EC4899',
    opacity: 0.18,
  },
  bgBlob3: {
    position: 'absolute',
    top: 250,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FACC15',
    opacity: 0.08,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIconImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  marathiGreeting: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'NotoSansDevanagari_700Bold',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputWrapper: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 64,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  primaryBtn: {
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  registerLink: {
    color: '#6366F1',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default LoginScreen;