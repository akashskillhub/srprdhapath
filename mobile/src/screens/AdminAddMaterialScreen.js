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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../constants/config';
import { useCreateMaterialMutation } from '../redux/apis/materialsApi';
import { useSelector } from 'react-redux';

const AdminAddMaterialScreen = ({ route, navigation }) => {
  const { subjectId, subjectName } = route.params;
  const { isDarkMode } = useSelector((state) => state.theme);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('PDF'); // PDF, IMAGE, TEXT
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [createMaterial] = useCreateMaterialMutation();

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    primary: '#4F46E5',
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setFile(result.assets[0]);
      setType('IMAGE');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled) {
          setFile(result.assets[0]);
          setType('PDF');
      }
    } catch (err) {
       console.warn(err);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('type', type);
      formData.append('subjectId', subjectId);

      if (file) {
        const uri = file.uri;
        const name = file.name || `file-${Date.now()}`;
        const match = /\.(\w+)$/.exec(name);
        const fileExtension = match ? match[1] : '';
        const mimeType = type === 'PDF' ? 'application/pdf' : `image/${fileExtension || 'jpeg'}`;

        formData.append('file', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: name,
          type: mimeType,
        });
      }

      await createMaterial(formData).unwrap();
      Alert.alert('Success', 'Material uploaded successfully');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialCommunityIcons name="close" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>Add to {subjectName}</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color={themeColors.primary} /> : <Text style={styles.saveBtn}>Publish</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.label, { color: themeColors.text }]}>CONTENT TITLE</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text, borderColor: themeColors.border }]}
            placeholder="e.g. History Chapter 1 Notes"
            placeholderTextColor={themeColors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: themeColors.text }]}>DESCRIPTION / TEXT CONTENT</Text>
          <TextInput 
            style={[styles.textArea, { backgroundColor: themeColors.card, color: themeColors.text, borderColor: themeColors.border }]}
            placeholder="Enter additional text or description..."
            placeholderTextColor={themeColors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          <Text style={[styles.label, { color: themeColors.text }]}>STUDY MATERIAL (PDF OR IMAGE)</Text>
          <View style={styles.pickerRow}>
              <TouchableOpacity 
                style={[styles.pickerBtn, type === 'PDF' && file && { borderColor: '#EF4444', backgroundColor: '#EF444410' }]} 
                onPress={pickDocument}
              >
                  <MaterialCommunityIcons name="file-pdf-box" size={32} color="#EF4444" />
                  <Text style={styles.pickerLabel}>Upload PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.pickerBtn, type === 'IMAGE' && file && { borderColor: '#3B82F6', backgroundColor: '#3B82F610' }]} 
                onPress={pickImage}
              >
                  <MaterialCommunityIcons name="image" size={32} color="#3B82F6" />
                  <Text style={styles.pickerLabel}>Upload Image</Text>
              </TouchableOpacity>
          </View>

          {file && (
              <View style={[styles.selectedBox, { backgroundColor: themeColors.card, borderColor: themeColors.primary }]}>
                  <MaterialCommunityIcons 
                    name={type === 'PDF' ? "file-check" : "image-check"} 
                    size={24} 
                    color={themeColors.primary} 
                  />
                  <Text style={[styles.selectedText, { color: themeColors.text }]} numberOfLines={1}>
                      {file.name || 'File Selected'}
                  </Text>
                  <TouchableOpacity onPress={() => setFile(null)}>
                      <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
              </View>
          )}

          <View style={styles.typeSelector}>
              <Text style={[styles.label, { color: themeColors.text }]}>BASE TYPE</Text>
              <View style={styles.tabs}>
                  {['PDF', 'IMAGE', 'TEXT'].map(t => (
                      <TouchableOpacity 
                        key={t}
                        style={[styles.tab, type === t && { backgroundColor: themeColors.primary }]}
                        onPress={() => setType(t)}
                      >
                          <Text style={[styles.tabText, type === t && { color: '#fff' }]}>{t}</Text>
                      </TouchableOpacity>
                  ))}
              </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  saveBtn: { color: '#4F46E5', fontWeight: 'bold', fontSize: 16 },
  scroll: { padding: 20 },
  label: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10, marginTop: 20 },
  input: { height: 55, borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, fontSize: 16 },
  textArea: { height: 120, borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, paddingTop: 15, fontSize: 16 },
  pickerRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
  pickerBtn: { flex: 1, height: 100, borderRadius: 16, borderWIdth: 2, borderStyle: 'dashed', borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  pickerLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 5, color: '#64748B' },
  selectedBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, borderWidth: 1, marginTop: 15, gap: 10 },
  selectedText: { flex: 1, fontWeight: '600' },
  typeSelector: { marginTop: 10 },
  tabs: { flexDirection: 'row', gap: 10 },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E2E8F030' },
  tabText: { fontWeight: 'bold', fontSize: 12, color: '#64748B' },
});

export default AdminAddMaterialScreen;
