import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/config';

const { width } = Dimensions.get('window');

const AboutScreen = ({ navigation }) => {
  const { isDarkMode } = useSelector((state) => state.theme);

  const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card = isDarkMode ? '#1E293B' : '#FFFFFF';
  const text = isDarkMode ? '#F8FAFC' : '#1E293B';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';
  const border = isDarkMode ? '#334155' : '#E2E8F0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backBtn, { backgroundColor: isDarkMode ? '#33415540' : '#E2E8F060', borderColor: border }]}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* App Logo & Branding with Radial Glow Effect */}
        <View style={styles.logoSection}>
          <View style={[styles.glowBackground, { backgroundColor: isDarkMode ? '#4F46E520' : '#E0E7FF80' }]} />
          <LinearGradient
            colors={['#6366F1', '#4F46E5', '#3730A3']}
            style={styles.logoIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="school" size={44} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.appName, { color: text }]}>SpardhaPath</Text>
          <View style={[styles.versionBadge, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0', borderColor: border }]}>
            <Text style={[styles.appVersion, { color: COLORS.primary }]}>Version 1.0.0</Text>
          </View>
        </View>



        {/* Mission Statement */}
        <View style={[styles.infoCard, { backgroundColor: card, borderColor: border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.bulletDot, { backgroundColor: COLORS.primary }]} />
            <Text style={[styles.sectionTitle, { color: text }]}>Our Mission</Text>
          </View>
          <Text style={[styles.infoText, { color: muted }]}>
            SpardhaPath is built to democratize competitive exam prep. We bring you high-yield MCQs, Previous Year Questions (PYQs) organized by hierarchy, custom mock exams, and speed tricks to give you a definitive edge.
          </Text>
        </View>

        {/* Core Features Showcase Grid */}
        <Text style={[styles.gridTitle, { color: text }]}>Platform Features</Text>
        
        <View style={styles.featureGrid}>
          <View style={[styles.gridItem, { backgroundColor: card, borderColor: border }]}>
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
              <MaterialCommunityIcons name="file-tree" size={24} color="#4F46E5" />
            </View>
            <Text style={[styles.gridItemLabel, { color: text }]}>PYQ Explorer</Text>
            <Text style={[styles.gridItemDesc, { color: muted }]}>Organized dynamic folder structures for years & subjects.</Text>
          </View>

          <View style={[styles.gridItem, { backgroundColor: card, borderColor: border }]}>
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <MaterialCommunityIcons name="flash-outline" size={24} color="#10B981" />
            </View>
            <Text style={[styles.gridItemLabel, { color: text }]}>Short Tricks</Text>
            <Text style={[styles.gridItemDesc, { color: muted }]}>Memory hacks & quick tricks to boost your recall speed.</Text>
          </View>
        </View>

        <View style={styles.featureGrid}>
          <View style={[styles.gridItem, { backgroundColor: card, borderColor: border }]}>
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <MaterialCommunityIcons name="trophy-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.gridItemLabel, { color: text }]}>Test Engine</Text>
            <Text style={[styles.gridItemDesc, { color: muted }]}>Detailed metrics, timer constraints, and historical stats.</Text>
          </View>

          <View style={[styles.gridItem, { backgroundColor: card, borderColor: border }]}>
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={24} color="#EF4444" />
            </View>
            <Text style={[styles.gridItemLabel, { color: text }]}>Current Affairs</Text>
            <Text style={[styles.gridItemDesc, { color: muted }]}>Daily news briefs, summaries, and downloadable guides.</Text>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.copyrightText}>© 2026 SpardhaPath. All Rights Reserved.</Text>
          <Text style={[styles.developerText, { color: muted }]}>Developed & Designed by Pooja Mandale</Text>
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -20,
    blurRadius: 20,
    opacity: 0.8,
  },
  logoIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    marginTop: 18,
    letterSpacing: 0.5,
  },
  versionBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  appVersion: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  creditCard: {
    borderRadius: 30,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
    elevation: 10,
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlowOverlay: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  creditBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#FFF',
    marginLeft: 6,
    letterSpacing: 1.2,
  },
  creditTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  creatorName: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  creatorDivider: {
    height: 2,
    width: 60,
    backgroundColor: '#F59E0B',
    borderRadius: 1,
    marginVertical: 10,
  },
  creatorDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  socialRow: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'center',
  },
  socialCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  infoCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletDot: {
    width: 6,
    height: 18,
    borderRadius: 3,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
  gridTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 16,
    paddingLeft: 4,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    width: '48%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridItemLabel: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  gridItemDesc: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
  footerContainer: {
    marginTop: 30,
    marginBottom: 10,
    alignItems: 'center',
  },
  copyrightText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  developerText: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: FONTS.medium,
    marginTop: 4,
    letterSpacing: 0.5,
  },
});

export default AboutScreen;
