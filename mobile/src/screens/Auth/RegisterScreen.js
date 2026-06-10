import React, { useState, useRef } from 'react';
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
import { useRegisterMutation } from '../../redux/apis/authApi';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Refs for stable focus management
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const dispatch = useDispatch();
  const [register, { isLoading: loading }] = useRegisterMutation();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please fill all fields to create your account',
      });
      return;
    }

    try {
      await register({ name, email, password }).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Toast.show({
        type: 'success',
        text1: 'Account Created',
        text2: 'Please sign in with your new account credentials.',
      });

      // Redirect to login after success
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = err.data?.message || err.message || 'Registration failed';
      Toast.show({ type: 'error', text1: 'Registration Error', text2: errorMessage });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FDF2F8', '#F5F3FF', '#F0F9FF']}
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Action */}
          <View style={styles.topBar}>
             <TouchableOpacity 
               onPress={() => navigation.goBack()}
               style={styles.backBtn}
             >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
             </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoAndTitle}>
              <Image 
                source={require('../../../assets/logo.png')} 
                style={styles.smallLogo}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.marathiBadge}>नव्या प्रवासाची सुरुवात</Text>
                <Text style={styles.heroTitle}>Create Account</Text>
              </View>
            </View>
            <Text style={styles.heroSubtitle}>Join the community of SpardhaPath achievers.</Text>
          </View>

          {/* Form */}
          <View style={styles.mainCard}>
            {/* Full Name Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#CBD5E1"
                  value={name}
                  onChangeText={setName}
                  autoCorrect={false}
                  autoCapitalize="sentences"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                  importantForAutofill="no"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={22} color="#94A3B8" />
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#CBD5E1"
                  value={email}
                  onChangeText={setEmail}
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                  importantForAutofill="no"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={22} color="#94A3B8" />
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#CBD5E1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
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

            {/* Action Button */}
            <TouchableOpacity 
              onPress={handleRegister} 
              disabled={loading}
              style={{marginTop: 10}}
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
                    <Text style={styles.primaryBtnText}>Register Now</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={{marginLeft: 8}}/>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#8B5CF6',
    opacity: 0.15,
  },
  bgBlob2: {
    position: 'absolute',
    bottom: -50,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#EC4899',
    opacity: 0.18,
  },
  bgBlob3: {
    position: 'absolute',
    top: 200,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6366F1',
    opacity: 0.08,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
  },
  topBar: {
    height: 60,
    justifyContent: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    marginBottom: 35,
  },
  logoAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 10,
  },
  smallLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  marathiBadge: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '800',
    marginBottom: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
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
  focusedInput: {
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  loginLink: {
    color: '#6366F1',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default RegisterScreen;