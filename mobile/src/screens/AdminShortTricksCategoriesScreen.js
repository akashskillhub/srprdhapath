import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { useGetFoldersQuery } from '../redux/apis/studentApi';
import { 
  useCreateFolderMutation, 
  useUpdateFolderMutation,
  useDeleteFolderMutation 
} from '../redux/apis/adminApi';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AdminShortTricksCategoriesScreen = ({ navigation }) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [editName, setEditName] = useState('');
  
  const { isDarkMode } = useSelector((state) => state.theme);

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    primary: isDarkMode ? '#F43F5E' : '#E11D48',
    inputBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    modalBg: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
  };

  const { 
    data: folders = [], 
    isLoading: loading 
  } = useGetFoldersQuery({ 
    parent: 'null',
    category: 'SHORT_TRICKS'
  });

  const [createFolder] = useCreateFolderMutation();
  const [updateFolder] = useUpdateFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();

  const handleCreateSubject = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder({
        name: newFolderName,
        parent: null,
        category: 'SHORT_TRICKS',
        isFinal: true,
      }).unwrap();
      setNewFolderName('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create subject');
    }
  };

  const openEditModal = (folder) => {
      setEditingFolder(folder);
      setEditName(folder.name);
  };

  const handleUpdate = async () => {
      if (!editName.trim() || !editingFolder) return;
      try {
          await updateFolder({
              id: editingFolder._id,
              name: editName,
          }).unwrap();
          setEditingFolder(null);
          Alert.alert('Success', 'Subject renamed successfully');
      } catch (err) {
          Alert.alert('Error', 'Failed to update subject name');
      }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Deletion',
      'This will permanently delete this subject and all short tricks inside it.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Subject', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteFolder(id).unwrap();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete subject');
            }
          } 
        }
      ]
    );
  };

  const renderSubjectItem = ({ item }) => (
    <View style={[styles.folderRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <TouchableOpacity 
        style={styles.folderInfo}
        onPress={() => navigation.navigate('AdminShortTricksList', { subjectId: item._id, subjectName: item.name })}
      >
        <LinearGradient
            colors={['#F43F5E', '#BE123C']}
            style={styles.iconBox}
        >
           <MaterialCommunityIcons name="lightning-bolt" size={24} color="#fff" />
        </LinearGradient>
        <View style={styles.textData}>
            <Text style={[styles.folderName, { color: themeColors.text }]}>{item.name}</Text>
            <Text style={[styles.folderItems, { color: themeColors.textMuted }]}>Short Tricks Manager</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.rowActions}>
          <TouchableOpacity 
            style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={() => openEditModal(item)}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color={themeColors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionIcon, { backgroundColor: '#EF444410' }]}
            onPress={() => handleDelete(item._id)}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <View>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>Tricks Subjects</Text>
            <Text style={[styles.headerSub, { color: themeColors.textMuted }]}>Administrative Management</Text>
        </View>
      </View>

      <FlatList
        data={folders}
        renderItem={renderSubjectItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
            <View>
                <View style={styles.statsBanner}>
                    <LinearGradient
                        colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#F1F5F9']}
                        style={[styles.statsCard, { borderColor: themeColors.border }]}
                    >
                        <View style={styles.statLine}>
                            <View>
                                <Text style={[styles.statTitle, { color: themeColors.text }]}>Total Folders</Text>
                                <Text style={[styles.statValue, { color: themeColors.primary }]}>{folders.length}</Text>
                            </View>
                            <MaterialCommunityIcons name="folder-multiple-outline" size={40} color={themeColors.textMuted + '40'} />
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.createBox}>
                    <View style={[styles.inputGroup, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={20} color={themeColors.textMuted} />
                        <TextInput
                            style={[styles.input, { color: themeColors.text }]}
                            placeholder="Add New Subject..."
                            placeholderTextColor={themeColors.textMuted}
                            value={newFolderName}
                            onChangeText={setNewFolderName}
                        />
                        <TouchableOpacity 
                            style={[styles.addBtn, !newFolderName.trim() && { opacity: 0.5 }]} 
                            onPress={handleCreateSubject}
                            disabled={!newFolderName.trim()}
                        >
                            <Text style={styles.addBtnText}>CREATE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, { color: themeColors.text }]}>Active Subjects</Text>
                    <View style={styles.divider} />
                </View>
            </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
             {loading ? (
                <ActivityIndicator size="large" color={themeColors.primary} />
             ) : (
                <>
                <MaterialCommunityIcons name="folder-open-outline" size={60} color={isDarkMode ? "#1E293B" : "#E2E8F0"} />
                <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>Create your first subject folder</Text>
                </>
             )}
          </View>
        )}
      />

      <Modal
        visible={!!editingFolder}
        transparent
        animationType="fade"
      >
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
             <View style={[styles.modalContent, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                 <Text style={[styles.modalTitle, { color: themeColors.text }]}>Rename Subject</Text>
                 <TextInput 
                    style={[styles.modalInput, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter subject name..."
                    placeholderTextColor={themeColors.textMuted}
                    autoFocus
                 />
                 <View style={styles.modalActions}>
                     <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingFolder(null)}>
                         <Text style={[styles.cancelText, { color: themeColors.textMuted }]}>Cancel</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
                         <Text style={styles.updateText}>Update Name</Text>
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
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: '900', fontFamily: 'Outfit-Bold' },
  headerSub: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  statsBanner: { padding: 20, paddingBottom: 0 },
  statsCard: {
      padding: 20,
      borderRadius: 24,
      borderWidth: 1,
  },
  statLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  statValue: { fontSize: 24, fontWeight: '900' },
  createBox: { padding: 20 },
  inputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 60,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 15,
      elevation: 2,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
  addBtn: { backgroundColor: '#10B981', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  listHeader: { paddingHorizontal: 22, marginBottom: 15 },
  listTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  divider: { height: 2, backgroundColor: '#10B981', width: 40, marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 24,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 3,
  },
  folderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textData: { marginLeft: 15 },
  folderName: { fontSize: 17, fontWeight: '800' },
  folderItems: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  rowActions: { flexDirection: 'row', gap: 8 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContent: { width: '100%', padding: 25, borderRadius: 30, borderWidth: 1, elevation: 15 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
  modalInput: { height: 60, borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, fontSize: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 15 },
  cancelText: { fontWeight: '700', fontSize: 14 },
  updateBtn: { backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  updateText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});

export default AdminShortTricksCategoriesScreen;
