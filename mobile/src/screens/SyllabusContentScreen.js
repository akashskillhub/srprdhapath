import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetMaterialsQuery, useCreateMaterialMutation, useDeleteMaterialMutation } from '../redux/apis/materialsApi';
import { useSelector } from 'react-redux';
import { getBaseUrl } from '../utils/config';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const SyllabusContentScreen = ({ route, navigation }) => {
  const { subjectId, subjectName } = route.params;
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  // Modal states for admin
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    primary: isDarkMode ? '#6366F1' : '#4F46E5',
    accent: '#10B981',
    pdf: '#EF4444',
    download: '#F59E0B',
    headerBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    inputBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
  };

  const { data: materials = [], isLoading: loading, refetch } = useGetMaterialsQuery(subjectId);
  const [createMaterial] = useCreateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const resetModal = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setModalVisible(false);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      console.warn('Document picker error:', err);
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title');
      return;
    }
    if (!file) {
      Alert.alert('Required', 'Please select a PDF file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', description.trim());
      formData.append('type', 'PDF');
      formData.append('subjectId', subjectId);

      const uri = file.uri;
      const fileName = file.name || `upload-${Date.now()}.pdf`;
      const mimeType = 'application/pdf';
      
      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: fileName,
        type: mimeType,
      });

      await createMaterial(formData).unwrap();
      await refetch();
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Syllabus PDF added successfully!',
      });
      
      resetModal();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to upload syllabus PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleView = (item) => {
    navigation.navigate('PDFViewer', { url: item.fileUrl, title: item.title });
  };

  const handleDownload = async (item) => {
    try {
      const fullUrl = item.fileUrl.startsWith('http') ? item.fileUrl : `${getBaseUrl().replace('/api', '')}${item.fileUrl}`;
      
      Toast.show({
        type: 'info',
        text1: 'Downloading PDF',
        text2: 'Opening document in web browser...',
      });
      
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert('Error', 'Cannot open the download link in a web browser');
      }
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to open download link');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Material', 
      'Are you sure you want to permanently remove this syllabus document?', 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteMaterial(id).unwrap();
              await refetch();
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Syllabus document removed successfully',
              });
            } catch (err) {
              Alert.alert('Error', 'Failed to delete syllabus document');
            }
          } 
        },
      ]
    );
  };

  const renderMaterial = ({ item }) => {
    return (
      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.pdfIconContainer, { backgroundColor: themeColors.pdf + '15' }]}>
            <MaterialCommunityIcons name="file-pdf-box" size={30} color={themeColors.pdf} />
          </View>
          
          <View style={styles.cardMainInfo}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: themeColors.pdf + '15' }]}>
              <Text style={[styles.typeBadgeText, { color: themeColors.pdf }]}>SYLLABUS PDF</Text>
            </View>
          </View>
          
          {isAdmin && (
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {!!item.content && (
          <Text style={[styles.cardDesc, { color: themeColors.textMuted }]}>
            {item.content}
          </Text>
        )}

        <View style={styles.cardActionsRow}>
          {/* View Button */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: themeColors.primary }]}
            onPress={() => handleView(item)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="eye-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>View (पाहण्यासाठी)</Text>
          </TouchableOpacity>

          {/* Download Button */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: themeColors.download }]}
            onPress={() => handleDownload(item)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="download-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Download (डाउनलोड)</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={themeColors.headerBg} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.headerBg, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>{subjectName}</Text>
          <Text style={[styles.headerSub, { color: themeColors.textMuted }]}>Syllabus Documents</Text>
        </View>
      </View>

      {/* Content List */}
      {loading ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={materials}
          renderItem={renderMaterial}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="file-pdf-box" size={80} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No syllabus PDFs uploaded yet</Text>
              {isAdmin && (
                <Text style={[styles.emptyHint, { color: themeColors.textMuted }]}>Tap the "+" button below to add your first syllabus PDF</Text>
              )}
            </View>
          )}
        />
      )}

      {/* Admin FAB */}
      {isAdmin && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: themeColors.primary }]} 
          onPress={() => setModalVisible(true)} 
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="plus" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add PDF Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={resetModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: themeColors.card }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>Add Syllabus PDF</Text>
                <TouchableOpacity onPress={resetModal}>
                  <MaterialCommunityIcons name="close" size={24} color={themeColors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Title */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>DOCUMENT TITLE *</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
                  placeholder="e.g. MPSC Prelims GS Syllabus 2026"
                  placeholderTextColor={themeColors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />

                {/* Description */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>DESCRIPTION</Text>
                <TextInput
                  style={[styles.textAreaField, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
                  placeholder="Provide additional details or notes (optional)..."
                  placeholderTextColor={themeColors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />

                {/* PDF Picker */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>SELECT SYLLABUS PDF *</Text>
                <TouchableOpacity
                  style={[
                    styles.filePicker,
                    {
                      borderColor: file ? themeColors.pdf : themeColors.border,
                      backgroundColor: file ? themeColors.pdf + '10' : themeColors.inputBg,
                    }
                  ]}
                  onPress={pickFile}
                >
                  {file ? (
                    <>
                      <MaterialCommunityIcons name="file-check-outline" size={30} color={themeColors.pdf} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.fileNameText, { color: themeColors.text }]} numberOfLines={1}>
                          {file.name || 'PDF Selected'}
                        </Text>
                        <Text style={{ color: themeColors.textMuted, fontSize: 11 }}>Tap to choose another file</Text>
                      </View>
                      <TouchableOpacity onPress={() => setFile(null)}>
                        <MaterialCommunityIcons name="close-circle" size={20} color={themeColors.pdf} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="file-upload-outline" size={32} color={themeColors.textMuted} />
                      <Text style={[styles.filePickerText, { color: themeColors.textMuted }]}>
                        Tap to select a PDF document from storage
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: themeColors.primary }, (!title.trim() || !file || uploading) && { opacity: 0.6 }]}
                  onPress={handleAdd}
                  disabled={!title.trim() || !file || uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="cloud-upload-outline" size={20} color="#fff" />
                      <Text style={styles.saveBtnText}>Upload Syllabus PDF</Text>
                    </>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    elevation: 2,
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontFamily: 'Outfit-Bold' },
  headerSub: { fontSize: 11, fontFamily: 'Outfit-Medium', letterSpacing: 1, marginTop: 2 },
  list: { padding: 20, paddingBottom: 100 },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  pdfIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMainInfo: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 16, fontFamily: 'Outfit-Bold', lineHeight: 22 },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  typeBadgeText: { fontSize: 9, fontFamily: 'Outfit-Bold' },
  deleteBtn: { padding: 5 },
  cardDesc: { fontSize: 13, fontFamily: 'Outfit-Regular', lineHeight: 20, marginTop: 12, marginBottom: 4 },
  cardActionsRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    elevation: 2,
  },
  actionBtnText: { color: '#fff', fontFamily: 'Outfit-Bold', fontSize: 13 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 30 },
  emptyText: { fontSize: 16, fontFamily: 'Outfit-Bold', marginTop: 15, textAlign: 'center' },
  emptyHint: { fontSize: 13, fontFamily: 'Outfit-Medium', marginTop: 6, textAlign: 'center' },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontFamily: 'Outfit-Bold' },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Outfit-Bold',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 16,
  },
  inputField: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 15,
    fontFamily: 'Outfit-Medium',
  },
  textAreaField: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingTop: 12,
    fontSize: 14,
    fontFamily: 'Outfit-Medium',
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 18,
    minHeight: 80,
    gap: 12,
  },
  filePickerText: { fontSize: 13, fontFamily: 'Outfit-Medium', marginTop: 6 },
  fileNameText: { fontSize: 14, fontFamily: 'Outfit-Bold' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 28,
    gap: 10,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Outfit-Bold' },
});

export default SyllabusContentScreen;
