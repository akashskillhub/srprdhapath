import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { useGetProgressQuery } from '../redux/apis/studentApi';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProgressScreen = ({ navigation }) => {
  const { data: progress, isLoading, error } = useGetProgressQuery();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Calculate statistics safely
  const totalSolved = progress?.solvedQuestionIds?.length || 0;
  const totalCorrect = progress?.subjectStats?.reduce((sum, stat) => sum + (stat.correctCount || 0), 0) || 0;
  const overallAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Linear Gradient Header */}
      <LinearGradient colors={[COLORS.primary, '#6366F1']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Your Progress</Text>
            <Text style={styles.headerSubtitle}>Intelligence Tracking System</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Progress Card */}
        <View style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <View style={styles.overallHeaderLeft}>
              <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={24} color={COLORS.primary} />
              <Text style={styles.overallTitle}>Learning Analytics</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>All-Time</Text>
            </View>
          </View>
          
          <View style={styles.overallContent}>
            {/* Left side circular accuracy visualization */}
            <View style={styles.accuracyCircle}>
              <Text style={styles.accuracyValue}>{overallAccuracy}%</Text>
              <Text style={styles.accuracyLabel}>Accuracy</Text>
            </View>
            
            {/* Right side stats list */}
            <View style={styles.statsList}>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: COLORS.primary }]} />
                <View>
                  <Text style={styles.statVal}>{totalSolved}</Text>
                  <Text style={styles.statLbl}>Questions Solved</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: '#22C55E' }]} />
                <View>
                  <Text style={styles.statVal}>{totalCorrect}</Text>
                  <Text style={styles.statLbl}>Total Correct</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Section: Today's Progress */}
        <Text style={styles.sectionTitle}>Activity Today</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
              <MaterialCommunityIcons name="bullseye-arrow" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.summaryValue}>{progress?.todaySolved || 0}</Text>
            <Text style={styles.summaryLabel}>Solved Today</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: '#22C55E' }]}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="check-circle-outline" size={26} color="#22C55E" />
            </View>
            <Text style={[styles.summaryValue, { color: '#22C55E' }]}>{progress?.todayCorrect || 0}</Text>
            <Text style={styles.summaryLabel}>Correct Today</Text>
          </View>
        </View>

        {/* Section: Performance by Subject */}
        <Text style={styles.sectionTitle}>Performance by Subject</Text>
        {progress?.subjectStats?.length > 0 ? (
          progress.subjectStats.map((stat, index) => {
            const accuracy = stat.totalSolved > 0 ? Math.round((stat.correctCount / stat.totalSolved) * 100) : 0;
            
            // Choose color based on accuracy
            let performanceColor = '#EF4444'; // Low (Red)
            if (accuracy >= 80) {
              performanceColor = '#22C55E'; // High (Green)
            } else if (accuracy >= 50) {
              performanceColor = '#F59E0B'; // Medium (Amber)
            }

            return (
              <View key={index} style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <View style={[styles.subjectIcon, { backgroundColor: `${COLORS.primary}10` }]}>
                    <MaterialCommunityIcons name="book-outline" size={22} color={COLORS.primary} />
                  </View>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{stat.subject || 'General'}</Text>
                    <Text style={styles.topicName}>{stat.topic || 'All Topics'}</Text>
                  </View>
                  <View style={[styles.percentageBox, { backgroundColor: performanceColor }]}>
                     <Text style={styles.percentageText}>{accuracy}%</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressDetails}>
                     <Text style={styles.progressLabel}>Solved: <Text style={{fontWeight: '700', color: '#1E293B'}}>{stat.totalSolved}</Text></Text>
                     <Text style={styles.progressLabel}>Accuracy: <Text style={{fontWeight: '700', color: performanceColor}}>{stat.correctCount}/{stat.totalSolved}</Text></Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${accuracy}%`, backgroundColor: performanceColor }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="chart-line" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>No practice records found</Text>
            <Text style={styles.emptySubtext}>Start practicing tests or practice folders to see your real-time analytics here!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 8,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 2,
  },
  content: {
    padding: SPACING.lg,
  },
  overallCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: SPACING.sm,
  },
  overallHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  badge: {
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  overallContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  accuracyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: '#EEF2F6',
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
  },
  accuracyValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
  },
  accuracyLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: 1,
  },
  statsList: {
    flex: 1,
    marginLeft: SPACING.xl,
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  statLbl: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: 2,
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  topicName: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  percentageBox: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  percentageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  progressContainer: {
    marginTop: SPACING.md,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.xl,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 15,
    lineHeight: 18,
  }
});

export default ProgressScreen;
