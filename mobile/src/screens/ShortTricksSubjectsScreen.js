import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { useGetFoldersQuery } from '../redux/apis/studentApi';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

const COLUMN_COUNT = 2;

const ShortTricksSubjectsScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = (width - 50) / COLUMN_COUNT;
  const [search, setSearch] = useState('');
  const { isDarkMode } = useSelector((state) => state.theme);

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    primary: isDarkMode ? '#F43F5E' : '#E11D48',
    secondary: isDarkMode ? '#312E81' : '#4F46E5',
    inputBg: isDarkMode ? '#1E293B' : '#FFFFFF',
  };

  const { 
    data: folders = [], 
    isLoading: loading 
  } = useGetFoldersQuery({ 
    parent: 'null',
    category: 'SHORT_TRICKS'
  });

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const renderSubjectCard = ({ item, index }) => {
    const isLocked = !user?.isPro && index > 0 && !isAdmin;
    const colors = [
        ['#F43F5E', '#BE123C'],
        ['#8B5CF6', '#6D28D9'],
        ['#3B82F6', '#1D4ED8'],
        ['#10B981', '#047857'],
        ['#F59E0B', '#B45309'],
        ['#EC4899', '#BE185D'],
    ];
    const pair = colors[index % colors.length];

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[
          styles.card, 
          { 
            width: CARD_WIDTH,
            height: CARD_WIDTH * 1.3,
            backgroundColor: themeColors.card, 
            borderColor: themeColors.border, 
            opacity: isLocked ? 0.7 : 1 
          }
        ]}
        onPress={() => {
            if (isLocked) {
                navigation.navigate('Subscription');
                return;
            }
            navigation.navigate('ShortTricksList', { subjectId: item._id, subjectName: item.name });
        }}
      >
        <LinearGradient
          colors={[pair[0] + '15', pair[0] + '05']}
          style={styles.cardGradient}
        >
          <View style={[styles.cardCircle, { backgroundColor: pair[0] + '10' }]} />
          
          <View style={[styles.iconContainer, { backgroundColor: isLocked ? '#94A3B8' : pair[0] }]}>
             <MaterialCommunityIcons name={isLocked ? "lock" : "lightning-bolt"} size={28} color="#fff" />
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.subjectName, { color: themeColors.text }]} numberOfLines={2}>
                {item.name}
            </Text>
            {isLocked && <MaterialCommunityIcons name="crown" size={14} color="#F59E0B" style={{ marginLeft: 5 }} />}
          </View>
          
          <View style={[styles.badge, { backgroundColor: isLocked ? '#94A3B8' : pair[0] }]}>
              <Text style={styles.badgeText}>{isLocked ? 'LOCKED' : 'VIEW TRICKS'}</Text>
              <MaterialCommunityIcons name={isLocked ? "lock-outline" : "arrow-right"} size={12} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>Short Tricks</Text>
            <Text style={styles.headerSubtitle}>Subject-wise Collection</Text>
        </View>
      </View>

      <FlatList
        data={filteredFolders}
        renderItem={renderSubjectCard}
        keyExtractor={(item) => item._id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
           <View>
              <LinearGradient
                colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#E11D48', '#BE123C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
              >
                <View style={styles.bannerFlare} />
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerSmallText}>MPSC | UPSC | TRICKS</Text>
                    <Text style={styles.bannerLargeText}>Unlock Your Potential</Text>
                    <Text style={styles.bannerDesc}>Quick concepts to boost your exam speed.</Text>
                </View>
                <MaterialCommunityIcons name="rocket-launch" size={80} color="rgba(255,255,255,0.15)" style={styles.bannerIcon} />
              </LinearGradient>

              <View style={[styles.searchContainer, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                  <MaterialCommunityIcons name="magnify" size={20} color={themeColors.textMuted} />
                  <TextInput 
                    style={[styles.searchInput, { color: themeColors.text }]}
                    placeholder="Search subjects..."
                    placeholderTextColor={themeColors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                  />
              </View>

              <View style={styles.sectionHeading}>
                  <Text style={[styles.sectionTitle, { color: themeColors.text }]}>All Subjects</Text>
                  <View style={styles.livePulse}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.pulseText}>LIVE UPDATES</Text>
                  </View>
              </View>
           </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
             {loading ? (
                <ActivityIndicator size="large" color={themeColors.primary} />
             ) : (
                <>
                <MaterialCommunityIcons name="cloud-search-outline" size={80} color={isDarkMode ? "#1E293B" : "#E2E8F0"} />
                <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No subjects found for "{search}"</Text>
                </>
             )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitleBox: { marginLeft: 5 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '900', fontFamily: 'Outfit-Bold' },
  headerSubtitle: { fontSize: 11, color: '#94A3B8', fontWeight: '700', marginTop: -2 },
  banner: {
    margin: 20,
    padding: 24,
    borderRadius: 32,
    position: 'relative',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  bannerFlare: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bannerContent: { zIndex: 2 },
  bannerSmallText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  bannerLargeText: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: 4 },
  bannerDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
  bannerIcon: { position: 'absolute', right: 10, bottom: 0 },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
    height: 55,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '500' },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  livePulse: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F43F5E15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F43F5E', marginRight: 5 },
  pulseText: { color: '#F43F5E', fontSize: 9, fontWeight: '900' },
  listContent: { paddingHorizontal: 15, paddingBottom: 40 },
  card: {
    borderRadius: 28,
    margin: 5,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: { flex: 1, padding: 18, alignItems: 'center', justifyContent: 'center' },
  cardCircle: { position: 'absolute', top: -10, right: -10, width: 80, height: 80, borderRadius: 40 },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  subjectName: { fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 15, lineHeight: 20 },
  badge: {
     paddingHorizontal: 10,
     paddingVertical: 6,
     borderRadius: 10,
     flexDirection: 'row',
     alignItems: 'center',
     gap: 5,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, fontSize: 16, fontWeight: '600' },
});

export default ShortTricksSubjectsScreen;
