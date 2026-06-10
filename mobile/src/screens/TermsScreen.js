import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/config';

const TermsScreen = ({ navigation }) => {
  const { isDarkMode } = useSelector((state) => state.theme);

  const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card = isDarkMode ? '#1E293B' : '#FFFFFF';
  const text = isDarkMode ? '#F8FAFC' : '#1E293B';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';
  const border = isDarkMode ? '#334155' : '#E2E8F0';

  const sections = [
    {
      icon: 'gavel',
      title: '1. User Agreement',
      content: 'By registering and accessing SpardhaPath, you agree to comply with all terms and conditions set forth. This is a binding agreement between you (the student) and SpardhaPath. Access is granted for personal, non-commercial exam preparation purposes only.',
      accentColor: '#6366F1'
    },
    {
      icon: 'file-document-outline',
      title: '2. Content Ownership',
      content: 'All materials, questions, explanations, images, PDFs, and notes displayed on the platform are copyrighted intellectual property of SpardhaPath. Sharing, reproducing, selling, or distributing this content on online groups, social media, or other platforms is strictly prohibited.',
      accentColor: '#EF4444'
    },
    {
      icon: 'credit-card-outline',
      title: '3. Subscription & Payments',
      content: 'Access to premium features (including exclusive subjects, mock tests, and tricks) requires an active subscription. Payments are securely processed via third-party gateways (Razorpay). Subscriptions are non-transferable, and fees paid are non-refundable.',
      accentColor: '#F59E0B'
    },
    {
      icon: 'shield-lock-outline',
      title: '4. Account Security',
      content: 'You are responsible for safeguarding your login credentials (email and password). Access is limited to one concurrent login session per user account. Suspicious activity, including sharing accounts, may result in permanent suspension of access without refund.',
      accentColor: '#10B981'
    },
    {
      icon: 'alert-circle-outline',
      title: '5. Limitation of Liability',
      content: 'While we strive for absolute accuracy in practice questions and syllabus mappings, SpardhaPath is not liable for errors, discrepancies, or issues caused by platform downtime. Users are encouraged to cross-reference important regulatory syllabus points.',
      accentColor: '#8B5CF6'
    },
  ];

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
        <Text style={[styles.headerTitle, { color: text }]}>Terms of Service</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Document Header Badge */}
        <View style={[styles.docHeader, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: border }]}>
          <View style={styles.docIconBox}>
            <MaterialCommunityIcons name="file-certificate-outline" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.docInfo}>
            <Text style={[styles.docTitle, { color: text }]}>Legal Terms & Conditions</Text>
            <Text style={[styles.lastUpdated, { color: muted }]}>Last Updated: June 2026</Text>
          </View>
        </View>

        <Text style={[styles.introText, { color: muted }]}>
          Please take a moment to read our terms of service before diving in. These guidelines protect our community and guarantee a fair study environment.
        </Text>

        {/* Sections List */}
        {sections.map((section, idx) => (
          <View key={idx} style={[styles.sectionCard, { backgroundColor: card, borderColor: border, borderLeftColor: section.accentColor }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: section.accentColor + '12' }]}>
                <MaterialCommunityIcons name={section.icon} size={22} color={section.accentColor} />
              </View>
              <Text style={[styles.sectionTitle, { color: text }]}>{section.title}</Text>
            </View>
            <Text style={[styles.sectionContent, { color: isDarkMode ? 'rgba(255,255,255,0.75)' : '#475569' }]}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* Consent Badge */}
        <View style={[styles.consentBadge, { borderColor: border, backgroundColor: isDarkMode ? '#1E293B40' : '#F1F5F960' }]}>
          <MaterialCommunityIcons name="shield-check-outline" size={22} color="#10B981" />
          <Text style={[styles.consentText, { color: muted }]}>
            By continuing to utilize SpardhaPath, you automatically accept our terms and privacy policy. Study hard and act responsibly!
          </Text>
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
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  docIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  lastUpdated: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
  introText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderLeftWidth: 6,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    flex: 1,
  },
  sectionContent: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  consentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 18,
    marginTop: SPACING.lg,
  },
  consentText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginLeft: 12,
    flex: 1,
  },
});

export default TermsScreen;
