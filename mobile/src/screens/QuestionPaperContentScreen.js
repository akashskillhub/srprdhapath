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
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetMaterialsQuery, useCreateMaterialMutation, useUpdateMaterialMutation, useDeleteMaterialMutation } from '../redux/apis/materialsApi';
import { useSelector } from 'react-redux';
import { getBaseUrl } from '../utils/config';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

const QuestionPaperContentScreen = ({ route, navigation }) => {
  const { subjectId, subjectName } = route.params;
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
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
    pdf: '#EF4444',
    accent: '#10B981',
    inputBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    headerBg: isDarkMode ? '#1E293B' : '#FFFFFF',
  };

  const { data: materials = [], isLoading: loading, refetch } = useGetMaterialsQuery(subjectId);
  const [createMaterial] = useCreateMaterialMutation();
  const [updateMaterial] = useUpdateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const resetModal = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setEditingMaterial(null);
    setModalVisible(false);
  };

  const openEditModal = (item) => {
    setEditingMaterial(item);
    setTitle(item.title);
    setDescription(item.content || '');
    setFile({ name: item.fileUrl ? item.fileUrl.split('/').pop() : 'Existing PDF File', uri: null });
    setModalVisible(true);
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
      console.warn(err);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title');
      return;
    }
    
    // File is required when creating a new material
    if (!editingMaterial && !file) {
      Alert.alert('Required', 'Please select a PDF file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', description.trim());
      formData.append('type', 'PDF');

      // Check if a new file has been picked (has uri)
      if (file && file.uri) {
        const uri = file.uri;
        const fileName = file.name || `upload-${Date.now()}`;
        const mimeType = 'application/pdf';
        formData.append('file', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: fileName,
          type: mimeType,
        });
      }

      if (editingMaterial) {
        await updateMaterial({ id: editingMaterial._id, formData }).unwrap();
        Alert.alert('Success', 'Question paper updated successfully!');
      } else {
        formData.append('subjectId', subjectId);
        await createMaterial(formData).unwrap();
        Alert.alert('Success', 'Question paper added successfully!');
      }
      
      await refetch();
      resetModal();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save question paper. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleView = (item) => {
    navigation.navigate('PDFViewer', { url: item.fileUrl, title: item.title, allowDownload: true });
  };

  const handleDownload = async (item) => {
    const fullUrl = item.fileUrl.startsWith('http') 
      ? item.fileUrl 
      : `${getBaseUrl().replace('/api', '')}${item.fileUrl}`;
    try {
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert('Unable to Download', 'No web browser or PDF viewer found to open this link.');
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Could not open the download link.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Paper', 'Are you sure you want to permanently remove this question paper?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteMaterial(id).unwrap();
            await refetch();
          } catch(err) {
            Alert.alert('Error', 'Failed to delete');
          }
      }},
    ]);
  };

  const renderMaterial = ({ item }) => {
    const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';

    return (
      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: themeColors.pdf + '15' }]}>
            <MaterialCommunityIcons name="file-pdf-box" size={32} color={themeColors.pdf} />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            {formattedDate ? (
              <Text style={[styles.cardDate, { color: themeColors.textMuted }]}>
                Uploaded on: {formattedDate}
              </Text>
            ) : null}
          </View>
          
          {isAdmin && (
            <View style={styles.adminActions}>
              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                <MaterialCommunityIcons name="pencil" size={20} color={themeColors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id)} style={[styles.actionBtn, { marginLeft: 10 }]}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!!item.content && (
          <Text style={[styles.cardDesc, { color: themeColors.textMuted }]}>{item.content}</Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
            onPress={() => handleView(item)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="eye-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>View (पाहण्यासाठी)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10B981' }]}
            onPress={() => handleDownload(item)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="cloud-download-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Download (डाउनलोडसाठी)</Text>
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
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>{subjectName}</Text>
          <Text style={[styles.headerSub, { color: themeColors.primary }]}>QUESTION PAPERS LIST</Text>
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
              <MaterialCommunityIcons name="file-document-outline" size={80} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No question papers uploaded yet</Text>
              {isAdmin && (
                <Text style={[styles.emptyHint, { color: themeColors.textMuted }]}>Tap + below to upload your first paper</Text>
              )}
            </View>
          )}
        />
      )}

      {/* Admin FAB */}
      {isAdmin && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: themeColors.primary }]} onPress={() => setModalVisible(true)} activeOpacity={0.9}>
          <MaterialCommunityIcons name="plus" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ========= ADD/EDIT MATERIAL MODAL ========= */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={resetModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: themeColors.card }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                  {editingMaterial ? 'Update Question Paper' : 'Upload Question Paper'}
                </Text>
                <TouchableOpacity onPress={resetModal}>
                  <MaterialCommunityIcons name="close" size={24} color={themeColors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Title */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>PAPER TITLE *</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
                  placeholder="e.g. MPSC Prelims 2026 - Paper 1"
                  placeholderTextColor={themeColors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />

                {/* Description */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>DESCRIPTION / NOTES</Text>
                <TextInput
                  style={[styles.textAreaField, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
                  placeholder="Optional summary, key info, etc..."
                  placeholderTextColor={themeColors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />

                {/* File Picker */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>
                  SELECT PDF DOCUMENT {editingMaterial ? '(OPTIONAL TO CHANGE)' : '*'}
                </Text>
                <TouchableOpacity
                  style={[styles.filePicker, {
                    borderColor: file ? themeColors.pdf : themeColors.border,
                    backgroundColor: file ? themeColors.pdf + '10' : themeColors.inputBg,
                  }]}
                  onPress={pickFile}
                >
                  {file ? (
                    <>
                      <MaterialCommunityIcons
                        name="file-check-outline"
                        size={28}
                        color={themeColors.pdf}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.fileNameText, { color: themeColors.text }]} numberOfLines={1}>
                          {file.name || 'File selected'}
                        </Text>
                        <Text style={{ color: themeColors.textMuted, fontSize: 11 }}>Tap to choose another file</Text>
                      </View>
                      <TouchableOpacity onPress={() => setFile(null)}>
                        <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="file-upload-outline"
                        size={32}
                        color={themeColors.textMuted}
                      />
                      <Text style={[styles.filePickerText, { color: themeColors.textMuted }]}>
                        Tap to select a PDF document from storage
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: themeColors.primary }, (!title.trim() || uploading) && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={!title.trim() || uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="cloud-upload-outline" size={20} color="#fff" />
                      <Text style={styles.saveBtnText}>
                        {editingMaterial ? 'Save Changes' : 'Upload Paper'}
                      </Text>
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
  headerSub: { fontSize: 10, fontFamily: 'Outfit-Bold', letterSpacing: 1.5, marginTop: 2 },
  list: { padding: 20, paddingBottom: 100 },
  card: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 18,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontFamily: 'Outfit-Bold', lineHeight: 22 },
  cardDate: { fontSize: 11, fontFamily: 'Outfit-Medium', marginTop: 4 },
  adminActions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: {
    padding: 6,
  },
  cardDesc: { fontSize: 13, lineHeight: 20, marginTop: 12, marginBottom: 4, fontFamily: 'Outfit-Regular' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    elevation: 2,
  },
  actionButtonText: { color: '#fff', fontSize: 12, fontFamily: 'Outfit-Bold' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, fontFamily: 'Outfit-Bold', marginTop: 15 },
  emptyHint: { fontSize: 13, marginTop: 6, fontFamily: 'Outfit-Regular' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '90%',
    elevation: 20,
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
    fontFamily: 'Outfit-Regular',
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
  filePickerText: { fontSize: 14, fontFamily: 'Outfit-Medium', marginTop: 6, textAlign: 'center' },
  fileNameText: { fontSize: 14, fontFamily: 'Outfit-Bold' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 28,
    marginBottom: 10,
    gap: 10,
    elevation: 5,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Outfit-Bold' },
});

export default QuestionPaperContentScreen;
