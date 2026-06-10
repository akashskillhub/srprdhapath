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

const StateBoardFolderScreen = ({ route, navigation }) => {
  const { parentId = 'null', title = 'State Board', level = 'class' } = route.params || {};
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
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    primary: '#4F46E5',
    accent: '#10B981',
  };

  const { 
    data: folders = [], 
    isLoading: loading 
  } = useGetFoldersQuery({ 
    parent: parentId,
    category: 'STATE_BOARD'
  });

  const [createFolder] = useCreateFolderMutation();
  const [updateFolder] = useUpdateFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder({
        name: newFolderName,
        parent: parentId === 'null' ? null : parentId,
        category: 'STATE_BOARD',
        isFinal: level === 'subject',
      }).unwrap();
      setNewFolderName('');
    } catch (err) {
      Alert.alert('Error', 'Failed to create');
    }
  };

  const handleUpdateName = async () => {
    if (!editName.trim() || !editingFolder) return;
    try {
      await updateFolder({
        id: editingFolder._id,
        name: editName,
      }).unwrap();
      setEditingFolder(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to update');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Archive Folder', 'Deleting this will remove all sub-content. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFolder(id) }
    ]);
  };

  const renderItem = ({ item, index }) => {
    const isLocked = !user?.isPro && index > 0 && !isAdmin;
    return (
      <TouchableOpacity 
        style={[styles.itemCard, { backgroundColor: themeColors.card, borderColor: themeColors.border, opacity: isLocked ? 0.7 : 1 }]}
        onPress={() => {
            if (isLocked) {
                navigation.navigate('Subscription');
                return;
            }
            if (level === 'class') {
                navigation.push('StateBoardFolders', { 
                    parentId: item._id, 
                    title: item.name, 
                    level: 'subject' 
                });
            } else {
                navigation.push('StateBoardContent', { 
                    subjectId: item._id, 
                    subjectName: item.name 
                });
            }
        }}
      >
        <View style={[styles.iconBox, { backgroundColor: isLocked ? '#94A3B820' : themeColors.primary + '15' }]}>
           <MaterialCommunityIcons 
              name={isLocked ? "lock" : (level === 'class' ? "school-outline" : "book-outline")} 
              size={24} 
              color={isLocked ? "#94A3B8" : themeColors.primary} 
           />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.itemName, { color: themeColors.text }]}>{item.name}</Text>
                {isLocked && <MaterialCommunityIcons name="crown" size={14} color="#F59E0B" style={{ marginLeft: 6 }} />}
            </View>
            <Text style={[styles.itemSub, { color: themeColors.textMuted }]}>
                {level === 'class' ? 'Class Folder' : 'Subject Library'}
            </Text>
        </View>
        
        {isAdmin && (
            <View style={styles.adminActions}>
                <TouchableOpacity onPress={() => { setEditingFolder(item); setEditName(item.name); }}>
                    <MaterialCommunityIcons name="pencil" size={20} color={themeColors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ marginLeft: 15 }}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
            </View>
        )}
        {!isAdmin && (
            <MaterialCommunityIcons 
                name={isLocked ? "lock-outline" : "chevron-right"} 
                size={20} 
                color={themeColors.textMuted} 
            />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <View>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>{title}</Text>
            <Text style={styles.headerSubtitle}>STATE BOARD REPOSITORY</Text>
        </View>
      </View>

      {isAdmin && (
          <View style={styles.adminCreateBox}>
             <TextInput 
                style={[styles.input, { backgroundColor: themeColors.card, color: themeColors.text, borderColor: themeColors.border }]}
                placeholder={`Add New ${level === 'class' ? 'Class' : 'Subject'}...`}
                placeholderTextColor={themeColors.textMuted}
                value={newFolderName}
                onChangeText={setNewFolderName}
             />
             <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
                 <MaterialCommunityIcons name="plus" size={24} color="#fff" />
             </TouchableOpacity>
          </View>
      )}

      {loading ? <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 50 }} /> : (
          <FlatList
            data={folders}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={() => (
                <View style={styles.empty}>
                    <MaterialCommunityIcons name="folder-outline" size={80} color={themeColors.border} />
                    <Text style={{ color: themeColors.textMuted, marginTop: 10 }}>No folders found</Text>
                </View>
            )}
          />
      )}

      <Modal visible={!!editingFolder} transparent animationType="fade">
          <View style={styles.modalOverlay}>
              <View style={[styles.modalBox, { backgroundColor: themeColors.card }]}>
                  <Text style={[styles.modalTitle, { color: themeColors.text }]}>Rename</Text>
                  <TextInput 
                    style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                    value={editName}
                    onChangeText={setEditName}
                    autoFocus
                  />
                  <View style={styles.modalButtons}>
                      <TouchableOpacity onPress={() => setEditingFolder(null)}>
                          <Text style={{ color: themeColors.textMuted, fontWeight: 'bold' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateName}>
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Update</Text>
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
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  headerSubtitle: { fontSize: 10, color: '#4F46E5', fontWeight: 'bold', letterSpacing: 1 },
  adminCreateBox: { padding: 20, flexDirection: 'row', gap: 10 },
  input: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 15 },
  addBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWIdth: 1, marginBottom: 15, elevation: 2 },
  iconBox: { width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemSub: { fontSize: 11, marginTop: 2 },
  adminActions: { flexDirection: 'row' },
  empty: { alignItems: 'center', marginTop: 100 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 20, alignItems: 'center' },
  updateBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
});

export default StateBoardFolderScreen;
