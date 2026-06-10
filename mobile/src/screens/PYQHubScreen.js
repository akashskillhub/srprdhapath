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
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  useGetPYQCategoriesQuery,
  useGetPYQSubjectsQuery,
  useGetPYQGroupsQuery,
  useGetPYQYearsQuery,
  useGetPYQQuestionsQuery,
} from '../redux/apis/studentApi';
import {
  useCreatePYQSubjectMutation,
  useCreatePYQGroupMutation,
  useCreatePYQYearMutation,
  useCreatePYQQuestionMutation,
  useUpdatePYQQuestionMutation,
  useDeletePYQQuestionMutation,
  useUpdateQuestionMutation,
  useUpdatePYQHubFolderMutation,
  useDeletePYQHubFolderMutation,
} from '../redux/apis/adminApi';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { getImageUrl } from '../utils/config';

const PYQHubScreen = ({ navigation, route }) => {
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const isAdmin = user?.role === 'admin';

  // parentStack tracks the navigation depth
  // [ { id: null, name: 'PYQ HUB', type: 'root' } ]
  const [parentStack, setParentStack] = useState([{ id: null, name: 'PYQ HUB', type: 'root' }]);
  const currentParent = parentStack[parentStack.length - 1];

  // Forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [qTitle, setQTitle] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qImage, setQImage] = useState(null);
  const [eText, setEText] = useState('');
  const [eImage, setEImage] = useState(null);
  const [editingQId, setEditingQId] = useState(null);

  // Queries
  const { data: catData, isLoading: loadingCats, refetch: refetchCats } = useGetPYQCategoriesQuery(null, { skip: currentParent.id !== null });
  const { data: subData, isLoading: loadingSubs, refetch: refetchSubs } = useGetPYQSubjectsQuery(null, { skip: currentParent.name?.toUpperCase() !== 'SUBJECT WISE' });
  const { data: groupData, isLoading: loadingGroups, refetch: refetchGroups } = useGetPYQGroupsQuery(null, { skip: currentParent.name?.toUpperCase() !== 'YEAR_WISE' });
  const { data: yearData, isLoading: loadingYears, refetch: refetchYears } = useGetPYQYearsQuery({ groupId: currentParent.id }, { skip: currentParent.type !== 'group' });

  const onRefresh = () => {
    if (catData) refetchCats();
    if (subData) refetchSubs();
    if (groupData) refetchGroups();
    if (yearData) refetchYears();
    if (questionData) refetchQs();
  };

  const rootTag = parentStack.find(p => ['ALL QUESTIONS', 'SUBJECT WISE', 'YEAR_WISE'].includes(p.name))?.name || 'ALL QUESTIONS';

  const qParams = {
    category: rootTag,
    subjectId: currentParent.type === 'subject' ? currentParent.id : undefined,
    yearId: currentParent.type === 'year' ? currentParent.id : undefined,
  };
  const { data: questionData, isLoading: loadingQs, refetch: refetchQs } = useGetPYQQuestionsQuery(qParams, {
    skip: !['subject', 'year', 'category'].includes(currentParent.type) || (currentParent.type === 'category' && currentParent.name !== 'ALL QUESTIONS')
  });

  // Folder source determination
  const folders = currentParent.id === null ? (catData || []) :
    currentParent.name?.toUpperCase() === 'SUBJECT WISE' ? (subData || []) :
      currentParent.name?.toUpperCase() === 'YEAR_WISE' ? (groupData || []) :
        currentParent.type === 'group' ? (yearData || []) : [];

  const questions = questionData || [];
  const isQuestionLayer = ['subject', 'year'].includes(currentParent.type) || currentParent.name === 'ALL QUESTIONS';

  // Mutations
  const [createSubject] = useCreatePYQSubjectMutation();
  const [createGroup] = useCreatePYQGroupMutation();
  const [createYear] = useCreatePYQYearMutation();
  const [createQuestion, { isLoading: savingQ }] = useCreatePYQQuestionMutation();
  const [deleteQuestion] = useDeletePYQQuestionMutation();
  const [updatePYQQuestion] = useUpdatePYQQuestionMutation();
  const [updateFolder] = useUpdatePYQHubFolderMutation();
  const [deleteFolder] = useDeletePYQHubFolderMutation();

  const handleSaveFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      if (editingId) {
        await updateFolder({ id: editingId, name: newFolderName }).unwrap();
        Alert.alert('Success', 'Updated!');
      } else if (currentParent.name?.toUpperCase() === 'SUBJECT WISE') {
        await createSubject({ name: newFolderName }).unwrap();
        refetchSubs();
        Alert.alert('Success', 'Subject created!');
      } else if (currentParent.name?.toUpperCase() === 'YEAR_WISE') {
        await createGroup({ name: newFolderName }).unwrap();
        refetchGroups();
        Alert.alert('Success', 'Exam group created!');
      } else if (currentParent.type === 'group') {
        await createYear({ yearValue: parseInt(newFolderName), groupId: currentParent.id }).unwrap();
        refetchYears();
        Alert.alert('Success', 'Year added!');
      }
      setNewFolderName(''); setShowCreateForm(false); setEditingId(null);
    } catch (err) { Alert.alert('Error', 'Failed to save'); }
  };

  const startEditFolder = (folder) => {
    setEditingId(folder._id);
    setNewFolderName(folder.name || folder.yearValue?.toString());
    setShowCreateForm(true);
  };

  const handleDeleteItem = (id, type, name) => {
    Alert.alert('Delete?', `Remove ${name}?`, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            if (type === 'F') await deleteFolder(id).unwrap();
            else await deleteQuestion(id).unwrap();
            Alert.alert('Success', 'Deleted!');
          } catch (e) { Alert.alert('Error', 'Failed to delete'); }
        }
      }
    ]);
  };

  const startEditQuestion = (q) => {
    setEditingQId(q._id);
    setQTitle(q.question || q.title);
    setQOptions(q.options || ['', '', '', '']);
    setQCorrect(q.correctAnswer ? parseInt(q.correctAnswer) : 0);
    setEText(q.explanationText || '');
    setQImage(q.questionImage ? getImageUrl(q.questionImage) : null);
    setEImage(q.explanationImage ? getImageUrl(q.explanationImage) : null);
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async () => {
    if (!qTitle.trim() || qOptions.some(o => !o.trim())) {
      Alert.alert('Error', 'Fill all required fields'); return;
    }
    const formData = new FormData();
    formData.append('questionText', qTitle);
    formData.append('options', JSON.stringify(qOptions));
    formData.append('correctAnswer', qCorrect.toString());
    formData.append('explanationText', eText);

    // Find the current path context
    const catNode = parentStack.find(p => ['ALL QUESTIONS', 'SUBJECT WISE', 'YEAR_WISE'].includes(p.name));
    formData.append('category', catNode?.name || 'ALL QUESTIONS');

    if (currentParent.type === 'subject') formData.append('subjectId', currentParent.id);
    if (currentParent.type === 'year') formData.append('yearId', currentParent.id);

    // Only append images if they are new (local URIs). Server URLs start with http
    const isLocal = (uri) => uri && (uri.startsWith('content://') || uri.startsWith('file://') || uri.startsWith('data:'));

    if (isLocal(qImage)) {
      formData.append('questionImage', { uri: qImage, name: 'q.jpg', type: 'image/jpeg' });
    }
    if (isLocal(eImage)) {
      formData.append('explanationImage', { uri: eImage, name: 'e.jpg', type: 'image/jpeg' });
    }

    try {
      if (editingQId) {
        await updatePYQQuestion({ id: editingQId, formData }).unwrap();
        Alert.alert('Success', 'Question updated!');
      } else {
        await createQuestion(formData).unwrap();
        Alert.alert('Success', 'Question created!');
      }
      setShowQuestionForm(false); setQTitle(''); setQOptions(['', '', '', '']); setQImage(null); setEText(''); setEImage(null); setEditingQId(null);
    } catch (e) { Alert.alert('Error', 'Failed to save question'); }
  };

  const pickImage = async (type) => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!res.canceled && res.assets && res.assets[0].uri) {
        if (type === 'Q') setQImage(res.assets[0].uri);
        else setEImage(res.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open image picker');
      console.error(err);
    }
  };

  const navigateInto = (item) => {
    let type = 'folder';
    if (currentParent.id === null) type = 'category';
    else if (currentParent.name === 'SUBJECT WISE') type = 'subject';
    else if (currentParent.name === 'YEAR_WISE') type = 'group';
    else if (currentParent.type === 'group') type = 'year';

    // Special handling for Student mode (skipping years if it's a direct quiz)
    if (!isAdmin && (type === 'subject' || type === 'year')) {
      navigation.navigate('QuestionList', { folderId: item._id, title: item.name || item.yearValue?.toString(), type: 'PYQ' });
      return;
    }

    setParentStack([...parentStack, { id: item._id || item.name, name: item.name || item.yearValue?.toString(), type }]);
  };

  const goBackArr = () => {
    if (parentStack.length > 1) {
      const newStack = [...parentStack];
      newStack.pop();
      setParentStack(newStack);
    } else {
      navigation.goBack();
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={isDarkMode ? ['#1E293B', '#0F172A', '#1E1B4B'] : ['#4F46E5', '#6366F1', '#8B5CF6']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.premiumHeader}
    >
      {/* Decorative circles for header flair */}
      <View style={styles.headerCircle1} />
      <View style={styles.headerCircle2} />

      <View style={styles.headerInner}>
        <TouchableOpacity onPress={goBackArr} style={styles.floatingBackBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.premiumHeaderTitle}>
            {currentParent.name}
          </Text>
          <View style={styles.breadcrumbBadge}>
            <MaterialCommunityIcons
              name={currentParent.id === null ? "view-dashboard" : "folder-open"}
              size={12}
              color="rgba(255,255,255,0.9)"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.premiumHeaderSubtitle}>
              {currentParent.type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.headerAdminBadge}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );



  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      {renderHeader()}

      <ScrollView
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loadingSubs || loadingGroups} onRefresh={onRefresh} />}
      >
        {isAdmin && (
          <View style={styles.adminControlsRestored}>
            {(['SUBJECT WISE', 'YEAR_WISE'].includes(currentParent.name) || currentParent.type === 'group') ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => { setShowCreateForm(!showCreateForm); setEditingId(null); setNewFolderName(''); }}
                  style={styles.premiumActionCard}
                >
                  <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.gradientActionBox}>
                    <MaterialCommunityIcons name={showCreateForm ? "close" : "plus-circle-outline"} size={26} color="#fff" />
                    <View style={styles.actionTextWrapper}>
                      <Text style={styles.actionTitle}>
                        {showCreateForm ? 'Cancel' :
                          (currentParent.name === 'SUBJECT WISE' ? 'Add Subject' :
                            currentParent.name === 'YEAR_WISE' ? 'Add Exam Group' :
                              currentParent.type === 'group' ? 'Add Year' : 'Add Folder')}
                      </Text>
                      <Text style={styles.actionSubtitle}>
                        {currentParent.type === 'group' ? 'Create a new entry for this group' : 'Expand your library'}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {showCreateForm && (
                  <View style={[styles.modernForm, isDarkMode && styles.formDark]}>
                    <TextInput style={[styles.premiumInput, isDarkMode && styles.inputDark]} placeholder="Name..." placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'} value={newFolderName} onChangeText={setNewFolderName} autoFocus />
                    <TouchableOpacity onPress={handleSaveFolder} style={styles.finalGradientBtn}>
                      <Text style={styles.btnText}>{editingId ? 'Update' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : null}

            {isQuestionLayer && (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setShowQuestionForm(!showQuestionForm);
                    setEditingQId(null);
                    setQTitle('');
                    setQOptions(['', '', '', '']);
                    setQImage(null);
                    setEImage(null);
                    setEText('');
                  }}
                  style={styles.premiumActionCard}
                >
                  <LinearGradient colors={['#8B5CF6', '#D946EF']} style={styles.gradientActionBox}>
                    <MaterialCommunityIcons name={showQuestionForm ? "close" : "plus-circle-outline"} size={26} color="#fff" />
                    <View style={styles.actionTextWrapper}>
                      <Text style={styles.actionTitle}>{showQuestionForm ? 'Cancel' : (editingQId ? 'Edit Question' : 'Add Question')}</Text>
                      <Text style={styles.actionSubtitle}>Create MCQ Content</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {showQuestionForm && (
                  <View style={[styles.modernForm, isDarkMode && styles.formDark]}>
                    <TextInput style={[styles.premiumInput, isDarkMode && styles.inputDark]} placeholder="Question Text" placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'} multiline value={qTitle} onChangeText={setQTitle} />

                    <TouchableOpacity 
                      style={[
                        styles.imagePicker, 
                        { 
                          backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9', 
                          borderColor: isDarkMode ? '#334155' : '#CBD5E1' 
                        }
                      ]} 
                      onPress={() => pickImage('Q')}
                    >
                      {qImage ? <Image source={{ uri: qImage }} style={styles.preview} /> : <Text style={styles.pickerText}>+ Add Question Image</Text>}
                    </TouchableOpacity>

                    {qOptions.map((opt, i) => (
                      <View key={i} style={styles.optionRowMCQ}>
                        <TouchableOpacity onPress={() => setQCorrect(i)} style={[styles.radio, isDarkMode && styles.radioDark, qCorrect === i && styles.radioActive]}>
                          <Text style={{ color: qCorrect === i ? '#fff' : (isDarkMode ? '#94A3B8' : '#64748B'), fontWeight: 'bold' }}>{String.fromCharCode(65 + i)}</Text>
                        </TouchableOpacity>
                        <TextInput style={[styles.premiumInput, isDarkMode && styles.inputDark, { flex: 1, marginBottom: 0 }]} placeholder={`Option ${i + 1}`} placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'} value={opt} onChangeText={t => { const n = [...qOptions]; n[i] = t; setQOptions(n); }} />
                      </View>
                    ))}

                    <TextInput style={[styles.premiumInput, isDarkMode && styles.inputDark, { marginTop: 15 }]} placeholder="Explanation (Optional)" placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'} multiline value={eText} onChangeText={setEText} />

                    <TouchableOpacity 
                      style={[
                        styles.imagePicker, 
                        { 
                          backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9', 
                          borderColor: isDarkMode ? '#334155' : '#CBD5E1' 
                        }
                      ]} 
                      onPress={() => pickImage('E')}
                    >
                      {eImage ? <Image source={{ uri: eImage }} style={styles.preview} /> : <Text style={styles.pickerText}>+ Add Explanation Image</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSaveQuestion} style={[styles.finalGradientBtn, { backgroundColor: '#8B5CF6' }]} disabled={savingQ}>
                      {savingQ ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Post Question</Text>}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {(loadingCats || loadingSubs || loadingGroups || loadingYears || loadingQs) && <ActivityIndicator style={{ marginTop: 20, marginBottom: 20 }} size="large" color="#4F46E5" />}

        <View style={styles.list}>
          {folders.map((item, index) => {
            const folderGradients = [
              ['#6366F1', '#818CF8'], // Indigo
              ['#EC4899', '#F472B6'], // Pink
              ['#3B82F6', '#60A5FA'], // Blue
              ['#10B981', '#34D399'], // Green
              ['#F59E0B', '#FBBF24'], // Amber
              ['#8B5CF6', '#A78BFA'], // Purple
            ];
            const currentGradient = folderGradients[index % folderGradients.length];
            const isRootCategory = currentParent.id === null;
            const isLocked = !user?.isPro && !isRootCategory && index > 0 && !isAdmin;

            return (
              <TouchableOpacity
                key={item._id || item.name}
                onPress={() => {
                  if (isLocked) {
                    navigation.navigate('Subscription');
                    return;
                  }
                  navigateInto(item);
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={isDarkMode ? ['#1E293B', '#1E293B'] : ['#FFFFFF', '#F8FAFC']}
                  style={[
                    styles.premiumFolderCard, 
                    isDarkMode && { borderColor: '#334155', borderWidth: 1 },
                    isLocked && { opacity: 0.7 }
                  ]}
                >
                  <LinearGradient
                    colors={isLocked ? ['#94A3B8', '#64748B'] : currentGradient}
                    style={styles.iconCircleGradient}
                  >
                    <MaterialCommunityIcons
                      name={isLocked ? "lock" : (item.icon || (isRootCategory ? (item.name === 'SUBJECT WISE' ? 'book-multiple' : item.name === 'YEAR_WISE' ? 'calendar-range' : 'infinity') : "folder"))}
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>

                  <View style={styles.folderTextContainerStyle}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.folderTitle, isDarkMode && styles.textDark]}>
                        {item.name || item.yearValue}
                      </Text>
                      {isLocked && <MaterialCommunityIcons name="crown" size={16} color="#F59E0B" style={{ marginLeft: 6 }} />}
                    </View>
                    <Text style={styles.folderSub}>
                      {isLocked ? 'Premium Content' : (isRootCategory ? 'Explore Repository' : (item.count ? `${item.count} Questions` : 'Browse Quality Content'))}
                    </Text>
                  </View>

                  {isAdmin && item._id && !['ALL QUESTIONS', 'SUBJECT WISE', 'YEAR_WISE'].includes(item.name) && (
                    <View style={styles.folderActionRow}>
                      <TouchableOpacity
                        style={styles.miniActionBtn}
                        onPress={() => startEditFolder(item)}
                      >
                        <MaterialCommunityIcons name="pencil" size={16} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.miniActionBtn, { backgroundColor: '#FEE2E2' }]}
                        onPress={() => handleDeleteItem(item._id, 'F', item.name || item.yearValue)}
                      >
                        <MaterialCommunityIcons name="delete" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={[styles.folderChevronCircle, { backgroundColor: isLocked ? '#94A3B820' : currentGradient[0] + '15' }]}>
                    <MaterialCommunityIcons name={isLocked ? "lock-outline" : "chevron-right"} size={20} color={isLocked ? "#94A3B8" : currentGradient[0]} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}

          {isQuestionLayer && questions.map((q, i) => (
            <View key={q._id} style={[styles.qBox, isDarkMode && styles.cardDark]}>
              <View style={styles.qHeaderSmall}>
                <Text style={styles.qIdx}>Question {i + 1}</Text>
                {isAdmin && (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => startEditQuestion(q)}><MaterialCommunityIcons name="pencil-outline" size={20} color="#3B82F6" /></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteItem(q._id, 'Q', 'this question')}><MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" /></TouchableOpacity>
                  </View>
                )}
              </View>

              {q.questionImage && <Image source={{ uri: getImageUrl(q.questionImage) }} style={styles.adminQImage} />}
              <Text style={[styles.qContent, isDarkMode && styles.textDark]}>{q.question || q.title}</Text>

              {isAdmin && (
                <View style={[styles.adminOptionsList, isDarkMode && styles.adminOptionsListDark]}>
                  {q.options?.map((opt, idx) => {
                    const isCorrect = typeof opt === 'object' ? opt.isCorrect === true : idx.toString() === q.correctAnswer?.toString();
                    const optText = typeof opt === 'object' ? opt.text : opt;
                    return (
                      <View key={idx} style={[styles.adminOptRow, isCorrect && (isDarkMode ? styles.adminOptCorrectDark : styles.adminOptCorrect)]}>
                        <View style={[styles.optDot, isCorrect && { backgroundColor: '#10B981' }]} />
                        <Text style={[
                          styles.adminOptText, 
                          isDarkMode && styles.textDark, 
                          isCorrect && { fontWeight: 'bold', color: isDarkMode ? '#10B981' : '#059669' }
                        ]}>
                          {String.fromCharCode(65 + idx)}) {optText}
                        </Text>
                        {isCorrect && (
                          <View style={styles.correctBadge}>
                            <Text style={styles.correctBadgeText}>CORRECT</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                  {(q.explanationText || q.explanationImage) && (
                    <View style={[styles.adminExpBox, isDarkMode && styles.adminExpBoxDark]}>
                      <Text style={styles.adminExpLabel}>EXPLANATION PROVIDED</Text>
                      {q.explanationImage && <Image source={{ uri: getImageUrl(q.explanationImage) }} style={styles.adminExpImage} />}
                      <Text style={[styles.adminExpText, isDarkMode && styles.textMutedDark]} numberOfLines={3}>{q.explanationText || "See Image Explanation above."}</Text>
                    </View>
                  )}
                </View>
              )}

              {!isAdmin && (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => navigation.navigate('QuestionList', {
                    type: 'PYQ',
                    folderId: currentParent.id,
                    title: currentParent.name
                  })}
                >
                  <Text style={styles.startBtnText}>Start Solving</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
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
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
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
  premiumActionCard: { borderRadius: 24, elevation: 8, overflow: 'hidden', marginBottom: 20 },
  gradientActionBox: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  actionTextWrapper: { marginLeft: 15 },
  actionTitle: { color: '#fff', fontSize: 18, fontFamily: 'Outfit-Bold' },
  actionSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Outfit-Regular' },
  modernForm: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginTop: 5, marginBottom: 25, elevation: 5 },
  formDark: { backgroundColor: '#1E293B' },
  premiumInput: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15, fontFamily: 'Outfit-Medium', color: '#1E293B' },
  inputDark: { backgroundColor: '#0F172A', color: '#fff', borderColor: '#334155' },
  finalGradientBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Outfit-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  list: { gap: 15 },
  premiumFolderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  iconCircleGradient: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  folderTextContainerStyle: { flex: 1 },
  folderTitle: { fontSize: 19, fontFamily: 'Outfit-Bold', color: '#1E293B', letterSpacing: -0.3 },
  folderSub: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontFamily: 'Outfit-Medium' },
  folderActionRow: { flexDirection: 'row', gap: 8, marginRight: 10 },
  miniActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderChevronCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textDark: { color: '#fff' },
  cardDark: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  qBox: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 20, elevation: 3, borderLeftWidth: 6, borderLeftColor: '#4338CA' },
  radioDark: { backgroundColor: '#0F172A' },
  adminOptionsListDark: { backgroundColor: '#0F172A' },
  adminOptCorrectDark: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: 8, paddingHorizontal: 8 },
  adminExpBoxDark: { borderTopColor: '#334155' },
  textMutedDark: { color: '#94A3B8' },
  qHeaderSmall: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  qIdx: { fontSize: 12, fontFamily: 'Outfit-Bold', color: '#4338CA' },
  qContent: { fontSize: 16, color: '#1E293B', fontFamily: 'Outfit-SemiBold', marginBottom: 15, lineHeight: 24 },
  startBtn: { backgroundColor: '#4338CA', padding: 15, borderRadius: 16, alignItems: 'center' },
  startBtnText: { color: '#fff', fontFamily: 'Outfit-Bold', fontSize: 15 },
  imagePicker: { height: 100, backgroundColor: '#F1F5F9', borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  preview: { width: '100%', height: '100%', borderRadius: 12 },
  pickerText: { color: '#94A3B8', fontSize: 12 },
  optionRowMCQ: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  radio: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: '#10B981' },
  adminQImage: { width: '100%', height: 150, borderRadius: 12, marginBottom: 15, resizeMode: 'contain', backgroundColor: '#F1F5F9' },
  adminOptionsList: { marginTop: 10, padding: 10, backgroundColor: '#F8FAFC', borderRadius: 15 },
  adminOptRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 10 },
  adminOptCorrect: { backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 8 },
  optDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
  adminOptText: { fontSize: 13, color: '#334155' },
  adminExpBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  adminExpImage: { width: '100%', height: 100, borderRadius: 8, marginTop: 10, marginBottom: 5, resizeMode: 'contain', backgroundColor: '#F1F5F9' },
  adminExpLabel: { fontSize: 9, fontWeight: '900', color: '#6366F1', letterSpacing: 1 },
  adminExpText: { fontSize: 12, color: '#64748B', marginTop: 4, fontStyle: 'italic' },
  correctBadge: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 5 },
  correctBadgeText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
});

export default PYQHubScreen;
