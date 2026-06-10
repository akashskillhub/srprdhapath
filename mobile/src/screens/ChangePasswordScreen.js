import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useChangePasswordMutation } from '../redux/apis/authApi';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/config';

const ChangePasswordScreen = ({ navigation }) => {
  const { isDarkMode } = useSelector((state) => state.theme);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Focus States
  const [focusOld, setFocusOld] = useState(false);
  const [focusNew, setFocusNew] = useState(false);
  const [focusConfirm, setFocusConfirm] = useState(false);

  const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card = isDarkMode ? '#1E293B' : '#FFFFFF';
  const text = isDarkMode ? '#F8FAFC' : '#1E293B';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';
  const border = isDarkMode ? '#334155' : '#E2E8F0';
  const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

  // Password Strength Calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'transparent', score: 0 };
    if (pwd.length < 5) return { label: 'Weak', color: '#EF4444', score: 1 };
    if (pwd.length < 8) return { label: 'Medium', color: '#F59E0B', score: 2 };
    
    // Check if password has numbers & symbols
    const hasNumbers = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    if (hasNumbers && hasSpecial) return { label: 'Strong', color: '#10B981', score: 3 };
    return { label: 'Medium', color: '#F59E0B', score: 2 };
  };

  const strength = getPasswordStrength(newPassword);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please fill in all the password fields',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'New password must be at least 6 characters long',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Mismatch',
        text2: 'Confirm password does not match new password',
      });
      return;
    }

    try {
      const response = await changePassword({ oldPassword, newPassword }).unwrap();
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.message || 'Password updated successfully!',
      });

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
      
    } catch (err) {
      console.error('Password update failed:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: err.data?.message || 'Failed to update password. Please check old password.',
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={[styles.backBtn, { backgroundColor: isDarkMode ? '#33415540' : '#E2E8F060', borderColor: border }]}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: text }]}>Change Password</Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Top Illustration/Banner */}
          <View style={styles.bannerSection}>
            <View style={[styles.lockIconBox, { backgroundColor: isDarkMode ? '#6366F115' : '#E0E7FF80' }]}>
              <MaterialCommunityIcons name="shield-lock" size={48} color={COLORS.primary} />
            </View>
            <Text style={[styles.bannerTitle, { color: text }]}>Update Security</Text>
            <Text style={[styles.bannerDesc, { color: muted }]}>
              Change your password periodically to safeguard your exam profile and progress.
            </Text>
          </View>

          {/* Password Form Card */}
          <View style={[styles.formCard, { backgroundColor: card, borderColor: border }]}>
            
            {/* Old Password */}
            <Text style={[styles.inputLabel, { color: text }]}>Current Password</Text>
            <View style={[
              styles.inputWrapper, 
              { 
                backgroundColor: inputBg, 
                borderColor: focusOld ? COLORS.primary : border,
                borderWidth: focusOld ? 2 : 1
              }
            ]}>
              <MaterialCommunityIcons name="lock-open-outline" size={20} color={focusOld ? COLORS.primary : muted} style={styles.inputIcon} />
              <TextInput
                placeholder="Enter current password"
                placeholderTextColor={muted}
                secureTextEntry={!showOld}
                value={oldPassword}
                onChangeText={setOldPassword}
                onFocus={() => setFocusOld(true)}
                onBlur={() => setFocusOld(false)}
                style={[styles.textInput, { color: text }]}
              />
              <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeBtn}>
                <MaterialCommunityIcons name={showOld ? "eye-off" : "eye"} size={20} color={muted} />
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={[styles.inputLabel, { color: text, marginTop: 20 }]}>New Password</Text>
            <View style={[
              styles.inputWrapper, 
              { 
                backgroundColor: inputBg, 
                borderColor: focusNew ? COLORS.primary : border,
                borderWidth: focusNew ? 2 : 1
              }
            ]}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={focusNew ? COLORS.primary : muted} style={styles.inputIcon} />
              <TextInput
                placeholder="Enter new password"
                placeholderTextColor={muted}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                onFocus={() => setFocusNew(true)}
                onBlur={() => setFocusNew(false)}
                style={[styles.textInput, { color: text }]}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                <MaterialCommunityIcons name={showNew ? "eye-off" : "eye"} size={20} color={muted} />
              </TouchableOpacity>
            </View>

            {/* Dynamic Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarBackground}>
                  <View style={[
                    styles.strengthBarActive, 
                    { 
                      backgroundColor: strength.color,
                      width: strength.score === 1 ? '33%' : strength.score === 2 ? '66%' : '100%' 
                    }
                  ]} />
                </View>
                <Text style={[styles.strengthText, { color: strength.color }]}>
                  {strength.label} Password
                </Text>
              </View>
            )}

            {/* Confirm Password */}
            <Text style={[styles.inputLabel, { color: text, marginTop: 20 }]}>Confirm New Password</Text>
            <View style={[
              styles.inputWrapper, 
              { 
                backgroundColor: inputBg, 
                borderColor: focusConfirm ? COLORS.primary : border,
                borderWidth: focusConfirm ? 2 : 1
              }
            ]}>
              <MaterialCommunityIcons name="lock-check-outline" size={20} color={focusConfirm ? COLORS.primary : muted} style={styles.inputIcon} />
              <TextInput
                placeholder="Re-enter new password"
                placeholderTextColor={muted}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusConfirm(true)}
                onBlur={() => setFocusConfirm(false)}
                style={[styles.textInput, { color: text }]}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <MaterialCommunityIcons name={showConfirm ? "eye-off" : "eye"} size={20} color={muted} />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: COLORS.primary }]}
              onPress={handleUpdatePassword}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={styles.submitBtnContent}>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Update Password</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    height: 70,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  bannerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  lockIconBox: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  bannerDesc: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    paddingHorizontal: 28,
  },
  formCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.regular,
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  strengthBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 12,
  },
  strengthBarActive: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});

export default ChangePasswordScreen;
