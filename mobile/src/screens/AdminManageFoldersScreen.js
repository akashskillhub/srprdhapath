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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { useGetFoldersQuery } from '../redux/apis/studentApi';
import { 
  useCreateFolderMutation, 
  useDeleteFolderMutation 
} from '../redux/apis/adminApi';

const AdminManageFoldersScreen = ({ navigation }) => {
  const [parentStack, setParentStack] = useState([{ id: null, name: 'Root' }]);
  const [newFolderName, setNewFolderName] = useState('');
  const [category, setCategory] = useState('PYQ_HUB');

  const currentParent = parentStack[parentStack.length - 1];

  // Fetch folders using RTK Query
  const { 
    data: folders = [], 
    isLoading: loading 
  } = useGetFoldersQuery({ 
    parent: currentParent.id === null ? 'null' : currentParent.id 
  });

  const [createFolder] = useCreateFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder({
        name: newFolderName,
        parent: currentParent.id,
        category: currentParent.id === null ? category : currentParent.category,
        isFinal: false,
      }).unwrap();
      setNewFolderName('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create folder');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Folder',
      'Are you sure? All subfolders and questions inside will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteFolder(id).unwrap();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete folder');
            }
          } 
        }
      ]
    );
  };

  const navigateInto = (folder) => {
    setParentStack([...parentStack, { id: folder._id, name: folder.name, category: folder.category }]);
  };

  const navigateBack = () => {
    if (parentStack.length > 1) {
      const newStack = [...parentStack];
      newStack.pop();
      setParentStack(newStack);
    } else {
      navigation.goBack();
    }
  };

  const renderFolderItem = ({ item }) => (
    <View style={styles.folderRow}>
      <TouchableOpacity 
        style={styles.folderInfo}
        onPress={() => navigateInto(item)}
      >
        <MaterialCommunityIcons name="folder" size={30} color="#F59E0B" />
        <Text style={styles.folderName}>{item.name}</Text>
      </TouchableOpacity>
      <View style={styles.actionBtns}>
         <TouchableOpacity style={styles.actionBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={20} color={COLORS.primary} />
         </TouchableOpacity>
         <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleDelete(item._id)}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color={COLORS.danger} />
         </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Folders</Text>
      </View>

      <View style={styles.breadcrumb}>
        {parentStack.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <MaterialCommunityIcons name="chevron-right" size={16} color="#94A3B8" />
            )}
            <Text style={[styles.breadcrumbText, index === parentStack.length - 1 && styles.breadcrumbActive]}>
              {item.name}
            </Text>
          </React.Fragment>
        ))}
      </View>

      {currentParent.id === null && (
        <View style={styles.categoryPicker}>
           {['PYQ_HUB', 'SUBJECT_WISE', 'YEAR_WISE', 'MODULE'].map((cat) => (
             <TouchableOpacity 
                key={cat}
                style={[styles.catBtn, category === cat && styles.catBtnActive]}
                onPress={() => setCategory(cat)}
             >
                <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>
                  {cat.replace('_', ' ')}
                </Text>
             </TouchableOpacity>
           ))}
        </View>
      )}

      <View style={styles.createBox}>
        <TextInput
          style={styles.input}
          placeholder="New Folder Name"
          value={newFolderName}
          onChangeText={setNewFolderName}
        />
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateFolder}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={folders}
          renderItem={renderFolderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  breadcrumb: {
    padding: SPACING.md,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#64748B',
  },
  breadcrumbActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  categoryPicker: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catBtnText: {
    fontSize: 12,
    color: '#64748B',
  },
  catBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createBox: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: SPACING.md,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  folderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderName: {
    marginLeft: SPACING.md,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  actionBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    padding: 8,
  }
});

export default AdminManageFoldersScreen;
