import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUpdateProfileMutation, useLogoutMutation } from '../redux/apis/authApi';
import { logout, setUser } from '../redux/features/authSlice';
import { toggleTheme } from '../redux/features/themeSlice';
import { getBaseUrl } from '../utils/config';
import Toast from 'react-native-toast-message';
import { COLORS, RADIUS, SPACING } from '../constants/config';

const ProfileScreen = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [logoutMutation] = useLogoutMutation();
  const [image, setImage] = useState(null);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
             try {
               await logoutMutation().unwrap();
             } catch (e) {
               console.warn('Logout mutation failed', e);
             } finally {
               dispatch(logout());
               Toast.show({
                 type: 'success',
                 text1: 'Logged out successfully',
                 text2: 'See you again soon!',
               });
             }
          }
        },
      ]
    );
  };

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#E2E8F0',
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      handleUpload(result.assets[0]);
    }
  };

  const handleUpload = async (imageAsset) => {
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('name', user.name);
      
      const uri = Platform.OS === 'android' ? imageAsset.uri : imageAsset.uri.replace('file://', '');
      const filename = imageAsset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('profileImage', {
        uri,
        name: filename,
        type,
      });

      const response = await updateProfile(formData).unwrap();
      dispatch(setUser({ user: response.user, token }));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully',
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: err.data?.message || 'Something went wrong',
      });
    }
  };

  const profileImageUrl = user?.profileImage 
    ? `${getBaseUrl().replace('/api', '')}${user.profileImage}`
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: themeColors.card }]}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {image || profileImageUrl ? (
              <Image source={{ uri: image || profileImageUrl }} style={styles.profileImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
                <MaterialCommunityIcons name="account" size={60} color={themeColors.textMuted} />
              </View>
            )}
            <View style={styles.editBadge}>
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: themeColors.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: themeColors.textMuted }]}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: user?.role === 'admin' ? '#10B981' : COLORS.primary }]}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>PREFERENCES</Text>
          <View style={[styles.settingsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: '#6366F120' }]}>
                  <MaterialCommunityIcons name="theme-light-dark" size={22} color={COLORS.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={() => dispatch(toggleTheme())}
                trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textMuted }]}>ACCOUNT</Text>
          <View style={[styles.settingsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: '#EF444420' }]}>
                  <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
                </View>
                <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Log Out</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    padding: SPACING.md,
    height: 60,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  profileCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 32,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#6366F1',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#6366F1',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});

export default ProfileScreen;
