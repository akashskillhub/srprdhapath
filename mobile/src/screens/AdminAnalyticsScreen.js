import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { useSelector } from 'react-redux';
import { 
  useGetStudentsQuery, 
  useGetAllStudentsProgressQuery 
} from '../redux/apis/adminApi';

const AdminAnalyticsScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 50) / 2;
  const { isDarkMode } = useSelector((state) => state.theme);
  
  const { data: studentsData, isLoading: loadingStudents } = useGetStudentsQuery();
  const { data: progressData, isLoading: loadingProgress } = useGetAllStudentsProgressQuery();

  const students = studentsData?.data || [];
  const progressList = progressData?.data || [];

  const combinedData = useMemo(() => {
    return students.map(s => {
      const prog = progressList.find(p => p._id === s._id) || { totalSolved: 0, correctCount: 0 };
      return {
        ...s,
        totalSolved: prog.totalSolved,
        correctCount: prog.correctCount,
        accuracy: prog.totalSolved > 0 ? Math.round((prog.correctCount / prog.totalSolved) * 100) : 0
      };
    }).sort((a, b) => b.totalSolved - a.totalSolved);
  }, [students, progressList]);

  // Global Stats
  const globalStats = useMemo(() => {
    const total = combinedData.reduce((acc, curr) => acc + curr.totalSolved, 0);
    const correct = combinedData.reduce((acc, curr) => acc + curr.correctCount, 0);
    const paid = combinedData.filter(s => s.isPaid).length;
    return { total, correct, paid, students: combinedData.length };
  }, [combinedData]);

  if (loadingStudents || loadingProgress) {
    return (
      <View style={[styles.center, isDarkMode && styles.bgDark]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.textWhite]}>Global Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { width: cardWidth, borderLeftColor: '#3B82F6' }, isDarkMode && styles.cardDark]}>
             <Text style={styles.statLabel}>Total Students</Text>
             <Text style={[styles.statValue, isDarkMode && styles.textWhite]}>{globalStats.students}</Text>
          </View>
          <View style={[styles.statCard, { width: cardWidth, borderLeftColor: '#10B981' }, isDarkMode && styles.cardDark]}>
             <Text style={styles.statLabel}>Paid Plan</Text>
             <Text style={[styles.statValue, isDarkMode && styles.textWhite]}>{globalStats.paid}</Text>
          </View>
          <View style={[styles.statCard, { width: cardWidth, borderLeftColor: '#8B5CF6' }, isDarkMode && styles.cardDark]}>
             <Text style={styles.statLabel}>Total Solved</Text>
             <Text style={[styles.statValue, isDarkMode && styles.textWhite]}>{globalStats.total}</Text>
          </View>
          <View style={[styles.statCard, { width: cardWidth, borderLeftColor: '#F59E0B' }, isDarkMode && styles.cardDark]}>
             <Text style={styles.statLabel}>Overall Accuracy</Text>
             <Text style={[styles.statValue, isDarkMode && styles.textWhite]}>
               {globalStats.total > 0 ? Math.round((globalStats.correct / globalStats.total) * 100) : 0}%
             </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, isDarkMode && styles.textWhite]}>Student Performance Leaderboard</Text>
        
        {combinedData.map((item, index) => (
          <View key={item._id} style={[styles.rankCard, isDarkMode && styles.cardDark]}>
             <View style={styles.rankNum}>
                <Text style={styles.rankText}>#{index + 1}</Text>
             </View>
             <View style={styles.studentDetails}>
                <Text style={[styles.name, isDarkMode && styles.textWhite]} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
             </View>
             <View style={styles.activityStats}>
                <View style={styles.activityItem}>
                   <MaterialCommunityIcons name="check-circle-outline" size={12} color="#10B981" />
                   <Text style={[styles.activityVal, isDarkMode && styles.textWhite]}>{item.totalSolved}</Text>
                </View>
                <View style={styles.progressTrack}>
                   <View style={[styles.progressBar, { width: `${item.accuracy}%`, backgroundColor: item.accuracy > 70 ? '#10B981' : item.accuracy > 40 ? '#F59E0B' : '#EF4444' }]} />
                </View>
             </View>
             <View style={styles.accuracyCircle}>
                <Text style={[styles.accuracyText, isDarkMode && styles.textWhite]}>{item.accuracy}%</Text>
             </View>
          </View>
        ))}
        {combinedData.length === 0 && (
          <Text style={styles.emptyText}>No data available yet.</Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  bgDark: { backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  textWhite: { color: '#fff' },
  scroll: { padding: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    padding: 15,
    borderLeftWidth: 4,
    elevation: 3,
  },
  cardDark: { backgroundColor: '#1E293B', shadowColor: '#000' },
  statLabel: { fontSize: 10, color: '#64748B', fontWeight: '800', textTransform: 'uppercase', marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15, marginTop: 10 },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  rankNum: { width: 30 },
  rankText: { fontSize: 12, fontWeight: '900', color: '#94A3B8' },
  studentDetails: { flex: 1, marginRight: 10 },
  name: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  email: { fontSize: 11, color: '#64748B', marginTop: 2 },
  activityStats: { width: 60, alignItems: 'center' },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  activityVal: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  progressTrack: { height: 4, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%' },
  accuracyCircle: { width: 45, alignItems: 'center', justifyContent: 'center', marginLeft: 10, borderLeftWidth: 1, borderLeftColor: '#F1F5F9' },
  accuracyText: { fontSize: 12, fontWeight: '900', color: '#1E293B' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 50 },
});

export default AdminAnalyticsScreen;
