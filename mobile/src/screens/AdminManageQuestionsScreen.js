import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { useGetFoldersQuery } from '../redux/apis/studentApi';
import { useCreateQuestionMutation } from '../redux/apis/adminApi';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const AdminManageQuestionsScreen = ({ route, navigation }) => {
  const { module, moduleName } = route.params || {};
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    explanation: { text: '' },
    subject: 'General',
    type: 'PYQ', 
    folderId: null,
  });

  const [questionImage, setQuestionImage] = useState(null);
  const [explanationImage, setExplanationImage] = useState(null);

  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      if (type === 'QUESTION') setQuestionImage(result.assets[0].uri);
      else setExplanationImage(result.assets[0].uri);
    }
  };

  // Fetch all folders
  const { data: allFolders = [], isLoading: foldersLoading } = useGetFoldersQuery({});
  
  // Filter folders by category (module) if module is provided
  const folders = module ? allFolders.filter(f => f.category === module) : allFolders;

  const [createQuestion, { isLoading: saving }] = useCreateQuestionMutation();

  const handleSave = async () => {
    if (!formData.title || !selectedFolderId) {
      Alert.alert('Error', 'Please enter question and select a folder');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('options', JSON.stringify(formData.options));
      data.append('explanationText', formData.explanation.text);
      data.append('subject', formData.subject);
      data.append('type', formData.type);
      data.append('module', module);
      data.append('folderId', selectedFolderId);

      if (questionImage) {
        const filename = questionImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        data.append('questionImage', { uri: questionImage, name: filename, type });
      }

      if (explanationImage) {
        const filename = explanationImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        data.append('explanationImage', { uri: explanationImage, name: filename, type });
      }

      await createQuestion(data).unwrap();
      Alert.alert('Success', 'Question published successfully');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to publish question');
    }
  };

  const loading = foldersLoading || saving;

  const updateOption = (index, text) => {
    const newOptions = [...formData.options];
    newOptions[index].text = text;
    setFormData({ ...formData, options: newOptions });
  };

  const setCorrectAnswer = (index) => {
    const newOptions = formData.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
    }));
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{moduleName ? `Manage ${moduleName}` : 'Add Content'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Type Picker */}
        <View style={styles.tabContainer}>
          {['PYQ', 'PRACTICE', 'TEST_SERIES'].map((type) => (
            <TouchableOpacity 
              key={type}
              style={[styles.tab, formData.type === type && styles.activeTab]}
              onPress={() => setFormData({...formData, type})}
            >
              <Text style={[styles.tabText, formData.type === type && styles.activeTabText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Folder Selection */}
        <Text style={styles.label}>Select Folder</Text>
        <View style={styles.folderPicker}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
             {folders.map((folder) => (
                <TouchableOpacity 
                  key={folder._id}
                  style={[styles.folderChip, selectedFolderId === folder._id && styles.folderChipActive]}
                  onPress={() => setSelectedFolderId(folder._id)}
                >
                   <Text style={[styles.folderChipText, selectedFolderId === folder._id && styles.folderChipTextActive]}>
                     {folder.name}
                   </Text>
                </TouchableOpacity>
             ))}
           </ScrollView>
        </View>

        {/* Question Text */}
        {/* Question Text */}
        <Text style={styles.label}>Question Text</Text>
        <TextInput 
          style={styles.inputMultiline}
          placeholder="येथे प्रश्न टाइप करा..."
          multiline
          value={formData.title}
          onChangeText={(val) => setFormData({...formData, title: val})}
        />

        <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage('QUESTION')}>
          <MaterialCommunityIcons name="image-plus" size={20} color={COLORS.primary} />
          <Text style={styles.imagePickerText}>{questionImage ? 'Question Image Attached' : 'Attach Image to Question'}</Text>
        </TouchableOpacity>
        {questionImage && <Image source={{ uri: questionImage }} style={styles.previewImage} />}

        {/* Options */}
        <Text style={styles.label}>Options</Text>
        {formData.options.map((opt, idx) => (
          <View key={idx} style={styles.optionRow}>
            <TouchableOpacity 
                style={[styles.checkBtn, opt.isCorrect && styles.checkBtnActive]}
                onPress={() => setCorrectAnswer(idx)}
            >
                <MaterialCommunityIcons name={opt.isCorrect ? "check-circle" : "circle-outline"} size={24} color={opt.isCorrect ? "#10B981" : "#94A3B8"} />
            </TouchableOpacity>
            <TextInput 
              style={styles.optionInput}
              placeholder={`पर्याय ${idx + 1}`}
              value={opt.text}
              onChangeText={(val) => updateOption(idx, val)}
            />
          </View>
        ))}

        {/* Explanation */}
        {/* Explanation */}
        <Text style={styles.label}>Explanation & Solution</Text>
        <TextInput 
          style={styles.inputMultiline}
          placeholder="येथे स्पष्टीकरण द्या..."
          multiline
          value={formData.explanation.text}
          onChangeText={(val) => setFormData({...formData, explanation: { ...formData.explanation, text: val }})}
        />

        <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage('EXPLANATION')}>
          <MaterialCommunityIcons name="image-edit-outline" size={20} color="#8B5CF6" />
          <Text style={[styles.imagePickerText, { color: '#8B5CF6' }]}>{explanationImage ? 'Explanation Image Attached' : 'Attach Image to Explanation'}</Text>
        </TouchableOpacity>
        {explanationImage && <Image source={{ uri: explanationImage }} style={[styles.previewImage, { borderColor: '#8B5CF6' }]} />}

        <TouchableOpacity 
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
        >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Publish Question</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  folderPicker: {
    flexDirection: 'row',
    marginVertical: SPACING.sm,
  },
  folderChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    backgroundColor: '#F8FAFC',
  },
  folderChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  folderChipText: {
    fontSize: 12,
    color: '#64748B',
  },
  folderChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputMultiline: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: '#334155',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'NotoSansDevanagari_400Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  checkBtn: {
    padding: SPACING.sm,
  },
  optionInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: '#334155',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: 'NotoSansDevanagari_400Regular',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.md,
    marginTop: 12,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
});

export default AdminManageQuestionsScreen;
