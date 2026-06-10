import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const LEVELS = [
  {
    id: 'easy',
    label: 'Easy Level',
    subtitle: 'Foundation & Basics',
    icon: 'leaf',
    colors: ['#10B981', '#059669'],
    badgeColor: '#D1FAE5',
    badgeText: '#065F46',
  },
  {
    id: 'medium',
    label: 'Medium Level',
    subtitle: 'Intermediate Challenge',
    icon: 'fire',
    colors: ['#F59E0B', '#D97706'],
    badgeColor: '#FEF3C7',
    badgeText: '#92400E',
  },
  {
    id: 'hard',
    label: 'Hard Level',
    subtitle: 'Advanced & Competitive',
    icon: 'skull-crossbones',
    colors: ['#EF4444', '#DC2626'],
    badgeColor: '#FEE2E2',
    badgeText: '#991B1B',
  },
];

const TestSeriesScreen = ({ navigation }) => {
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
  const text = isDarkMode ? '#F8FAFC' : '#1E293B';
  const card = isDarkMode ? '#1E293B' : '#FFFFFF';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={text} />
        </TouchableOpacity>
        <View style={{ marginLeft: 15 }}>
          <Text style={[styles.headerTitle, { color: text }]}>Test Series</Text>
          <Text style={[styles.headerSub, { color: muted }]}>SELECT YOUR LEVEL</Text>
        </View>
      </View>

      <View style={styles.heroBox}>
        <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.heroBanner}>
          <View style={styles.heroFlare} />
          <MaterialCommunityIcons name="trophy-outline" size={60} color="rgba(255,255,255,0.15)" style={styles.heroIcon} />
          <Text style={styles.heroLabel}>SPARDHAPATH TESTS</Text>
          <Text style={styles.heroTitle}>Challenge Yourself</Text>
          <Text style={styles.heroSub}>Pick a difficulty and start practicing</Text>
        </LinearGradient>
      </View>

      <View style={styles.levelsContainer}>
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('TestList', { difficulty: level.id, label: level.label })}
          >
            <LinearGradient colors={level.colors} style={styles.levelCard}>
              <View style={styles.levelCardFlare} />
              <View style={styles.levelLeft}>
                <View style={styles.levelIconBox}>
                  <MaterialCommunityIcons name={level.icon} size={28} color="#fff" />
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={styles.levelTitle}>{level.label}</Text>
                  <Text style={styles.levelSub}>{level.subtitle}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={28} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  headerSub: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 1 },
  heroBox: { paddingHorizontal: 20, marginBottom: 10 },
  heroBanner: {
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  heroFlare: {
    position: 'absolute', top: -40, right: -40,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroIcon: { position: 'absolute', right: 20, bottom: 10 },
  heroLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 6 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  levelsContainer: { paddingHorizontal: 20, gap: 14 },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 5,
  },
  levelCardFlare: {
    position: 'absolute', top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  levelLeft: { flexDirection: 'row', alignItems: 'center' },
  levelIconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  levelTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  levelSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
});

export default TestSeriesScreen;
