import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import DashboardCard from '../components/DashboardCard';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/features/themeSlice';
import { logout } from '../redux/features/authSlice';
import { useLogoutMutation } from '../redux/apis/authApi';
import { getBaseUrl } from '../utils/config';
import {
  useGetStudentsQuery,
  useGetAllStudentsProgressQuery
} from '../redux/apis/adminApi';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;

const AdminScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();

  // Fetch Live Stats for Dashboard
  const { data: studentsData } = useGetStudentsQuery();
  const { data: progressData } = useGetAllStudentsProgressQuery();

  const totalStudents = studentsData?.data?.length || 0;
  const totalSolved = progressData?.data?.reduce((acc, curr) => acc + curr.totalSolved, 0) || 0;

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    headerBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    accent: isDarkMode ? '#818CF8' : '#4338CA',
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Terminate admin session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try { await logoutMutation().unwrap(); }
          catch (e) { console.warn('Logout failed', e); }
          finally { dispatch(logout()); }
        }
      },
    ]);
  };

  const profileImageUrl = user?.profileImage
    ? `${getBaseUrl().replace('/api', '')}${user.profileImage}`
    : null;

  const folders = [
    { _id: 'PYQ_HUB', name: 'PYQ Hub', icon: 'file-document-multiple', color: '#3B82F6', route: 'PYQHub' },
    { _id: 'PRACTICE', name: 'Practice Questions', icon: 'book-open-variant', color: '#8B5CF6', route: 'PracticeQuestions' },
    { _id: 'CURRENT', name: 'Current Affairs', icon: 'newspaper-variant-outline', color: '#10B981', route: 'CurrentAffairs' },
    { _id: 'SHORT_TRICKS', name: 'Short Tricks', icon: 'lightning-bolt', color: '#F43F5E', route: 'AdminShortTricks' },
    { _id: 'STATE_BOARD', name: 'State Board', icon: 'book-open-page-variant', color: '#B45309', route: 'StateBoard' },
    { _id: 'TEST_SERIES', name: 'Test Series', icon: 'timer-outline', color: '#0D9488', route: 'TestSeries' },
    { _id: 'SYLLABUS', name: 'Syllabus', icon: 'clipboard-list-outline', color: '#EA580C', route: 'Syllabus' },
    { _id: 'QUESTION_PAPER', name: 'Question Paper', icon: 'file-document-outline', color: '#8B5CF6', route: 'QuestionPaper' },
    { _id: 'YOUTUBE', name: 'YouTube Links', icon: 'youtube', color: '#FF0000', route: 'YouTubeLinks' },
  ];

  const handleCardPress = (item) => {
    navigation.navigate(item.route || 'PYQHub', {
      moduleId: null,
      moduleName: item.name
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={themeColors.headerBg} />

      {/* Premium Header - Matching User Dashboard */}
      <View style={[styles.header, { backgroundColor: themeColors.headerBg, borderBottomWidth: 0 }]}>
        <TouchableOpacity
          style={[styles.menuBtn, isDarkMode && styles.iconBtnDark]}
          onPress={() => navigation.openDrawer()}
        >
          <MaterialCommunityIcons name="menu" size={26} color={themeColors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.appTitle, { color: themeColors.text }]}>Admin Panel</Text>
          <View style={styles.adminIndicator}>
            <View style={styles.pulseDot} />
            <Text style={[styles.appMarathiTitle, { color: '#10B981' }]}>SECURE ACCESS</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.profileBtn, isDarkMode && styles.iconBtnDark]}
          onPress={() => navigation.navigate('Profile')}
        >
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.profileImg} />
          ) : (
            <MaterialCommunityIcons name="account-circle" size={28} color={themeColors.accent} />
          )}
          <View style={styles.profileIndicator} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={folders}
        extraData={isDarkMode}
        renderItem={({ item }) => (
          <DashboardCard item={item} onPress={handleCardPress} />
        )}
        keyExtractor={(item) => item._id}
        numColumns={COLUMN_COUNT}
        key={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.headerSection}>
            <LinearGradient
              colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#4F46E5', '#3730A3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.bannerFlare} />
              
              <View style={styles.bannerContent}>
                <Text style={styles.bannerWelcome}>SPARDHAPATH EXECUTIVE</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{totalStudents}</Text>
                    <Text style={styles.statLabel}>USERS</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{totalSolved}</Text>
                    <Text style={styles.statLabel}>SOLVED</Text>
                  </View>
                </View>
              </View>
              <MaterialCommunityIcons name="shield-crown" size={70} color="rgba(255,255,255,0.1)" style={styles.bannerIcon} />
            </LinearGradient>

            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Admin Modules</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBadge}>
                <MaterialCommunityIcons name="logout" size={14} color="#fff" />
                <Text style={styles.logoutText}>LOGOUT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 10,
    elevation: 0,
    zIndex: 10,
  },
  menuBtn: {
    padding: 5,
  },
  iconBtnDark: {
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 12,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'NotoSansDevanagari_700Bold',
    letterSpacing: -0.5,
  },
  adminIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  appMarathiTitle: {
    fontSize: 9,
    fontFamily: 'NotoSansDevanagari_400Regular',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  profileImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  profileIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  banner: {
    padding: 24,
    borderRadius: 32,
    position: 'relative',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    marginBottom: 25,
  },
  bannerFlare: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bannerContent: {
    zIndex: 2,
  },
  bannerWelcome: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 8,
    lineHeight: 26,
    maxWidth: '80%',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 20,
  },
  statBox: {
    alignItems: 'flex-start',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bannerIcon: {
    position: 'absolute',
    right: 15,
    bottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Outfit-Bold',
  },
  logoutBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoutText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '900',
  },
});

export default AdminScreen;
