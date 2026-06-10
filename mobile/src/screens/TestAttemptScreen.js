import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Dimensions, Image, BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetTestQuestionsQuery } from '../redux/apis/testApi';
import { useSelector } from 'react-redux';
import { getBaseUrl, getImageUrl } from '../utils/config';

const { width } = Dimensions.get('window');
const LEVEL_COLORS = { easy: ['#10B981', '#059669'], medium: ['#F59E0B', '#D97706'], hard: ['#EF4444', '#DC2626'] };
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const TestAttemptScreen = ({ route, navigation }) => {
  const { testId, testName, difficulty, totalSeconds } = route.params;
  const { isDarkMode } = useSelector((s) => s.theme);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [submitted, setSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef(null);

  const bg    = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card  = isDarkMode ? '#1E293B' : '#FFFFFF';
  const text  = isDarkMode ? '#F8FAFC' : '#1E293B';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';
  const border= isDarkMode ? '#334155' : '#E2E8F0';
  const colors = LEVEL_COLORS[difficulty] || ['#4F46E5', '#7C3AED'];

  const { data: questions = [], isLoading } = useGetTestQuestionsQuery(testId);

  const baseUrl = getBaseUrl().replace('/api', '');

  // ── Timer ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback((autoSubmit = false) => {
    clearInterval(timerRef.current);
    if (!autoSubmit) {
      const answered = Object.keys(answers).length;
      const unanswered = questions.length - answered;
      if (unanswered > 0) {
        Alert.alert(
          'Submit Test?',
          `You have ${unanswered} unanswered question(s). Submit anyway?`,
          [
            { text: 'Review First', style: 'cancel', onPress: () => {} },
            { text: 'Submit', onPress: () => setSubmitted(true) },
          ]
        );
        return;
      }
    }
    setSubmitted(true);
  }, [answers, questions]);

  useEffect(() => {
    if (submitted || isLoading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [submitted, isLoading]);

  // Block back button during test
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!submitted) {
        Alert.alert('Exit Test?', 'Your progress will be lost.', [
          { text: 'Stay', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => { clearInterval(timerRef.current); navigation.goBack(); } },
        ]);
        return true;
      }
      return false;
    });
    return () => back.remove();
  }, [submitted]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const score = questions.reduce((acc, q, i) => {
    const cAns = q.correctAnswer !== undefined ? q.correctAnswer : q.options?.findIndex(o => typeof o === 'object' && o?.isCorrect === true);
    return answers[i] === cAns ? acc + 1 : acc;
  }, 0);

  // ── RESULT SCREEN ────────────────────────────────────────────────────────
  if (submitted) {
    const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
    const resultColor = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <LinearGradient colors={colors} style={styles.resultBanner}>
            <MaterialCommunityIcons name="trophy" size={60} color="rgba(255,255,255,0.2)" style={styles.trophyBg} />
            <Text style={styles.resultLabel}>Test Complete!</Text>
            <Text style={styles.resultTest}>{testName}</Text>
          </LinearGradient>

          <View style={[styles.scoreBox, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.scorePct, { color: resultColor }]}>{pct}%</Text>
            <Text style={[styles.scoreDetail, { color: muted }]}>{score} / {questions.length} correct</Text>
            <View style={styles.scoreStats}>
              <View style={styles.scoreStat}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                <Text style={[styles.scoreStatVal, { color: text }]}>{score}</Text>
                <Text style={[styles.scoreStatLabel, { color: muted }]}>Correct</Text>
              </View>
              <View style={styles.scoreStat}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                <Text style={[styles.scoreStatVal, { color: text }]}>{questions.length - score}</Text>
                <Text style={[styles.scoreStatLabel, { color: muted }]}>Wrong</Text>
              </View>
              <View style={styles.scoreStat}>
                <MaterialCommunityIcons name="minus-circle" size={20} color={muted} />
                <Text style={[styles.scoreStatVal, { color: text }]}>{questions.length - Object.keys(answers).length}</Text>
                <Text style={[styles.scoreStatLabel, { color: muted }]}>Skipped</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.reviewToggle} onPress={() => setShowReview(!showReview)}>
            <Text style={[styles.reviewToggleText, { color: colors[0] }]}>
              {showReview ? 'Hide' : 'Show'} Answer Review
            </Text>
            <MaterialCommunityIcons name={showReview ? 'chevron-up' : 'chevron-down'} size={20} color={colors[0]} />
          </TouchableOpacity>

          {showReview && questions.map((q, qi) => {
            const userAns = answers[qi];
            const cAns = q.correctAnswer !== undefined ? q.correctAnswer : q.options?.findIndex(o => typeof o === 'object' && o?.isCorrect === true);
            const isCorrect = userAns === cAns;
            const imgUrl = getImageUrl(q.questionImage);
            const expImgUrl = getImageUrl(q.explanationImage);
            return (
              <View key={qi} style={[styles.reviewCard, { backgroundColor: card, borderColor: isCorrect ? '#10B981' : '#EF4444' }]}>
                <Text style={[styles.reviewQ, { color: text }]}>Q{qi + 1}. {q.question}</Text>
                {imgUrl && <Image source={{ uri: imgUrl }} style={styles.reviewImg} resizeMode="contain" />}
                {q.options.map((opt, oi) => {
                  const isUser = userAns === oi;
                  const isCorrectOpt = typeof opt === 'object' ? opt.isCorrect === true : cAns === oi;
                  return (
                    <View key={oi} style={[
                      styles.reviewOpt,
                      { borderColor: isCorrectOpt ? '#10B981' : isUser ? '#EF4444' : border },
                      isCorrectOpt && { backgroundColor: '#10B98115' },
                      isUser && !isCorrectOpt && { backgroundColor: '#EF444415' },
                    ]}>
                      <Text style={[styles.reviewOptLabel, { color: isCorrectOpt ? '#10B981' : isUser ? '#EF4444' : muted }]}>
                        {OPTION_LABELS[oi]}.
                      </Text>
                      <Text style={{ color: text, fontSize: 13 }}>{typeof opt === 'object' ? opt.text : opt}</Text>
                      {isCorrectOpt && <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" style={{ marginLeft: 'auto' }} />}
                      {isUser && !isCorrectOpt && <MaterialCommunityIcons name="close-circle" size={16} color="#EF4444" style={{ marginLeft: 'auto' }} />}
                    </View>
                  );
                })}
                {q.explanation ? (
                  <View style={[styles.expBox, { backgroundColor: colors[0] + '10', borderColor: colors[0] }]}>
                    <Text style={[styles.expLabel, { color: colors[0] }]}>Explanation</Text>
                    <Text style={[styles.expText, { color: text }]}>{q.explanation}</Text>
                    {expImgUrl && <Image source={{ uri: expImgUrl }} style={styles.reviewImg} resizeMode="contain" />}
                  </View>
                ) : null}
              </View>
            );
          })}

          <TouchableOpacity onPress={() => navigation.popToTop()}>
            <LinearGradient colors={colors} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Back to Tests</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── QUESTION SCREEN ──────────────────────────────────────────────────────
  if (isLoading || questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: muted, fontSize: 16 }}>Loading questions...</Text>
      </SafeAreaView>
    );
  }

  const q = questions[current];
  const answered = answers[current];
  const qImgUrl = getImageUrl(q.questionImage);
  const progress = ((current + 1) / questions.length) * 100;
  const timerPct = (timeLeft / totalSeconds) * 100;
  const timerColor = timeLeft < 60 ? '#EF4444' : timeLeft < 180 ? '#F59E0B' : colors[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      {/* Top Bar */}
      <LinearGradient colors={colors} style={styles.topBar}>
        <View style={styles.timerBox}>
          <MaterialCommunityIcons name="timer-outline" size={18} color={timeLeft < 60 ? '#FEE2E2' : '#fff'} />
          <Text style={[styles.timerText, timeLeft < 60 && { color: '#FEE2E2' }]}>{formatTime(timeLeft)}</Text>
        </View>
        <Text style={styles.progressText}>{current + 1} / {questions.length}</Text>
        <TouchableOpacity onPress={() => handleSubmit(false)} style={styles.submitTopBtn}>
          <Text style={styles.submitTopText}>Submit</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: border }]}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors[0] }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Question */}
        <View style={[styles.questionBox, { backgroundColor: card, borderColor: border }]}>
          <View style={[styles.qNumBadge, { backgroundColor: colors[0] + '20' }]}>
            <Text style={[styles.qNumText, { color: colors[0] }]}>Q {current + 1}</Text>
          </View>
          <Text style={[styles.questionText, { color: text }]}>{q.question}</Text>
          {qImgUrl && <Image source={{ uri: qImgUrl }} style={styles.questionImg} resizeMode="contain" />}
        </View>

        {/* Options */}
        {q.options.map((opt, i) => {
          const isSelected = answered === i;
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.85}
              onPress={() => setAnswers({ ...answers, [current]: i })}
              style={[
                styles.option,
                { backgroundColor: card, borderColor: isSelected ? colors[0] : border },
                isSelected && { backgroundColor: colors[0] + '15' },
              ]}
            >
              <LinearGradient
                colors={isSelected ? colors : [border, border]}
                style={styles.optLabel}
              >
                <Text style={[styles.optLabelText, { color: isSelected ? '#fff' : muted }]}>{OPTION_LABELS[i]}</Text>
              </LinearGradient>
              <Text style={[styles.optText, { color: isSelected ? colors[0] : text }]}>{typeof opt === 'object' ? opt.text : opt}</Text>
              {isSelected && <MaterialCommunityIcons name="check-circle" size={20} color={colors[0]} style={{ marginLeft: 'auto' }} />}
            </TouchableOpacity>
          );
        })}

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, { borderColor: border }, current === 0 && { opacity: 0.4 }]}
            onPress={() => current > 0 && setCurrent(current - 1)}
            disabled={current === 0}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color={text} />
            <Text style={{ color: text, fontWeight: '700' }}>Prev</Text>
          </TouchableOpacity>

          {/* Dot indicators */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={styles.dotRow}>
              {questions.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setCurrent(i)}>
                  <View style={[
                    styles.dot,
                    { backgroundColor: i === current ? colors[0] : answers[i] !== undefined ? colors[0] + '50' : border },
                  ]} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {current < questions.length - 1 ? (
            <TouchableOpacity style={[styles.navBtn, { borderColor: colors[0], backgroundColor: colors[0] + '15' }]} onPress={() => setCurrent(current + 1)}>
              <Text style={{ color: colors[0], fontWeight: '700' }}>Next</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors[0]} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors[0], borderColor: colors[0] }]} onPress={() => handleSubmit(false)}>
              <Text style={{ color: '#fff', fontWeight: '900' }}>Finish</Text>
              <MaterialCommunityIcons name="flag-checkered" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, elevation: 5 },
  timerBox: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  timerText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  progressText: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 14 },
  submitTopBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, marginLeft: 12 },
  submitTopText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  progressBar: { height: 4 },
  progressFill: { height: 4 },
  scroll: { padding: 20, paddingBottom: 40 },
  questionBox: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 20, elevation: 3 },
  qNumBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  qNumText: { fontWeight: '900', fontSize: 12 },
  questionText: { fontSize: 17, fontWeight: '700', lineHeight: 26 },
  questionImg: { width: '100%', height: 200, borderRadius: 12, marginTop: 14 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 12, gap: 14, elevation: 1 },
  optLabel: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  optLabelText: { fontWeight: '900', fontSize: 14 },
  optText: { flex: 1, fontSize: 15, fontWeight: '600' },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },

  // Result
  resultScroll: { padding: 20, paddingBottom: 60 },
  resultBanner: { borderRadius: 24, padding: 28, marginBottom: 16, overflow: 'hidden', elevation: 6 },
  trophyBg: { position: 'absolute', right: 20, bottom: 10 },
  resultLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  resultTest: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 },
  scoreBox: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 16, elevation: 2 },
  scorePct: { fontSize: 56, fontWeight: '900' },
  scoreDetail: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  scoreStats: { flexDirection: 'row', gap: 30 },
  scoreStat: { alignItems: 'center', gap: 4 },
  scoreStatVal: { fontSize: 20, fontWeight: '900' },
  scoreStatLabel: { fontSize: 11, fontWeight: '600' },
  reviewToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 },
  reviewToggleText: { fontSize: 15, fontWeight: '800' },
  reviewCard: { borderRadius: 18, borderWidth: 2, padding: 16, marginBottom: 14 },
  reviewQ: { fontSize: 14, fontWeight: '700', marginBottom: 12, lineHeight: 20 },
  reviewImg: { width: '100%', height: 160, borderRadius: 10, marginBottom: 12 },
  reviewOpt: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1.5, marginBottom: 8 },
  reviewOptLabel: { fontWeight: '900', fontSize: 12, width: 20 },
  expBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 10 },
  expLabel: { fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 6 },
  expText: { fontSize: 13, lineHeight: 20 },
  doneBtn: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 5 },
  doneBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});

export default TestAttemptScreen;
