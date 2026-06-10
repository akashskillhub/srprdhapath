import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { 
  useGetPracticeSubjectsQuery,
  useGetPracticeChaptersQuery,
  useGetPracticeQuestionsQuery,
} from '../redux/apis/studentApi';
import { 
  useCreatePracticeSubjectMutation,
  useUpdatePracticeSubjectMutation,
  useDeletePracticeSubjectMutation,
  useCreatePracticeChapterMutation,
  useUpdatePracticeChapterMutation,
  useDeletePracticeChapterMutation,
  useCreatePracticeQuestionMutation,
  useUpdateQuestionMutation,
  useDeletePracticeQuestionMutation,
} from '../redux/apis/adminApi';
import { getImageUrl } from '../utils/config';

const PracticeQuestionsScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const isAdmin = user?.role === 'admin';

  const [currentLayer, setCurrentLayer] = useState('MAIN'); // MAIN, SUBJECT, CHAPTER
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // RTK Queries
  const { data: dbSubjects = [], isLoading: loadingSubjects } = useGetPracticeSubjectsQuery();
  const { data: dbChapters = [], isLoading: loadingChapters } = useGetPracticeChaptersQuery(
    selectedSubject?._id,
    { skip: !selectedSubject }
  );
  const qParams = currentLayer === 'ALL_QUESTIONS' 
    ? { category: 'ALL QUESTIONS', type: 'PRACTICE' } 
    : { subjectId: selectedChapter?._id };

  const { data: dbQuestions = [], isLoading: loadingQs } = useGetPracticeQuestionsQuery(
    qParams,
    { skip: currentLayer !== 'ALL_QUESTIONS' && !selectedChapter }
  );

  // Admin Mutations
  const [createSubject] = useCreatePracticeSubjectMutation();
  const [updateSubject] = useUpdatePracticeSubjectMutation();
  const [deleteSubject] = useDeletePracticeSubjectMutation();
  const [createChapter] = useCreatePracticeChapterMutation();
  const [updateChapter] = useUpdatePracticeChapterMutation();
  const [deleteChapter] = useDeletePracticeChapterMutation();
  const [createQuestion] = useCreatePracticeQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeletePracticeQuestionMutation();

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [showMCQForm, setShowMCQForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState('');

  // MCQ Form State
  const [qText, setQText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [exText, setExText] = useState('');
  const [qImage, setQImage] = useState(null);
  const [exImage, setExImage] = useState(null);

  const pickImage = async (setter) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const handleAdminAction = async () => {
    if (!name.trim()) return;
    try {
      if (currentLayer === 'SUBJECT') {
        if (editingItem) await updateSubject({ id: editingItem._id, name }).unwrap();
        else await createSubject({ name }).unwrap();
      } else if (currentLayer === 'CHAPTER') {
        if (editingItem) await updateChapter({ id: editingItem._id, name }).unwrap();
        else await createChapter({ name, subjectId: selectedSubject._id }).unwrap();
      }
      setName('');
      setEditingItem(null);
      setShowForm(false);
      Alert.alert('Success', 'Operation successful!');
    } catch (err) { Alert.alert('Error', 'Server rejection.'); }
  };

  const handleSaveQuestion = async () => {
    if (!qText.trim() || options.some(o => !o.trim())) {
      Alert.alert('Error', 'Please fill all question fields');
      return;
    }
    const formData = new FormData();
    formData.append('questionText', qText);
    formData.append('options', JSON.stringify(options));
    formData.append('correctAnswer', correctIdx.toString());
    formData.append('explanationText', exText);
    if (currentLayer === 'QUESTIONS') {
      formData.append('subjectId', selectedChapter._id);
    } else {
      formData.append('category', 'ALL QUESTIONS');
    }
    formData.append('type', 'PRACTICE');

    // Only append if it's a new local file (not already uploaded remote HTTP URL)
    if (qImage && !qImage.startsWith('http')) {
      formData.append('questionImage', { uri: qImage, name: 'q.jpg', type: 'image/jpeg' });
    }
    if (exImage && !exImage.startsWith('http')) {
      formData.append('explanationImage', { uri: exImage, name: 'ex.jpg', type: 'image/jpeg' });
    }

    try {
      if (editingItem) {
        await updateQuestion({ id: editingItem._id, formData }).unwrap();
      } else {
        await createQuestion(formData).unwrap();
      }
      setQText(''); setOptions(['', '', '', '']); setExText(''); setQImage(null); setExImage(null);
      setEditingItem(null);
      setShowMCQForm(false);
      Alert.alert('Success', editingItem ? 'Question updated successfully!' : 'Question added successfully!');
    } catch (e) { Alert.alert('Error', e.data?.message || 'Failed to save question'); }
  };

  const handleEditQuestion = (q) => {
    setEditingItem(q);
    setQText(q.questionText || q.title || '');
    if (q.options && Array.isArray(q.options)) {
      const opts = q.options.map(opt => typeof opt === 'object' ? opt.text : opt);
      setOptions(opts.length >= 4 ? opts.slice(0, 4) : [...opts, ...Array(4 - opts.length).fill('')]);
      
      const correctIndex = q.options.findIndex(opt => typeof opt === 'object' ? opt.isCorrect === true : false);
      setCorrectIdx(correctIndex !== -1 ? correctIndex : parseInt(q.correctAnswer || 0));
    } else {
      setOptions(['', '', '', '']);
      setCorrectIdx(0);
    }
    setExText(q.explanation?.text || '');
    setQImage(q.imageUrl ? getImageUrl(q.imageUrl) : null);
    setExImage(q.explanation?.image ? getImageUrl(q.explanation.image) : null);
    setShowMCQForm(true);
  };

  const confirmDelete = (item, type) => {
    Alert.alert('Delete?', `Remove ${item.name || 'this item'}?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            if (type === 'SUBJECT') await deleteSubject(item._id).unwrap();
            else if (type === 'CHAPTER') await deleteChapter(item._id).unwrap();
            else await deleteQuestion(item._id).unwrap();
          } catch(e) { Alert.alert('Error', 'Failed to delete'); }
        }
      }
    ]);
  };

  const handleBack = () => {
    if (currentLayer === 'QUESTIONS') setCurrentLayer('CHAPTER');
    else if (currentLayer === 'CHAPTER') setCurrentLayer('SUBJECT');
    else if (currentLayer === 'SUBJECT') setCurrentLayer('MAIN');
    else navigation.goBack();
  };

  const renderHeader = () => (
    <LinearGradient
      colors={isDarkMode ? ['#312E81', '#1E1B4B', '#0F172A'] : ['#4F46E5', '#3B82F6', '#2563EB']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.premiumHeader}
    >
      {/* Decorative circles */}
      <View style={styles.headerCircle1} />
      <View style={styles.headerCircle2} />

      <View style={styles.headerInner}>
        <TouchableOpacity onPress={handleBack} style={styles.floatingBackBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.premiumHeaderTitle}>
            {currentLayer === 'MAIN' ? 'Practice Hub' : currentLayer === 'SUBJECT' ? 'Subjects' : (selectedChapter?.name || selectedSubject?.name)}
          </Text>
          <View style={styles.breadcrumbBadge}>
            <MaterialCommunityIcons name="flash-outline" size={12} color="rgba(255,255,255,0.9)" style={{ marginRight: 4 }} />
            <Text style={styles.premiumHeaderSubtitle}>Intelligence / {currentLayer}</Text>
          </View>
        </View>
        {isAdmin && (
           <View style={styles.headerAdminBadge}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
           </View>
        )}
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      {renderHeader()}
      
      <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        {isAdmin && currentLayer !== 'MAIN' && (
          <View style={styles.adminControlsRestored}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => { 
                if (currentLayer === 'QUESTIONS' || currentLayer === 'ALL_QUESTIONS') {
                  if (!showMCQForm) {
                    setEditingItem(null);
                    setQText('');
                    setOptions(['', '', '', '']);
                    setCorrectIdx(0);
                    setExText('');
                    setQImage(null);
                    setExImage(null);
                  }
                  setShowMCQForm(!showMCQForm);
                } else { 
                  setShowForm(!showForm); 
                  setEditingItem(null); 
                  setName(''); 
                }
              }}
              style={styles.premiumActionCard}
            >
              <LinearGradient colors={['#8B5CF6', '#D946EF']} style={styles.gradientActionBox}>
                <MaterialCommunityIcons name={(showForm || showMCQForm) ? "close" : "plus-circle-outline"} size={26} color="#fff" />
                <View style={styles.actionTextWrapper}>
                  <Text style={styles.actionTitle}>{(showForm || showMCQForm) ? 'Cancel' : `Add ${currentLayer === 'SUBJECT' ? 'Subject' : currentLayer === 'CHAPTER' ? 'Chapter' : 'MCQ'}`}</Text>
                  <Text style={styles.actionSubtitle}>Modify your library</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {showForm && (
              <View style={[styles.modernForm, isDarkMode && styles.formDark]}>
                <View style={styles.formHeaderContainer}>
                  <Text style={[styles.formTitle, isDarkMode && styles.textDark]}>
                    {editingItem ? `Update ${currentLayer === 'SUBJECT' ? 'Subject' : 'Chapter'}` : `Add New ${currentLayer === 'SUBJECT' ? 'Subject' : 'Chapter'}`}
                  </Text>
                  {editingItem && (
                    <TouchableOpacity 
                      onPress={() => {
                        setEditingItem(null);
                        setName('');
                        setShowForm(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="close-circle" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput 
                  style={[styles.premiumInput, isDarkMode && styles.inputDark]} 
                  placeholder={editingItem ? "Update name..." : "Name..."} 
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  value={name} 
                  onChangeText={setName} 
                  autoFocus 
                />
                <TouchableOpacity 
                  onPress={handleAdminAction} 
                  style={[styles.finalGradientBtn, editingItem && { backgroundColor: '#10B981' }]}
                  activeOpacity={0.85}
                >
                   <Text style={styles.btnText}>{editingItem ? 'Update Now' : 'Save Details'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {showMCQForm && (
              <View style={[styles.modernForm, isDarkMode && styles.formDark]}>
                <TextInput style={[styles.premiumInput, isDarkMode && styles.inputDark]} placeholder="Question Text" placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'} multiline value={qText} onChangeText={setQText} />
                <TouchableOpacity 
                  style={[
                    styles.imagePicker, 
                    { 
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', 
                      borderColor: isDarkMode ? '#334155' : '#CBD5E1' 
                    }
                  ]} 
                  onPress={() => pickImage(setQImage)}
                >
                  {qImage ? <Image source={{ uri: qImage }} style={styles.preview} /> : <Text style={styles.pickerText}>+ Add Question Image</Text>}
                </TouchableOpacity>
                {options.map((opt, idx) => (
                  <View key={idx} style={styles.optionRowMCQ}>
                    <TouchableOpacity onPress={() => setCorrectIdx(idx)} style={[styles.radio, isDarkMode && styles.radioDark, correctIdx === idx && styles.radioActive]}>
                       <Text style={{color: correctIdx === idx ? '#fff' : (isDarkMode ? '#94A3B8' : '#64748B'), fontWeight: 'bold'}}>{String.fromCharCode(65 + idx)}</Text>
                    </TouchableOpacity>
                    <TextInput style={[styles.premiumInput, isDarkMode && styles.inputDark, { flex: 1, marginBottom: 0 }]} placeholder={`Option ${idx + 1}`} placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'} value={opt} onChangeText={(t) => {
                      const newOpts = [...options]; newOpts[idx] = t; setOptions(newOpts);
                    }} />
                  </View>
                ))}
                <TextInput style={[styles.premiumInput, isDarkMode && styles.inputDark, { marginTop: 15 }]} placeholder="Explanation (Optional)" placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'} multiline value={exText} onChangeText={setExText} />
                <TouchableOpacity 
                  style={[
                    styles.imagePicker, 
                    { 
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', 
                      borderColor: isDarkMode ? '#334155' : '#CBD5E1' 
                    }
                  ]} 
                  onPress={() => pickImage(setExImage)}
                >
                  {exImage ? <Image source={{ uri: exImage }} style={styles.preview} /> : <Text style={styles.pickerText}>+ Add Explanation Image</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveQuestion} style={[styles.finalGradientBtn, { backgroundColor: '#10B981' }]}>
                   <Text style={styles.btnText}>Post MCQ</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {currentLayer === 'MAIN' && (
          <View style={{ gap: 20 }}>
            {/* Subject Wise Card */}
            <TouchableOpacity 
              activeOpacity={0.85} 
              onPress={() => setCurrentLayer('SUBJECT')}
            >
              <LinearGradient
                colors={isDarkMode ? ['#1E293B', '#1E293B'] : ['#FFFFFF', '#F8FAFC']}
                style={[styles.premiumFolderCard, isDarkMode && { borderColor: '#334155' }]}
              >
                <LinearGradient
                  colors={['#4338CA', '#6366F1']}
                  style={styles.iconCircleGradient}
                >
                  <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#fff" />
                </LinearGradient>
                
                <View style={{ flex: 1 }}>
                  <Text style={[styles.folderTitle, isDarkMode && styles.textDark]}>Subject Wise</Text>
                  <Text style={styles.folderSub}>Structured learning paths</Text>
                </View>

                <View style={[styles.folderChevronCircle, { backgroundColor: '#4338CA20' }]}>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#4338CA" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* All Questions Card */}
            <TouchableOpacity 
              activeOpacity={0.85} 
              onPress={() => setCurrentLayer('ALL_QUESTIONS')}
            >
              <LinearGradient
                colors={isDarkMode ? ['#1E293B', '#1E293B'] : ['#FFFFFF', '#F8FAFC']}
                style={[styles.premiumFolderCard, isDarkMode && { borderColor: '#334155' }]}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.iconCircleGradient}
                >
                  <MaterialCommunityIcons name="lightning-bolt" size={28} color="#fff" />
                </LinearGradient>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.folderTitle, isDarkMode && styles.textDark]}>All Questions</Text>
                  <Text style={styles.folderSub}>Combined practice pool</Text>
                </View>

                <View style={[styles.folderChevronCircle, { backgroundColor: '#8B5CF620' }]}>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#8B5CF6" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {currentLayer === 'SUBJECT' && (
          loadingSubjects ? <ActivityIndicator size="large" color={COLORS.primary} /> :
          dbSubjects.map((item, index) => {
            const isLocked = !user?.isPro && index > 0 && !isAdmin;
            return (
              <View key={item._id} style={[styles.folderItem, isDarkMode && styles.cardDark, isLocked && { opacity: 0.7 }]}>
                <TouchableOpacity 
                  onPress={() => { 
                    if (isLocked) {
                      navigation.navigate('Subscription');
                      return;
                    }
                    setSelectedSubject(item); 
                    setCurrentLayer('CHAPTER'); 
                  }} 
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={[styles.iconCircle, { backgroundColor: isLocked ? '#94A3B820' : '#F59E0B15' }]}>
                    <MaterialCommunityIcons name={isLocked ? "lock-outline" : "folder-outline"} size={26} color={isLocked ? "#94A3B8" : "#F59E0B"} />
                  </View>
                  <Text style={[styles.folderTitle, isDarkMode && styles.textDark]}>{item.name}</Text>
                  {isLocked && <MaterialCommunityIcons name="crown" size={18} color="#F59E0B" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
                {isAdmin && (
                  <View style={styles.adminActionContainer}>
                    <TouchableOpacity 
                      onPress={() => {
                        setEditingItem(item);
                        setName(item.name);
                        setShowForm(true);
                      }}
                      style={[styles.editButton, isDarkMode && { backgroundColor: '#4F46E530' }]}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={20} color={isDarkMode ? "#A5B4FC" : "#4F46E5"} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => confirmDelete(item, 'SUBJECT')}
                      style={[styles.deleteButton, isDarkMode && { backgroundColor: '#EF444430' }]}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        {currentLayer === 'CHAPTER' && (
          loadingChapters ? <ActivityIndicator size="large" color={COLORS.primary} /> :
          dbChapters.map((item, index) => {
            const isLocked = !user?.isPro && index > 0 && !isAdmin;
            return (
              <View key={item._id} style={[styles.folderItem, isDarkMode && styles.cardDark, isLocked && { opacity: 0.7 }]}>
                <TouchableOpacity 
                  onPress={() => { 
                    if (isLocked) {
                      navigation.navigate('Subscription');
                      return;
                    }
                    setSelectedChapter(item); 
                    setCurrentLayer('QUESTIONS'); 
                  }} 
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={[styles.iconCircle, { backgroundColor: isLocked ? '#94A3B820' : '#10B98115' }]}>
                    <MaterialCommunityIcons name={isLocked ? "lock-outline" : "file-tree"} size={26} color={isLocked ? "#94A3B8" : "#10B981"} />
                  </View>
                  <Text style={[styles.folderTitle, isDarkMode && styles.textDark]}>{item.name}</Text>
                  {isLocked && <MaterialCommunityIcons name="crown" size={18} color="#F59E0B" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
                {isAdmin && (
                  <View style={styles.adminActionContainer}>
                    <TouchableOpacity 
                      onPress={() => {
                        setEditingItem(item);
                        setName(item.name);
                        setShowForm(true);
                      }}
                      style={[styles.editButton, isDarkMode && { backgroundColor: '#4F46E530' }]}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={20} color={isDarkMode ? "#A5B4FC" : "#4F46E5"} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => confirmDelete(item, 'CHAPTER')}
                      style={[styles.deleteButton, isDarkMode && { backgroundColor: '#EF444430' }]}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        {(currentLayer === 'QUESTIONS' || currentLayer === 'ALL_QUESTIONS') && (
          loadingQs ? <ActivityIndicator size="large" color={COLORS.primary} /> :
          dbQuestions.length === 0 ? <Text style={styles.emptyText}>Empty</Text> :
          dbQuestions.map((q, idx) => (
            <View key={q._id} style={[styles.qBox, isDarkMode && styles.cardDark]}>
               <View style={styles.qHeaderSmall}>
                  <Text style={styles.qIdx}>Question {idx+1}</Text>
                  {isAdmin && (
                    <View style={styles.adminActionContainer}>
                      <TouchableOpacity 
                        onPress={() => handleEditQuestion(q)}
                        style={[styles.editButton, isDarkMode && { backgroundColor: '#4F46E530' }]}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons name="pencil-outline" size={18} color={isDarkMode ? "#A5B4FC" : "#4F46E5"} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => confirmDelete(q, 'QUESTION')}
                        style={[styles.deleteButton, isDarkMode && { backgroundColor: '#EF444430' }]}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons name="delete-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
               </View>
               {q.imageUrl && <Image source={{ uri: getImageUrl(q.imageUrl) }} resizeMode="cover" style={styles.adminQImage} />}
               <Text style={[styles.qContent, isDarkMode && styles.textDark]}>{q.questionText || q.title}</Text>
               {isAdmin && (
                  <View style={styles.adminOptionsList}>
                    {q.options?.map((opt, oIdx) => {
                      const isCorrect = typeof opt === 'object' ? opt.isCorrect === true : oIdx.toString() === q.correctAnswer?.toString();
                      const optText = typeof opt === 'object' ? opt.text : opt;
                      return (
                        <View key={oIdx} style={[styles.adminOptRow, isDarkMode && styles.adminOptRowDark, isCorrect && (isDarkMode ? styles.adminOptCorrectDark : styles.adminOptCorrect)]}>
                          <View style={[styles.optDot, isCorrect && {backgroundColor: '#10B981'}]} />
                          <Text style={[
                            styles.adminOptText, 
                            isDarkMode && styles.textDark, 
                            isCorrect && {fontWeight: 'bold', color: isDarkMode ? '#10B981' : '#059669'}
                          ]}>
                            {String.fromCharCode(65 + oIdx)}) {optText}
                          </Text>
                          {isCorrect && (
                            <View style={styles.correctBadge}>
                              <Text style={styles.correctBadgeText}>CORRECT</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                    {(q.explanation?.text || q.explanation?.image) && (
                      <View style={[styles.adminExpBox, isDarkMode && styles.adminExpBoxDark]}>
                        <Text style={styles.adminExpLabel}>EXPLANATION PROVIDED</Text>
                        {q.explanation.image && <Image source={{ uri: getImageUrl(q.explanation.image) }} style={styles.adminExpImage} />}
                        <Text style={[styles.adminExpText, isDarkMode && styles.textMutedDark]} numberOfLines={3}>{q.explanation.text || "See Image Explanation above."}</Text>
                      </View>
                    )}
                 </View>
               )}

               {!isAdmin && (
                 <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('QuestionList', { type: 'Practice', folderId: q.subjectId || 'ALL', title: selectedChapter?.name || 'Practice Pool' })}>
                    <Text style={styles.startBtnText}>Start Solving</Text>
                 </TouchableOpacity>
               )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  premiumHeader: { 
    paddingTop: 45, 
    paddingBottom: 35, 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40, 
    elevation: 20,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, zIndex: 10 },
  floatingBackBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTextContainer: { flex: 1 },
  premiumHeaderTitle: { 
    fontSize: 26, 
    fontFamily: 'Outfit-Bold', 
    color: '#fff',
    letterSpacing: -0.5,
  },
  breadcrumbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  premiumHeaderSubtitle: { 
    fontSize: 10, 
    color: '#fff', 
    fontFamily: 'Outfit-Bold', 
    textTransform: 'uppercase', 
    letterSpacing: 1.2 
  },
  headerAdminBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mainContent: { padding: 20, paddingBottom: 100 },
  adminControlsRestored: { marginBottom: 20 },
  premiumActionCard: { borderRadius: 24, elevation: 8, overflow: 'hidden' },
  gradientActionBox: { padding: 22, flexDirection: 'row', alignItems: 'center' },
  actionTextWrapper: { marginLeft: 15 },
  actionTitle: { color: '#fff', fontSize: 18, fontFamily: 'Outfit-Bold' },
  actionSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Outfit-Regular' },
  modernForm: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 24, 
    marginTop: 20, 
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  formDark: { backgroundColor: '#1E293B' },
  premiumInput: { 
    backgroundColor: '#F1F5F9', 
    padding: 18, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    marginBottom: 16, 
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
    color: '#1E293B',
  },
  inputDark: { backgroundColor: '#0F172A', color: '#fff', borderColor: '#334155' },
  finalGradientBtn: { backgroundColor: '#4F46E5', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 4 },
  btnText: { color: '#fff', fontFamily: 'Outfit-Bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  folderItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 24, 
    marginBottom: 16, 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardDark: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  radioDark: { backgroundColor: '#0F172A' },
  adminOptRowDark: { backgroundColor: '#0F172A', borderColor: '#334155' },
  adminOptCorrectDark: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' },
  adminExpBoxDark: { backgroundColor: '#0F172A', borderLeftColor: '#0EA5E9' },
  textMutedDark: { color: '#94A3B8' },
  iconCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  folderTitle: { fontSize: 18, fontFamily: 'Outfit-Bold', color: '#1E293B' },
  folderSub: { fontSize: 13, color: '#94A3B8', fontFamily: 'Outfit-Medium', marginTop: 2 },
  textDark: { color: '#fff' },
  qBox: { 
    backgroundColor: '#fff', 
    padding: 24, 
    borderRadius: 32, 
    marginBottom: 24, 
    elevation: 4, 
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 15,
    borderLeftWidth: 8, 
    borderLeftColor: '#4F46E5' 
  },
  qHeaderSmall: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, alignItems: 'center' },
  qIdx: { fontSize: 12, fontFamily: 'Outfit-Bold', color: '#4F46E5', textTransform: 'uppercase', letterSpacing: 1 },
  qContent: { fontSize: 17, color: '#1E293B', fontFamily: 'Outfit-SemiBold', marginBottom: 20, lineHeight: 26 },
  startBtn: { 
    backgroundColor: '#4F46E5', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    elevation: 4,
  },
  startBtnText: { color: '#fff', fontFamily: 'Outfit-Bold', fontSize: 15, textTransform: 'uppercase' },
  premiumFolderCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 28, 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  iconCircleGradient: { 
    width: 60, 
    height: 60, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  folderChevronCircle: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  imagePicker: { 
    height: 140, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 20, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#CBD5E1', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20 
  },
  preview: { width: '100%', height: '100%', borderRadius: 18 },
  pickerText: { color: '#64748B', fontSize: 13, fontFamily: 'Outfit-Bold' },
  optionRowMCQ: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  radio: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: '#F1F5F9', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  radioActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  adminQImage: { width: '100%', height: 200, borderRadius: 24, marginBottom: 20 },
  emptyText: { textAlign: 'center', marginTop: 60, color: '#94A3B8', fontFamily: 'Outfit-Medium', fontSize: 15 },
  adminOptionsList: { marginTop: 15, gap: 12 },
  adminOptRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    padding: 14, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: '#F1F5F9' 
  },
  adminOptCorrect: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  optDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#CBD5E1', marginRight: 14 },
  adminOptText: { fontSize: 15, color: '#475569', flex: 1, fontFamily: 'Outfit-Medium' },
  correctBadge: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  correctBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Outfit-Bold' },
  adminExpBox: { 
    marginTop: 20, 
    padding: 20, 
    backgroundColor: '#F0F9FF', 
    borderRadius: 20, 
    borderLeftWidth: 6, 
    borderLeftColor: '#0EA5E9' 
  },
  adminExpLabel: { fontSize: 11, fontFamily: 'Outfit-Bold', color: '#0EA5E9', marginBottom: 8, letterSpacing: 0.5 },
  adminExpText: { fontSize: 14, color: '#334155', lineHeight: 22, fontFamily: 'Outfit-Medium' },
  adminExpImage: { width: '100%', height: 140, borderRadius: 16, marginVertical: 10 },
  adminActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    marginRight: 4,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  formHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default PracticeQuestionsScreen;
