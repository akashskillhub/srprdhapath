import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  StatusBar,
  Linking,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetMaterialsQuery, useCreateMaterialMutation, useDeleteMaterialMutation } from '../redux/apis/materialsApi';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

const YouTubeLinksContentScreen = ({ route, navigation }) => {
  const { folderId, folderName } = route.params;
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const { width } = useWindowDimensions();

  // Modal states for admin
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    primary: '#FF0000', // YouTube Red
    secondary: '#3B82F6',
    headerBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    inputBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
  };

  const { data: materials = [], isLoading: loading, refetch } = useGetMaterialsQuery(folderId);
  const [createMaterial] = useCreateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const resetModal = () => {
    setTitle('');
    setUrlInput('');
    setDescription('');
    setModalVisible(false);
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title');
      return;
    }
    if (!urlInput.trim()) {
      Alert.alert('Required', 'Please enter a link URL');
      return;
    }

    // Basic URL validation
    let formattedUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setUploading(true);
    try {
      // Send JSON payload directly for LINK type
      await createMaterial({
        title: title.trim(),
        content: description.trim(),
        type: 'LINK',
        subjectId: folderId,
        fileUrl: formattedUrl,
      }).unwrap();

      await refetch();
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Link added successfully!',
      });
      
      resetModal();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add link. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL on your device');
      }
    } catch (err) {
      console.error('Open link error:', err);
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Link', 
      'Are you sure you want to permanently remove this link?', 
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
                text2: 'Link removed successfully',
              });
            } catch (err) {
              Alert.alert('Error', 'Failed to delete link');
            }
          } 
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isYouTube = /youtube\.com|youtu\.be/i.test(item.fileUrl || '');
    const isGoogle = /google\.com/i.test(item.fileUrl || '');
    
    let iconName = 'link-variant';
    let iconColor = themeColors.secondary;
    let badgeText = 'LINK';
    let badgeBg = 'rgba(59, 130, 246, 0.1)';

    if (isYouTube) {
      iconName = 'youtube';
      iconColor = '#FF0000';
      badgeText = 'YOUTUBE VIDEO';
      badgeBg = 'rgba(255, 0, 0, 0.1)';
    } else if (isGoogle) {
      iconName = 'google';
      iconColor = '#4285F4';
      badgeText = 'GOOGLE DRIVE/DOC';
      badgeBg = 'rgba(66, 133, 244, 0.1)';
    }

    return (
      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: badgeBg }]}>
            <MaterialCommunityIcons name={iconName} size={30} color={iconColor} />
          </View>
          
          <View style={styles.cardMainInfo}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.typeBadgeText, { color: iconColor }]}>{badgeText}</Text>
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

        <Text style={[styles.urlText, { color: themeColors.textMuted }]} numberOfLines={1}>
          {item.fileUrl}
        </Text>

        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: iconColor }]}
            onPress={() => handleOpenLink(item.fileUrl)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="open-in-new" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>
              {isYouTube ? 'Watch Video' : 'Open Link'}
            </Text>
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
          <Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>{folderName}</Text>
          <Text style={[styles.headerSub, { color: themeColors.textMuted }]}>Playlists & Important Links</Text>
        </View>
      </View>

      {/* Content List */}
      {loading ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={materials}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="link-off" size={80} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No links added yet</Text>
              {isAdmin && (
                <Text style={[styles.emptyHint, { color: themeColors.textMuted }]}>Tap the "+" button below to add your first link</Text>
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

      {/* Add Link Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={resetModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: themeColors.card }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>Add Important Link</Text>
                <TouchableOpacity onPress={resetModal}>
                  <MaterialCommunityIcons name="close" size={24} color={themeColors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Title / Name */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>LINK NAME / VIDEO TITLE *</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
                  placeholder="e.g. India Independence Documentary"
                  placeholderTextColor={themeColors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />

                {/* URL / Link */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>URL / LINK *</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
                  placeholder="e.g. youtube.com/watch?v=abc123"
                  placeholderTextColor={themeColors.textMuted}
                  value={urlInput}
                  onChangeText={setUrlInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Description */}
                <Text style={[styles.fieldLabel, { color: themeColors.textMuted }]}>DESCRIPTION (OPTIONAL)</Text>
                <TextInput
                  style={[styles.textAreaField, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
                  placeholder="Add brief description or notes about the link..."
                  placeholderTextColor={themeColors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: themeColors.primary }, (!title.trim() || !urlInput.trim() || uploading) && { opacity: 0.6 }]}
                  onPress={handleAdd}
                  disabled={!title.trim() || !urlInput.trim() || uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
                      <Text style={styles.saveBtnText}>Add Link</Text>
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
  iconContainer: {
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
  urlText: { fontSize: 12, fontFamily: 'Outfit-Medium', marginTop: 10, marginBottom: 4, fontStyle: 'italic' },
  cardActionsRow: {
    flexDirection: 'row',
    marginTop: 14,
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

export default YouTubeLinksContentScreen;
