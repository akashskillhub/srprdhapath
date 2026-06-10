import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Linking,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { 
  useGetNotesQuery, 
  useGetNewspapersQuery,
  useAddNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useAddNewspaperMutation,
  useDeleteNewspaperMutation
} from '../redux/apis/studentApi';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { getImageUrl } from '../utils/config';

const NewsScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const isAdmin = user?.role === 'admin';

  const [currentLayer, setCurrentLayer] = useState('MAIN'); // MAIN, NOTES, PAPERS
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form States
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteImage, setNoteImage] = useState(null);

  const [paperName, setPaperName] = useState('');
  const [paperUrl, setPaperUrl] = useState('');

  // Queries
  const { data: notesResp, isLoading: loadingNotes, refetch: refetchNotes } = useGetNotesQuery();
  const { data: papersResp, isLoading: loadingPapers, refetch: refetchPapers } = useGetNewspapersQuery();

  const notes = notesResp?.success ? notesResp.data : [];
  const papers = papersResp?.success ? papersResp.data : [];

  // Mutations
  const [addNote, { isLoading: addingNote }] = useAddNoteMutation();
  const [updateNote, { isLoading: updatingNote }] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [addPaper, { isLoading: addingPaper }] = useAddNewspaperMutation();
  const [deletePaper] = useDeleteNewspaperMutation();

  const onRefresh = () => {
    refetchNotes();
    refetchPapers();
  };

  const handleBack = () => {
    if (currentLayer !== 'MAIN') setCurrentLayer('MAIN');
    else navigation.goBack();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setNoteImage(result.assets[0].uri);
  };

  const handleAddNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      Alert.alert('Error', 'Please fill required fields'); return;
    }
    const formData = new FormData();
    formData.append('title', noteTitle);
    formData.append('content', noteContent);
    
    // Only append if it's a new local file URI (not already uploaded remote HTTP URL)
    if (noteImage && !noteImage.startsWith('http')) {
      formData.append('image', { uri: noteImage, name: 'note.jpg', type: 'image/jpeg' });
    }

    try {
      if (editingItem) {
        await updateNote({ id: editingItem._id, formData }).unwrap();
        Alert.alert('Success', 'Note updated successfully!');
      } else {
        await addNote(formData).unwrap();
        Alert.alert('Success', 'Note added successfully!');
      }
      setNoteTitle(''); setNoteContent(''); setNoteImage(null); setEditingItem(null); setShowForm(false);
    } catch (e) { 
      Alert.alert('Error', editingItem ? 'Failed to update note' : 'Failed to add note'); 
    }
  };

  const handleEditNote = (note) => {
    setEditingItem(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteImage(note.image ? getImageUrl(note.image) : null);
    setShowForm(true);
  };

  const handleOpenLink = async (urlStr) => {
    if (!urlStr) return;
    let formattedUrl = urlStr.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    try {
      const supported = await Linking.canOpenURL(formattedUrl);
      if (supported) {
        await Linking.openURL(formattedUrl);
      } else {
        Alert.alert('Invalid Link', `Cannot open URL: ${urlStr}`);
      }
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'Failed to open link.');
    }
  };

  const handleAddPaper = async () => {
    if (!paperName.trim() || !paperUrl.trim()) {
      Alert.alert('Error', 'Please fill required fields'); return;
    }
    try {
      await addPaper({ title: paperName, url: paperUrl }).unwrap();
      Alert.alert('Success', 'Paper added!');
      setPaperName(''); setPaperUrl(''); setShowForm(false);
    } catch (e) { Alert.alert('Error', 'Failed to add newspaper'); }
  };

  const handleDelete = (id, type) => {
    Alert.alert('Delete?', 'Permanent action', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            if (type === 'NOTE') await deleteNote(id).unwrap();
            else await deletePaper(id).unwrap();
          } catch(e) { Alert.alert('Error', 'Failed to delete'); }
        }
      }
    ]);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={isDarkMode ? ['#1E1B4B', '#312E81', '#1E293B'] : ['#F59E0B', '#F97316', '#EA580C']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.premiumHeader}
    >
      {/* Decorative circles for header flair */}
      <View style={styles.headerCircle1} />
      <View style={styles.headerCircle2} />

      <View style={styles.headerInner}>
        <TouchableOpacity onPress={handleBack} style={styles.floatingBackBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.premiumHeaderTitle}>
            {currentLayer === 'MAIN' ? 'Current Affairs' : currentLayer === 'NOTES' ? 'Daily Notes' : 'E-Newspapers'}
          </Text>
          <View style={styles.breadcrumbBadge}>
            <MaterialCommunityIcons 
              name={currentLayer === 'MAIN' ? "lightning-bolt" : "book-open-variant"} 
              size={12} 
              color="rgba(255,255,255,0.9)" 
              style={{ marginRight: 4 }}
            />
            <Text style={styles.premiumHeaderSubtitle}>
              Knowledge / {currentLayer}
            </Text>
          </View>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.headerAdminBadge}>
             <MaterialCommunityIcons name="shield-account" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      {renderHeader()}
      
      <ScrollView 
        contentContainerStyle={styles.mainContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loadingNotes || loadingPapers} onRefresh={onRefresh} />}
      >
        {isAdmin && currentLayer !== 'MAIN' && (
          <View style={styles.adminControlsRestored}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => {
                if (!showForm) {
                  setEditingItem(null);
                  setNoteTitle('');
                  setNoteContent('');
                  setNoteImage(null);
                  setPaperName('');
                  setPaperUrl('');
                }
                setShowForm(!showForm);
              }}
              style={styles.premiumActionCard}
            >
              <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.gradientActionBox}>
                <MaterialCommunityIcons name={showForm ? "close" : "plus-circle-outline"} size={26} color="#fff" />
                <View style={styles.actionTextWrapper}>
                  <Text style={styles.actionTitle}>{showForm ? 'Cancel' : `Add ${currentLayer === 'NOTES' ? 'Notes' : 'Paper'}`}</Text>
                  <Text style={styles.actionSubtitle}>Update Current Affairs</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {showForm && currentLayer === 'NOTES' && (
              <View style={[styles.modernForm, isDarkMode && styles.formDark]}>
                <View style={styles.formHeaderContainer}>
                  <Text style={[styles.formTitle, isDarkMode && styles.textDark]}>
                    {editingItem ? 'Update Important Note' : 'Add Important Note'}
                  </Text>
                  {editingItem && (
                    <TouchableOpacity 
                      onPress={() => {
                        setEditingItem(null);
                        setNoteTitle('');
                        setNoteContent('');
                        setNoteImage(null);
                        setShowForm(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="close-circle" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput style={[styles.premiumInput, isDarkMode && styles.inputDark]} placeholder="Note Title" value={noteTitle} onChangeText={setNoteTitle} />
                <TextInput 
                  style={[styles.premiumInput, isDarkMode && styles.inputDark, { height: 100 }]} 
                  placeholder="Detailed Notes..." 
                  multiline 
                  numberOfLines={4}
                  value={noteContent} 
                  onChangeText={setNoteContent} 
                />
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  {noteImage ? (
                    <Image source={{ uri: noteImage }} style={styles.preview} resizeMode="cover" />
                  ) : (
                    <Text style={styles.pickerText}>+ Add Notes Image</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleAddNote} 
                  disabled={addingNote || updatingNote} 
                  style={[styles.finalGradientBtn, editingItem && { backgroundColor: '#10B981' }]}
                  activeOpacity={0.85}
                >
                   {addingNote || updatingNote ? (
                     <ActivityIndicator color="#fff" />
                   ) : (
                     <Text style={styles.btnText}>{editingItem ? 'Update Note' : 'Post Important Note'}</Text>
                   )}
                </TouchableOpacity>
              </View>
            )}

            {showForm && currentLayer === 'PAPERS' && (
              <View style={[styles.modernForm, isDarkMode && styles.formDark]}>
                <TextInput style={[styles.premiumInput, isDarkMode && styles.inputDark]} placeholder="Newspaper Name (e.g. Lokmat)" value={paperName} onChangeText={setPaperName} />
                <TextInput style={[styles.premiumInput, isDarkMode && styles.inputDark]} placeholder="Link / URL" value={paperUrl} onChangeText={setPaperUrl} />
                <TouchableOpacity onPress={handleAddPaper} disabled={addingPaper} style={styles.finalGradientBtn}>
                   {addingPaper ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Add Paper Link</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {currentLayer === 'MAIN' && (
          <View style={{ gap: 20 }}>
            {/* Notes Section Card */}
            <TouchableOpacity 
              activeOpacity={0.85} 
              onPress={() => setCurrentLayer('NOTES')}
            >
              <LinearGradient
                colors={isDarkMode ? ['#1E293B', '#1E293B'] : ['#FFFFFF', '#F8FAFC']}
                style={[styles.premiumFolderCard, isDarkMode && { borderColor: '#334155' }]}
              >
                <LinearGradient
                  colors={['#F59E0B', '#FBBF24']}
                  style={styles.iconCircleGradient}
                >
                  <MaterialCommunityIcons name="note-text" size={28} color="#fff" />
                </LinearGradient>
                
                <View style={styles.folderTextContainerStyle}>
                  <Text style={[styles.folderTitle, isDarkMode && styles.textDark]}>Important Notes</Text>
                  <Text style={styles.folderSub}>Crucial updates & theory</Text>
                </View>

                <View style={[styles.folderChevronCircle, { backgroundColor: '#F59E0B20' }]}>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#F59E0B" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Newspapers Section Card */}
            <TouchableOpacity 
              activeOpacity={0.85} 
              onPress={() => setCurrentLayer('PAPERS')}
            >
              <LinearGradient
                colors={isDarkMode ? ['#1E293B', '#1E293B'] : ['#FFFFFF', '#F8FAFC']}
                style={[styles.premiumFolderCard, isDarkMode && { borderColor: '#334155' }]}
              >
                <LinearGradient
                  colors={['#3B82F6', '#60A5FA']}
                  style={styles.iconCircleGradient}
                >
                  <MaterialCommunityIcons name="newspaper-variant" size={28} color="#fff" />
                </LinearGradient>

                <View style={styles.folderTextContainerStyle}>
                  <Text style={[styles.folderTitle, isDarkMode && styles.textDark]}>News Paper (Marathi)</Text>
                  <Text style={styles.folderSub}>Latest daily editions</Text>
                </View>

                <View style={[styles.folderChevronCircle, { backgroundColor: '#3B82F620' }]}>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#3B82F6" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {currentLayer === 'NOTES' && (
          notes.length === 0 ? <Text style={styles.emptyText}>No notes found.</Text> :
          notes.map((item) => (
            <View key={item._id} style={[styles.noteCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={styles.noteHeader}>
                <View style={styles.noteBadge}><Text style={styles.noteBadgeText}>IMP</Text></View>
                {isAdmin && (
                  <View style={styles.adminActionContainer}>
                    <TouchableOpacity 
                      onPress={() => handleEditNote(item)}
                      style={[styles.editButton, isDarkMode && { backgroundColor: '#4F46E530' }]}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={18} color={isDarkMode ? "#A5B4FC" : "#4F46E5"} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDelete(item._id, 'NOTE')}
                      style={[styles.deleteButton, isDarkMode && { backgroundColor: '#EF444430' }]}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {item.image && <Image source={{ uri: getImageUrl(item.image) }} resizeMode="cover" style={styles.noteImage} />}
              <Text style={[styles.noteTitle, isDarkMode && styles.textDark]}>{item.title}</Text>
              <Text style={[styles.noteContent, isDarkMode && { color: '#94A3B8' }]}>{item.content}</Text>
            </View>
          ))
        )}

        {currentLayer === 'PAPERS' && (
          papers.length === 0 ? <Text style={styles.emptyText}>No newspapers added.</Text> :
          papers.map((item) => (
            <TouchableOpacity 
              key={item._id} 
              style={[styles.paperCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]} 
              onPress={() => handleOpenLink(item.url)}
            >
              <View style={styles.paperIcon}>
                <Text style={styles.paperInitial}>{item.title[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.paperTitle, isDarkMode && styles.textDark]}>{item.title}</Text>
                <Text style={styles.paperSub} numberOfLines={1}>{item.url}</Text>
              </View>
              {isAdmin && (
                <TouchableOpacity 
                  onPress={() => handleDelete(item._id, 'PAPER')} 
                  style={{ marginRight: 15 }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="delete-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
              )}
              <MaterialCommunityIcons name="open-in-new" size={20} color="#3B82F6" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  premiumHeader: { 
    paddingTop: 45, 
    paddingBottom: 35, 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40, 
    elevation: 20,
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, zIndex: 10 },
  floatingBackBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTextContainer: { flex: 1 },
  premiumHeaderTitle: { 
    fontSize: 26, 
    fontFamily: 'Outfit-Bold', 
    color: '#fff',
    letterSpacing: -0.5,
  },
  breadcrumbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  premiumHeaderSubtitle: { 
    fontSize: 10, 
    color: '#fff', 
    fontFamily: 'Outfit-Bold', 
    textTransform: 'uppercase', 
    letterSpacing: 1.2 
  },
  headerAdminBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mainContent: { padding: 20, paddingBottom: 100 },
  adminControlsRestored: { marginBottom: 20 },
  premiumActionCard: { borderRadius: 24, elevation: 8, overflow: 'hidden', marginBottom: 20 },
  gradientActionBox: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  actionTextWrapper: { marginLeft: 15 },
  actionTitle: { color: '#fff', fontSize: 18, fontFamily: 'Outfit-Bold' },
  actionSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Outfit-Regular' },
  modernForm: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 25, 
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  formDark: { backgroundColor: '#1E293B' },
  premiumInput: { 
    backgroundColor: '#F8FAFC', 
    padding: 18, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: '#F1F5F9', 
    marginBottom: 16, 
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
    color: '#1E293B',
  },
  inputDark: { backgroundColor: '#0F172A', color: '#fff', borderColor: '#334155' },
  finalGradientBtn: { backgroundColor: '#F97316', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 4 },
  btnText: { color: '#fff', fontFamily: 'Outfit-Bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  premiumFolderCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 28, 
    elevation: 4, 
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  iconCircleGradient: { 
    width: 60, 
    height: 60, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  folderTextContainerStyle: { flex: 1 },
  folderTitle: { fontSize: 20, fontFamily: 'Outfit-Bold', color: '#1E293B' },
  folderSub: { fontSize: 13, color: '#94A3B8', fontFamily: 'Outfit-Medium', marginTop: 2 },
  folderChevronCircle: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  noteCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 32, 
    padding: 24, 
    marginBottom: 24, 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, alignItems: 'center' },
  noteBadge: { backgroundColor: '#F59E0B15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  noteBadgeText: { color: '#F59E0B', fontSize: 11, fontFamily: 'Outfit-Bold', letterSpacing: 0.5 },
  noteImage: { width: '100%', height: 220, borderRadius: 24, marginBottom: 20, resizeMode: 'cover' },
  noteTitle: { fontSize: 22, fontFamily: 'Outfit-Bold', color: '#0F172A', marginBottom: 12, lineHeight: 28 },
  noteContent: { fontSize: 15, color: '#475569', lineHeight: 24, fontFamily: 'Outfit-Medium' },
  paperCard: { 
    backgroundColor: '#FFFFFF', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 24, 
    marginBottom: 16, 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  paperIcon: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    backgroundColor: '#3B82F615', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 18 
  },
  paperInitial: { fontSize: 24, fontFamily: 'Outfit-Bold', color: '#3B82F6' },
  paperTitle: { fontSize: 18, fontFamily: 'Outfit-Bold', color: '#1E293B' },
  paperSub: { fontSize: 12, color: '#94A3B8', fontFamily: 'Outfit-Medium', marginTop: 2 },
  imagePicker: { 
    height: 140, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 20, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#CBD5E1', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20 
  },
  preview: { width: '100%', height: '100%', borderRadius: 18 },
  pickerText: { color: '#64748B', fontSize: 13, fontFamily: 'Outfit-Bold' },
  emptyText: { textAlign: 'center', marginTop: 60, color: '#94A3B8', fontFamily: 'Outfit-Medium', fontSize: 15 },
  textDark: { color: '#FFFFFF' },
  adminActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    marginRight: 4,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  formHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default NewsScreen;
