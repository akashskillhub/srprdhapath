import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/config';
import { useGetFoldersQuery } from '../redux/apis/studentApi';
import { 
  useCreateFolderMutation, 
  useUpdateFolderMutation,
  useDeleteFolderMutation 
} from '../redux/apis/adminApi';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const QuestionPaperFolderScreen = ({ route, navigation }) => {
  const { parentId = 'null', title = 'Question Paper', level = 'group' } = route.params || {};
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [editName, setEditName] = useState('');

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    primary: isDarkMode ? '#6366F1' : '#4F46E5',
    accent: '#F59E0B',
    headerBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    iconBg: isDarkMode ? '#312E81' : '#EEF2FF',
    inputBg: isDarkMode ? '#0F172A' : '#F8FAFC',
  };

  const { 
    data: folders = [], 
    isLoading: loading 
  } = useGetFoldersQuery({ 
    parent: parentId,
    category: 'QUESTION_PAPER'
  });

  const [createFolder] = useCreateFolderMutation();
  const [updateFolder] = useUpdateFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder({
        name: newFolderName.trim(),
        parent: parentId === 'null' ? null : parentId,
        category: 'QUESTION_PAPER',
        isFinal: level === 'year', // If creating under Group (level 'group'), next level is 'year', which isFinal holds PDFs
      }).unwrap();
      setNewFolderName('');
    } catch (err) {
      Alert.alert('Error', 'Failed to create folder');
    }
  };

  const handleUpdateName = async () => {
    if (!editName.trim() || !editingFolder) return;
    try {
      await updateFolder({
        id: editingFolder._id,
        name: editName.trim(),
      }).unwrap();
      setEditingFolder(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to update folder name');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Folder', 
      'Are you sure? Deleting this folder will permanently remove all subfolders and question paper PDFs inside.', 
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteFolder(id) }
      ]
    );
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.itemCard, 
          { 
            backgroundColor: themeColors.card, 
            borderColor: themeColors.border,
            shadowColor: isDarkMode ? '#000000' : '#4F46E5'
          }
        ]}
        activeOpacity={0.8}
        onPress={() => {
          if (level === 'group') {
            navigation.push('QuestionPaperFolders', { 
              parentId: item._id, 
              title: item.name, 
              level: 'year' 
            });
          } else {
            navigation.push('QuestionPaperContent', { 
              subjectId: item._id, 
              subjectName: item.name 
            });
          }
        }}
      >
        <View style={[styles.iconBox, { backgroundColor: themeColors.iconBg }]}>
          <MaterialCommunityIcons 
            name={level === 'group' ? 'folder-open-outline' : 'calendar-blank-outline'} 
            size={26} 
            color={themeColors.primary} 
          />
        </View>
        
        <View style={styles.infoBox}>
          <Text style={[styles.itemName, { color: themeColors.text }]}>{item.name}</Text>
          <Text style={[styles.itemSub, { color: themeColors.textMuted }]}>
            {level === 'group' ? 'Question Paper Group' : 'Academic Year'}
          </Text>
        </View>
        
        {isAdmin ? (
          <View style={styles.adminActions}>
            <TouchableOpacity 
              onPress={() => { setEditingFolder(item); setEditName(item.name); }}
              style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
            >
              <MaterialCommunityIcons name="pencil" size={18} color={themeColors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDelete(item._id)} 
              style={[styles.actionBtn, { backgroundColor: '#EF444415', marginLeft: 10 }]}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={22} 
            color={themeColors.textMuted} 
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={themeColors.headerBg} />
      
      {/* Premium Header */}
      <View style={[styles.header, { backgroundColor: themeColors.headerBg, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>{title}</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.primary }]}>
            {level === 'group' ? 'QUESTION PAPERS' : 'AVAILABLE YEARS'}
          </Text>
        </View>
      </View>

      {/* Admin Folder Creation Box */}
      {isAdmin && (
        <View style={styles.adminCreateBox}>
          <TextInput 
            style={[
              styles.input, 
              { 
                backgroundColor: themeColors.card, 
                color: themeColors.text, 
                borderColor: themeColors.border 
              }
            ]}
            placeholder={level === 'group' ? "Add group (e.g. गट अ, संयुक्त गट ब)..." : "Add year (e.g. 2026)..."}
            placeholderTextColor={themeColors.textMuted}
            value={newFolderName}
            onChangeText={setNewFolderName}
          />
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors.primary }]} onPress={handleCreate}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Folders List */}
      {loading ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={folders}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="folder-text-outline" size={80} color={themeColors.border} />
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
                {level === 'group' ? 'No groups created yet' : 'No years added yet'}
              </Text>
              {isAdmin && (
                <Text style={{ color: themeColors.textMuted, fontSize: 13, marginTop: 5 }}>
                  Use the input field above to add a new item
                </Text>
              )}
            </View>
          )}
        />
      )}

      {/* Edit Folder Name Modal */}
      <Modal visible={!!editingFolder} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Rename Folder</Text>
            <TextInput 
              style={[
                styles.input, 
                { 
                  backgroundColor: themeColors.inputBg, 
                  color: themeColors.text, 
                  borderColor: themeColors.border,
                  marginBottom: 20
                }
              ]}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setEditingFolder(null)} style={styles.cancelBtn}>
                <Text style={[styles.cancelBtnText, { color: themeColors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.updateBtn, { backgroundColor: themeColors.primary }]} onPress={handleUpdateName}>
                <Text style={styles.updateBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1,
    elevation: 2,
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontFamily: 'Outfit-Bold' },
  headerSubtitle: { fontSize: 10, fontFamily: 'Outfit-Bold', letterSpacing: 1.5, marginTop: 2 },
  adminCreateBox: { padding: 20, flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { 
    flex: 1, 
    height: 52, 
    borderRadius: 14, 
    borderWidth: 1, 
    paddingHorizontal: 15,
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
  },
  addBtn: { 
    width: 52, 
    height: 52, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 3,
  },
  list: { padding: 20, paddingBottom: 40 },
  itemCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  iconBox: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  infoBox: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 16, fontFamily: 'Outfit-Bold' },
  itemSub: { fontSize: 11, fontFamily: 'Outfit-Medium', marginTop: 2 },
  adminActions: { flexDirection: 'row' },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 15, fontFamily: 'Outfit-Bold', marginTop: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalBox: { padding: 24, borderRadius: 24, elevation: 20 },
  modalTitle: { fontSize: 18, fontFamily: 'Outfit-Bold', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, alignItems: 'center' },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  cancelBtnText: { fontFamily: 'Outfit-Bold', fontSize: 14 },
  updateBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, elevation: 2 },
  updateBtnText: { color: '#fff', fontFamily: 'Outfit-Bold', fontSize: 14 },
});

export default QuestionPaperFolderScreen;
