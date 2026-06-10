import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Alert, ActivityIndicator, Modal, ScrollView,
  Image, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useGetTestQuestionsQuery, useCreateTestQuestionMutation, useDeleteTestQuestionMutation, useUpdateTestQuestionMutation } from '../redux/apis/testApi';
import { useSelector } from 'react-redux';
import { getImageUrl } from '../utils/config';

const AdminManageTestScreen = ({ route, navigation }) => {
  const { testId, testName, difficulty } = route.params;
  const { isDarkMode } = useSelector((s) => s.theme);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [qImage, setQImage] = useState(null);
  const [expImage, setExpImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const bg    = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card  = isDarkMode ? '#1E293B' : '#FFFFFF';
  const text  = isDarkMode ? '#F8FAFC' : '#1E293B';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';
  const border= isDarkMode ? '#334155' : '#E2E8F0';
  const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

  const LEVEL_COLORS = { easy: '#10B981', medium: '#F59E0B', hard: '#EF4444' };
  const accent = LEVEL_COLORS[difficulty] || '#4F46E5';

  const { data: questions = [], isLoading, refetch } = useGetTestQuestionsQuery(testId);
  const [createQuestion] = useCreateTestQuestionMutation();
  const [updateQuestion] = useUpdateTestQuestionMutation();
  const [deleteQuestion] = useDeleteTestQuestionMutation();

  const pickImage = async (setter) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
    });
    if (!result.canceled) setter(result.assets[0]);
  };

  const resetForm = () => {
    setQuestion(''); setOptions(['', '', '', '']);
    setCorrect(0); setExplanation('');
    setQImage(null); setExpImage(null);
    setEditingQuestion(null);
    setModalVisible(false);
  };

  const handleSave = async () => {
    if (!question.trim()) return Alert.alert('Required', 'Enter the question text');
    if (options.some(o => !o.trim())) return Alert.alert('Required', 'Fill all 4 options');

    setSaving(true);
    try {
      const fd = new FormData();
      if (!editingQuestion) fd.append('testId', testId);
      fd.append('question', question.trim());
      fd.append('options', JSON.stringify(options.map(o => o.trim())));
      fd.append('correctAnswer', String(correct));
      fd.append('explanation', explanation.trim());

      const isLocalUri = (uri) => uri && !uri.startsWith('/uploads/') && !uri.startsWith('http');

      if (qImage && qImage.uri && isLocalUri(qImage.uri)) fd.append('questionImage', {
        uri: Platform.OS === 'android' ? qImage.uri : qImage.uri.replace('file://', ''),
        name: `q-img-${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
      if (expImage && expImage.uri && isLocalUri(expImage.uri)) fd.append('explanationImage', {
        uri: Platform.OS === 'android' ? expImage.uri : expImage.uri.replace('file://', ''),
        name: `exp-img-${Date.now()}.jpg`,
        type: 'image/jpeg',
      });

      if (editingQuestion) {
        await updateQuestion({ id: editingQuestion._id, formData: fd }).unwrap();
      } else {
        await createQuestion(fd).unwrap();
      }
      await refetch();
      resetForm();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save question');
    } finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Question', 'Remove this question?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteQuestion(id).unwrap();
        refetch();
      }},
    ]);
  };

  const openEditModal = (item) => {
    setEditingQuestion(item);
    setQuestion(item.question);
    setOptions(item.options);
    setCorrect(item.correctAnswer);
    setExplanation(item.explanation || '');
    // Images are handled differently since they come as URLs from server
    setQImage(item.questionImage ? { uri: item.questionImage } : null);
    setExpImage(item.explanationImage ? { uri: item.explanationImage } : null);
    setModalVisible(true);
  };

  const OPTION_LABELS = ['A', 'B', 'C', 'D'];

  const renderQuestion = ({ item, index }) => (
    <View style={[styles.qCard, { backgroundColor: card, borderColor: border }]}>
      <View style={styles.qCardHeader}>
        <View style={[styles.qNumBox, { backgroundColor: accent + '20' }]}>
          <Text style={[styles.qNum, { color: accent }]}>Q{index + 1}</Text>
        </View>
        <Text style={[styles.qText, { color: text }]}>{item.question}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <MaterialCommunityIcons name="pencil-outline" size={20} color={accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      {item.questionImage ? (
        <Image source={{ uri: getImageUrl(item.questionImage) }} style={styles.qImage} resizeMode="contain" />
      ) : null}
      <View style={styles.optionGrid}>
        {item.options.map((opt, i) => {
          const optText = typeof opt === 'object' ? opt.text : opt;
          return (
            <View key={i} style={[
              styles.optionChip,
              { borderColor: i === item.correctAnswer ? accent : border },
              i === item.correctAnswer && { backgroundColor: accent + '15' },
            ]}>
              <Text style={[styles.optionLabel, { color: i === item.correctAnswer ? accent : muted }]}>{OPTION_LABELS[i]}.</Text>
              <Text style={[styles.optionText, { color: i === item.correctAnswer ? text : muted }]}>{optText}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <LinearGradient colors={[accent, accent + 'CC']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 15, flex: 1 }}>
          <Text style={styles.headerTitle}>{testName}</Text>
          <Text style={styles.headerSub}>{questions.length} QUESTIONS</Text>
        </View>
      </LinearGradient>

      {isLoading ? <ActivityIndicator size="large" color={accent} style={{ marginTop: 60 }} /> : (
        <FlatList
          data={questions}
          renderItem={renderQuestion}
          keyExtractor={(i) => i._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="help-circle-outline" size={70} color={border} />
              <Text style={[styles.emptyText, { color: muted }]}>No questions yet</Text>
              <Text style={{ color: muted, fontSize: 13, marginTop: 4 }}>Tap + to add your first question</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: accent }]} onPress={() => { setEditingQuestion(null); setModalVisible(true); }}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={resetForm}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: text }]}>{editingQuestion ? 'Edit Question' : 'Add Question'}</Text>
                <TouchableOpacity onPress={resetForm}>
                  <MaterialCommunityIcons name="close" size={24} color={muted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.label, { color: muted }]}>QUESTION *</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: inputBg, color: text, borderColor: border }]}
                  placeholder="Enter question..."
                  placeholderTextColor={muted}
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                  textAlignVertical="top"
                />

                <TouchableOpacity style={[styles.imgPicker, { borderColor: qImage ? accent : border }]} onPress={() => pickImage(setQImage)}>
                  <MaterialCommunityIcons name={qImage ? 'image-check-outline' : 'image-plus-outline'} size={22} color={qImage ? accent : muted} />
                  <Text style={{ color: qImage ? accent : muted, marginLeft: 8, fontWeight: '600', fontSize: 13 }}>
                    {qImage ? 'Question image selected' : 'Add question image (optional)'}
                  </Text>
                  {qImage && <TouchableOpacity onPress={() => setQImage(null)} style={{ marginLeft: 'auto' }}>
                    <MaterialCommunityIcons name="close-circle" size={18} color="#EF4444" />
                  </TouchableOpacity>}
                </TouchableOpacity>

                <Text style={[styles.label, { color: muted }]}>OPTIONS (TAP LABEL TO MARK CORRECT)</Text>
                {options.map((opt, i) => (
                  <View key={i} style={styles.optionRow}>
                    <TouchableOpacity
                      style={[styles.optionLabelBtn, { backgroundColor: correct === i ? accent : border + '50' }]}
                      onPress={() => setCorrect(i)}
                    >
                      <Text style={{ color: correct === i ? '#fff' : muted, fontWeight: '900', fontSize: 13 }}>{OPTION_LABELS[i]}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.optionInput, { backgroundColor: inputBg, color: text, borderColor: correct === i ? accent : border }]}
                      placeholder={`Option ${OPTION_LABELS[i]}`}
                      placeholderTextColor={muted}
                      value={opt}
                      onChangeText={(v) => { const o = [...options]; o[i] = v; setOptions(o); }}
                    />
                  </View>
                ))}

                <Text style={[styles.label, { color: muted }]}>EXPLANATION (OPTIONAL)</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: inputBg, color: text, borderColor: border, height: 80 }]}
                  placeholder="Explain the answer..."
                  placeholderTextColor={muted}
                  value={explanation}
                  onChangeText={setExplanation}
                  multiline
                  textAlignVertical="top"
                />

                <TouchableOpacity style={[styles.imgPicker, { borderColor: expImage ? accent : border }]} onPress={() => pickImage(setExpImage)}>
                  <MaterialCommunityIcons name={expImage ? 'image-check-outline' : 'image-plus-outline'} size={22} color={expImage ? accent : muted} />
                  <Text style={{ color: expImage ? accent : muted, marginLeft: 8, fontWeight: '600', fontSize: 13 }}>
                    {expImage ? 'Explanation image selected' : 'Add explanation image (optional)'}
                  </Text>
                  {expImage && <TouchableOpacity onPress={() => setExpImage(null)} style={{ marginLeft: 'auto' }}>
                    <MaterialCommunityIcons name="close-circle" size={18} color="#EF4444" />
                  </TouchableOpacity>}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: accent, opacity: saving ? 0.7 : 1 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#fff" /> : (
                    <Text style={styles.saveBtnText}>{editingQuestion ? 'Update Question' : 'Save Question'}</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, elevation: 5 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 1 },
  list: { padding: 20, paddingBottom: 100 },
  qCard: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 14, elevation: 2 },
  qCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  qNumBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  qNum: { fontSize: 12, fontWeight: '900' },
  qText: { flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  optionGrid: { gap: 8 },
  optionChip: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1.5, gap: 8 },
  optionLabel: { fontSize: 12, fontWeight: '900', width: 20 },
  optionText: { fontSize: 13 },
  fab: { position: 'absolute', bottom: 28, right: 24, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 10 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '95%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 18, marginBottom: 8 },
  textArea: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 14, height: 100 },
  imgPicker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, padding: 14, marginTop: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  optionLabelBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  optionInput: { flex: 1, height: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 14 },
  saveBtn: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  qImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
  },
});

export default AdminManageTestScreen;
