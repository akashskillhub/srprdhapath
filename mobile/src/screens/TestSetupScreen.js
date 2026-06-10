import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

const TIMES = [
  { label: '10 min', value: 10, icon: 'clock-fast' },
  { label: '20 min', value: 20, icon: 'clock-outline' },
  { label: '30 min', value: 30, icon: 'clock-time-five-outline' },
  { label: 'Custom', value: -1, icon: 'clock-edit-outline' },
];

const LEVEL_COLORS = { easy: ['#10B981', '#059669'], medium: ['#F59E0B', '#D97706'], hard: ['#EF4444', '#DC2626'] };

const TestSetupScreen = ({ route, navigation }) => {
  const { testId, testName, questionCount, difficulty } = route.params;
  const { isDarkMode } = useSelector((s) => s.theme);

  const [selectedTime, setSelectedTime] = useState(10);
  const [customTime, setCustomTime] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const bg    = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card  = isDarkMode ? '#1E293B' : '#FFFFFF';
  const text  = isDarkMode ? '#F8FAFC' : '#1E293B';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';
  const border= isDarkMode ? '#334155' : '#E2E8F0';
  const colors = LEVEL_COLORS[difficulty] || ['#4F46E5', '#7C3AED'];

  const handleStartTest = () => {
    const totalMinutes = isCustom ? parseInt(customTime) : selectedTime;
    if (!totalMinutes || totalMinutes < 1) {
      return Alert.alert('Invalid Time', 'Please enter a valid time (min 1 minute)');
    }
    if (questionCount === 0) {
      return Alert.alert('No Questions', 'This test has no questions yet');
    }
    navigation.navigate('TestAttempt', {
      testId, testName, difficulty,
      totalSeconds: totalMinutes * 60,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <LinearGradient colors={colors} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 15, flex: 1 }}>
          <Text style={styles.headerTitle}>{testName}</Text>
          <Text style={styles.headerSub}>SETUP YOUR TEST</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: card, borderColor: border }]}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors[0]} />
            <Text style={[styles.infoLabel, { color: muted }]}>Total Questions</Text>
            <Text style={[styles.infoValue, { color: text }]}>{questionCount}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: border }]} />
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="signal-cellular-2" size={22} color={colors[0]} />
            <Text style={[styles.infoLabel, { color: muted }]}>Difficulty</Text>
            <Text style={[styles.infoValue, { color: colors[0], textTransform: 'capitalize' }]}>{difficulty}</Text>
          </View>
        </View>

        {/* Time Selection */}
        <Text style={[styles.sectionTitle, { color: text }]}>Select Test Duration</Text>
        <View style={styles.timeGrid}>
          {TIMES.map((t) => {
            const isSelected = t.value === -1 ? isCustom : (!isCustom && selectedTime === t.value);
            return (
              <TouchableOpacity
                key={t.label}
                style={[
                  styles.timeCard,
                  { backgroundColor: card, borderColor: isSelected ? colors[0] : border },
                  isSelected && { backgroundColor: colors[0] + '15' },
                ]}
                onPress={() => {
                  if (t.value === -1) { setIsCustom(true); }
                  else { setIsCustom(false); setSelectedTime(t.value); }
                }}
              >
                <MaterialCommunityIcons name={t.icon} size={26} color={isSelected ? colors[0] : muted} />
                <Text style={[styles.timeLabel, { color: isSelected ? colors[0] : text }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isCustom && (
          <View style={[styles.customInputBox, { backgroundColor: card, borderColor: colors[0] }]}>
            <MaterialCommunityIcons name="pencil-outline" size={20} color={colors[0]} />
            <TextInput
              style={[styles.customInput, { color: text }]}
              placeholder="Enter minutes (e.g. 45)"
              placeholderTextColor={muted}
              keyboardType="number-pad"
              value={customTime}
              onChangeText={setCustomTime}
            />
            <Text style={{ color: muted, fontWeight: '600' }}>min</Text>
          </View>
        )}

        {/* Tips */}
        <View style={[styles.tipsBox, { backgroundColor: card, borderColor: border }]}>
          <Text style={[styles.tipsTitle, { color: text }]}>Before You Begin</Text>
          {[
            'Read each question carefully',
            'You can review/change answers before submitting',
            'Timer starts immediately after you tap Start',
          ].map((tip, i) => (
            <View key={i} style={styles.tip}>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color={colors[0]} />
              <Text style={[styles.tipText, { color: muted }]}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Start Button */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleStartTest}>
          <LinearGradient colors={colors} style={styles.startBtn}>
            <MaterialCommunityIcons name="play-circle-outline" size={24} color="#fff" />
            <Text style={styles.startBtnText}>
              Start Test · {isCustom ? (customTime || '?') : selectedTime} min
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, elevation: 5 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 1 },
  scroll: { padding: 20, paddingBottom: 50 },
  infoCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 24, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  infoValue: { fontSize: 16, fontWeight: '900' },
  infoDivider: { height: 1, marginVertical: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 14 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  timeCard: {
    width: '47%', padding: 18, borderRadius: 18, borderWidth: 2,
    alignItems: 'center', gap: 8, elevation: 2,
  },
  timeLabel: { fontSize: 15, fontWeight: '800' },
  customInputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderRadius: 14, padding: 14,
    marginBottom: 16, gap: 10,
  },
  customInput: { flex: 1, fontSize: 16, fontWeight: '700' },
  tipsBox: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 24 },
  tipsTitle: { fontSize: 15, fontWeight: '900', marginBottom: 12 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  tipText: { fontSize: 13, flex: 1, lineHeight: 20 },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 58, borderRadius: 16, gap: 12, elevation: 6 },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
});

export default TestSetupScreen;
