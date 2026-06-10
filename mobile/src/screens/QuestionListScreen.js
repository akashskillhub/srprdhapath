import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { useSelector } from 'react-redux';
import { 
  useGetPYQQuestionsQuery,
  useGetPracticeQuestionsQuery,
  useGetProgressQuery,
  useSaveProgressMutation,
} from '../redux/apis/studentApi';
import { getImageUrl } from '../utils/config';

const { width, height } = Dimensions.get('window');

const QuestionListScreen = ({ route, navigation }) => {
  const { folderId, title, type } = route.params; // type: 'PYQ' or 'Practice'
  const { isDarkMode } = useSelector((state) => state.theme);
  
  const [questions, setQuestions] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetching questions based on type
  const queryParams = type === 'PYQ' ? { subjectId: folderId } : { subjectId: folderId };
  const { data: qData, isLoading, isError } = type === 'PYQ' 
    ? useGetPYQQuestionsQuery({ subjectId: folderId }) 
    : useGetPracticeQuestionsQuery({ subjectId: folderId });

  const { data: progressData, isLoading: progressLoading, refetch: refetchProgress } = useGetProgressQuery();
  const [saveProgress] = useSaveProgressMutation();

  useEffect(() => {
    if (qData && progressData && !initialized) {
      const solvedIds = progressData.solvedQuestionIds || [];
      const unsolved = qData.filter(q => !solvedIds.includes(q._id));
      
      // If solved all questions in this category, start again from 1st (no filtering)
      const finalQuestions = unsolved.length > 0 ? unsolved : qData;
      setQuestions(finalQuestions);
      setInitialized(true);
    }
  }, [qData, progressData, initialized]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
      setSelectedOption(null);
      fadeAnim.setValue(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowExplanation(false);
      setSelectedOption(null);
      fadeAnim.setValue(0);
    }
  };

  if (isLoading || progressLoading || !initialized) return (
    <View style={[styles.center, isDarkMode && styles.containerDark]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (isError || questions.length === 0) return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>{title}</Text>
      </View>
      <View style={styles.center}>
        <MaterialCommunityIcons name="comment-question-outline" size={60} color="#CBD5E1" />
        <Text style={styles.emptyText}>No questions available in this section.</Text>
      </View>
    </SafeAreaView>
  );

  const currentQuestion = questions[currentIndex] || {};

  const renderOption = (index) => {
    const opt = currentQuestion.options[index];
    const isCorrect = typeof opt === 'object' ? opt?.isCorrect === true : index === currentQuestion.correctAnswer;
    const isSelected = selectedOption === index;
    
    let optionStyle = styles.option;
    if (showExplanation && isCorrect) optionStyle = [styles.option, styles.optionCorrect];
    else if (isSelected) optionStyle = [styles.option, isCorrect ? styles.optionCorrect : styles.optionWrong];

    return (
      <TouchableOpacity 
        key={index}
        style={[optionStyle, isDarkMode && styles.optionDark]}
        onPress={async () => {
          if (!showExplanation) {
            setSelectedOption(index);
            setShowExplanation(true);
            
            // Save solved progress to database
            try {
              await saveProgress({
                results: [{
                  questionId: currentQuestion._id,
                  isCorrect,
                  subject: currentQuestion.subject || 'General',
                  topic: currentQuestion.topic || 'General',
                  folderId: folderId
                }]
              }).unwrap();
              refetchProgress();
            } catch (err) {
              console.warn('Failed to save progress:', err);
            }
          }
        }}
        disabled={showExplanation}
      >
        <Text style={[styles.optionContent, isDarkMode && styles.textDark]}>
          {String.fromCharCode(65 + index)}. {typeof opt === 'object' ? opt?.text : opt}
        </Text>
        {showExplanation && isCorrect && <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />}
        {showExplanation && isSelected && !isCorrect && <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, isDarkMode && styles.textDark]} numberOfLines={1}>{title}</Text>
          <Text style={styles.headerSub}>Question {currentIndex + 1} of {questions.length}</Text>
        </View>
      </View>

      <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.questionCard, isDarkMode && styles.cardDark]}>
            <Text style={[styles.questionTitle, isDarkMode && styles.textDark]}>{currentQuestion.questionText}</Text>
            {currentQuestion.questionImage && (
              <Image source={{ uri: getImageUrl(currentQuestion.questionImage) }} style={styles.qImage} resizeMode="contain" />
            )}
          </View>

          <View style={styles.optionsWrapper}>
            {[0, 1, 2, 3].map(renderOption)}
          </View>

          {showExplanation && (
            <View style={[styles.explanationCard, isDarkMode && styles.cardDark]}>
              <View style={styles.exHeader}>
                <MaterialCommunityIcons name="lightbulb-on" size={20} color="#F59E0B" />
                <Text style={styles.exTitle}>Explanation</Text>
              </View>
              {currentQuestion.explanationText ? (
                 <Text style={[styles.exText, isDarkMode && styles.textDark]}>{currentQuestion.explanationText}</Text>
              ) : null}
              {currentQuestion.explanationImage && (
                <Image source={{ uri: getImageUrl(currentQuestion.explanationImage) }} style={styles.exImage} resizeMode="contain" />
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.navBtn, currentIndex === 0 && styles.disabledBtn]} 
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
          <Text style={styles.navBtnText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, currentIndex === questions.length - 1 && styles.disabledBtn]} 
          onPress={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          <Text style={styles.navBtnText}>Next</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { marginRight: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSub: { fontSize: 12, color: '#64748B' },
  textDark: { color: '#fff' },
  progressContainer: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  progressBar: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary },
  scroll: { padding: SPACING.md, paddingBottom: 100 },
  questionCard: { backgroundColor: '#fff', padding: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.lg },
  cardDark: { backgroundColor: '#1E293B' },
  questionTitle: { fontSize: 18, lineHeight: 26, fontWeight: '600', color: '#1E293B' },
  qImage: { width: '100%', height: 200, marginTop: SPACING.md, borderRadius: RADIUS.md },
  optionsWrapper: { marginBottom: SPACING.lg },
  option: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#fff', 
    padding: SPACING.md, 
    borderRadius: RADIUS.md, 
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  optionDark: { backgroundColor: '#1E293B', borderColor: '#334155' },
  optionContent: { flex: 1, fontSize: 15 },
  optionCorrect: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  optionWrong: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  explanationCard: { backgroundColor: '#FFFBEB', padding: SPACING.md, borderRadius: RADIUS.md, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  exHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  exTitle: { marginLeft: SPACING.xs, fontWeight: 'bold', color: '#B45309' },
  exText: { fontSize: 14, color: '#78350F', lineHeight: 20 },
  exImage: { width: '100%', height: 150, marginTop: SPACING.md, borderRadius: RADIUS.sm },
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.md,
    backgroundColor: 'transparent'
  },
  navBtn: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, 
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4
  },
  navBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginHorizontal: 5 },
  disabledBtn: { backgroundColor: '#CBD5E1' },
});

export default QuestionListScreen;
