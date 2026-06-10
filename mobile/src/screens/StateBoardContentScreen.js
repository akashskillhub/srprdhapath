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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetMaterialsQuery, useCreateMaterialMutation, useDeleteMaterialMutation } from '../redux/apis/materialsApi';
import { useSelector } from 'react-redux';
import { getBaseUrl } from '../utils/config';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

const StateBoardContentScreen = ({ route, navigation }) => {
  const { subjectId, subjectName } = route.params;
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState('PDF'); // 'PDF' or 'IMAGE'  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    primary: '#4F46E5',
    pdf: '#EF4444',
    image: '#3B82F6',
    textIcon: '#10B981',
    inputBg: isDarkMode ? '#0F172A' : '#F8FAFC',
  };

  const { data: materials = [], isLoading: loading, refetch } = useGetMaterialsQuery(subjectId);
  const [createMaterial] = useCreateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const resetModal = () => {
    setTitle('');
    setDescription('');
    setMaterialType('PDF');
    setFile(null);
    setModalVisible(false);
  };

  const pickFile = async () => {
    if (materialType === 'PDF') {
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
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setFile(result.assets[0]);
      }
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title');
      return;
    }
    if (!file && materialType !== 'TEXT') {
      Alert.alert('Required', `Please select a ${materialType} file`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', description.trim());
      formData.append('type', materialType);
      formData.append('subjectId', subjectId);

      if (file) {
        const uri = file.uri;
        const fileName = file.name || `upload-${Date.now()}`;
        const ext = fileName.split('.').pop();
        const mimeType = materialType === 'PDF' ? 'application/pdf' : `image/${ext || 'jpeg'}`;
        formData.append('file', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: fileName,
          type: mimeType,
        });
      }

      await createMaterial(formData).unwrap();
      await refetch(); // Force re-fetch the list immediately
      Alert.alert('Success', 'Material added successfully!');
      resetModal();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add material. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenMaterial = (item) => {
    if (item.type === 'PDF') {
      navigation.navigate('PDFViewer', { url: item.fileUrl, title: item.title });
    } else if (item.type === 'IMAGE') {
      navigation.navigate('ImageViewer', { url: item.fileUrl, title: item.title });
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Material', 'Are you sure you want to remove this?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMaterial(id) },
    ]);
  };

  const renderMaterial = ({ item }) => {
    const isPDF = item.type === 'PDF';
    const isImage = item.type === 'IMAGE';
    const typeColor = isPDF ? themeColors.pdf : isImage ? themeColors.image : themeColors.textIcon;
    const typeIcon = isPDF ? 'file-pdf-box' : isImage ? 'image-outline' : 'text-subject';

    return (
      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: typeColor + '20' }]}>
            <MaterialCommunityIcons name={typeIcon} size={26} color={typeColor} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={2}>{item.title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: typeColor }]}>{item.type}</Text>
            </View>
          </View>
          {isAdmin && (
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {!!item.content && (
          <Text style={[styles.cardDesc, { color: themeColors.textMuted }]}>{item.content}</Text>
        )}

        {item.fileUrl && (
          <TouchableOpacity
            style={[styles.viewBtn, { backgroundColor: typeColor }]}
            onPress={() => handleOpenMaterial(item)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name={isPDF ? 'eye-outline' : 'image-search-outline'} size={18} color="#fff" />
            <Text style={styles.viewBtnText}>{isPDF ? 'Open PDF' : 'View Image'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>{subjectName}</Text>
          <Text style={[styles.headerSub, { color: themeColors.textMuted }]}>Study Materials</Text>
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
              <MaterialCommunityIcons name="book-open-page-variant-outline" size={80} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No materials yet</Text>
              {isAdmin && (
                <Text style={[styles.emptyHint, { color: themeColors.textMuted }]}>Tap + to add your first material</Text>
              )}
            </View>
          )}
        />
      )}

      {/* Admin FAB */}
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.9}>
          <MaterialCommunityIcons name="plus" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ========= ADD MATERIAL MODAL ========= */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={resetModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: themeColors.card }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>Add Study Material</Text>
                <TouchableOpacity onPress={resetModal}>
                  <MaterialCommunityIcons name="close" size={24} color={themeColors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Title */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>CONTENT TITLE *</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
                  placeholder="e.g. Chapter 1 – History Notes"
                  placeholderTextColor={themeColors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />

                {/* Description */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>DESCRIPTION</Text>
                <TextInput
                  style={[styles.textAreaField, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
                  placeholder="Optional description or notes..."
                  placeholderTextColor={themeColors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />

                {/* Material Type Selector */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>MATERIAL TYPE</Text>
                <View style={[styles.typeRow, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                  {['PDF', 'IMAGE'].map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typeTab,
                        materialType === t && {
                          backgroundColor: t === 'PDF' ? '#EF4444' : '#3B82F6',
                        },
                      ]}
                      onPress={() => { setMaterialType(t); setFile(null); }}
                    >
                      <MaterialCommunityIcons
                        name={t === 'PDF' ? 'file-pdf-box' : 'image'}
                        size={20}
                        color={materialType === t ? '#fff' : themeColors.textMuted}
                      />
                      <Text style={[
                        styles.typeTabText,
                        { color: materialType === t ? '#fff' : themeColors.textMuted }
                      ]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* File Picker */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>
                  {materialType === 'PDF' ? 'SELECT PDF FILE' : 'SELECT IMAGE'}
                </Text>
                <TouchableOpacity
                  style={[styles.filePicker, {
                    borderColor: file ? (materialType === 'PDF' ? '#EF4444' : '#3B82F6') : themeColors.border,
                    backgroundColor: file
                      ? (materialType === 'PDF' ? '#EF444410' : '#3B82F610')
                      : themeColors.inputBg,
                  }]}
                  onPress={pickFile}
                >
                  {file ? (
                    <>
                      <MaterialCommunityIcons
                        name={materialType === 'PDF' ? 'file-check-outline' : 'image-check-outline'}
                        size={28}
                        color={materialType === 'PDF' ? '#EF4444' : '#3B82F6'}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.fileNameText, { color: themeColors.text }]} numberOfLines={1}>
                          {file.name || 'File selected'}
                        </Text>
                        <Text style={{ color: themeColors.textMuted, fontSize: 11 }}>Tap to change</Text>
                      </View>
                      <TouchableOpacity onPress={() => setFile(null)}>
                        <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name={materialType === 'PDF' ? 'file-upload-outline' : 'image-plus-outline'}
                        size={32}
                        color={themeColors.textMuted}
                      />
                      <Text style={[styles.filePickerText, { color: themeColors.textMuted }]}>
                        Tap to select {materialType === 'PDF' ? 'a PDF document' : 'an image'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Add Button */}
                <TouchableOpacity
                  style={[styles.addBtn, (!title.trim() || uploading) && { opacity: 0.6 }]}
                  onPress={handleAdd}
                  disabled={!title.trim() || uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="cloud-upload-outline" size={20} color="#fff" />
                      <Text style={styles.addBtnText}>Add Material</Text>
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
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  headerSub: { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  list: { padding: 20, paddingBottom: 100 },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', lineHeight: 22 },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 5,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '900' },
  deleteBtn: { padding: 5 },
  cardDesc: { fontSize: 13, lineHeight: 20, marginTop: 10, marginBottom: 5 },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  viewBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, fontWeight: '700', marginTop: 15 },
  emptyHint: { fontSize: 13, marginTop: 6 },

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
  modalTitle: { fontSize: 20, fontWeight: '900' },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
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
    fontWeight: '600',
  },
  textAreaField: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingTop: 12,
    fontSize: 14,
  },
  typeRow: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  typeTabText: { fontWeight: '800', fontSize: 14 },
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
  filePickerText: { fontSize: 14, fontWeight: '600', marginTop: 6 },
  fileNameText: { fontSize: 14, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    height: 56,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 10,
    gap: 10,
    elevation: 5,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});

export default StateBoardContentScreen;
