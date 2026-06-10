import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import DashboardCard from '../components/DashboardCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;

const FALLBACK_MODULES = [
  { _id: '1', name: 'PYQ Hub', icon: 'file-search-outline', color: '#3B82F6', route: 'PYQHub' },
  { _id: '2', name: 'Practice Qs', icon: 'book-open-variant', color: '#8B5CF6', route: 'PracticeQuestions' },
  { _id: '3', name: 'Current Affairs', icon: 'newspaper-variant-outline', color: '#10B981', route: 'CurrentAffairs' },
  { _id: '4', name: 'Short Tricks', icon: 'flash-outline', color: '#F59E0B', route: 'ShortTricks' },
  { _id: '5', name: 'State Board', icon: 'school-outline', color: '#EF4444', route: 'StateBoard' },
  { _id: '6', name: 'Test Series', icon: 'timer-outline', color: '#6366F1', route: 'TestSeries' },
  { _id: '7', name: 'Syllabus', icon: 'clipboard-list-outline', color: '#EC4899', route: 'Syllabus' },
  { _id: '8', name: 'Question Paper', icon: 'file-document-outline', color: '#06B6D4', route: 'QuestionPaper' },
  { _id: '9', name: 'YouTube Links', icon: 'youtube', color: '#FF0000', route: 'YouTubeLinks' },
];

const DashboardScreen = ({ navigation }) => {
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    headerBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    accent: isDarkMode ? '#818CF8' : '#4338CA',
  };

  const modules = FALLBACK_MODULES;

  const handleCardPress = (item) => {
    navigation.navigate(item.route || 'PYQHub', {
      moduleId: null,
      moduleName: item.name
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={themeColors.headerBg} />

      {/* Premium Header */}
      <View style={[styles.header, { backgroundColor: themeColors.headerBg, borderBottomWidth: 0 }]}>
        <TouchableOpacity
          style={[styles.menuBtn, isDarkMode && styles.iconBtnDark]}
          onPress={() => navigation.openDrawer()}
        >
          <MaterialCommunityIcons name="menu" size={26} color={themeColors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.appTitle, { color: themeColors.text }]}>SpardhaPath</Text>
          <Text style={[styles.appMarathiTitle, { color: themeColors.accent }]}>स्पर्धापथ</Text>
        </View>
        <TouchableOpacity
          style={[styles.profileBtn, isDarkMode && styles.iconBtnDark]}
          onPress={() => navigation.navigate('MainStack', { screen: 'Profile' })}
        >
          <View style={styles.profileIndicator} />
          <MaterialCommunityIcons name="account-circle" size={28} color={themeColors.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={modules}
        extraData={isDarkMode}
        renderItem={({ item }) => (
          <DashboardCard item={item} onPress={handleCardPress} />
        )}
        keyExtractor={(item) => item._id || item.id}
        numColumns={COLUMN_COUNT}
        key={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.headerSection}>
            <LinearGradient
              colors={isDarkMode ? ['#312E81', '#1E1B4B'] : ['#4F46E5', '#312E81']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              {/* Added flare to banner */}
              <View style={styles.bannerFlare} />
              
              <View style={styles.bannerContent}>
                <Text style={styles.bannerWelcome}>MPSC | UPSC | EXCELLENCE</Text>
                <Text style={styles.bannerTitle}>Your Gateway to Success Starts Here</Text>
                {user?.isPro ? (
                  <TouchableOpacity 
                    style={[styles.proBtn, { backgroundColor: '#E8FDF0', borderColor: '#10B981', borderWidth: 1.5 }]}
                    onPress={() => navigation.navigate('Subscription')}
                  >
                    <Text style={[styles.proBtnText, { color: '#10B981', marginRight: 4 }]}>Pro Member Active</Text>
                    <MaterialCommunityIcons name="check-decagram" size={15} color="#10B981" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.proBtn, isDarkMode && {backgroundColor: 'rgba(255,255,255,0.1)'}]}
                    onPress={() => navigation.navigate('Subscription')}
                  >
                    <Text style={[styles.proBtnText, isDarkMode && {color: '#fff'}]}>Upgrade to Pro</Text>
                    <MaterialCommunityIcons name="crown" size={16} color="#F59E0B" />
                  </TouchableOpacity>
                )}
              </View>
              <MaterialCommunityIcons name="rocket-launch" size={70} color="rgba(255,255,255,0.15)" style={styles.bannerIcon} />
            </LinearGradient>

            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Explore Modules</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={[styles.seeAllText, { color: themeColors.accent }]}>See all</Text>
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
  iconBtnDark: {
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 12,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'NotoSansDevanagari_700Bold',
    letterSpacing: -1,
  },
  appMarathiTitle: {
    fontSize: 14,
    marginTop: -4,
    fontFamily: 'NotoSansDevanagari_400Regular',
    letterSpacing: 2,
    fontWeight: 'bold',
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
    borderColor: '#0F172A',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 15,
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
    flex: 1,
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
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 8,
    lineHeight: 28,
  },
  proBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  proBtnText: {
    color: '#312E81',
    fontWeight: '900',
    fontSize: 12,
    marginRight: 6,
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
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'Outfit-Bold',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Outfit-Bold',
  },
});

export default DashboardScreen;

