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
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { 
  useCreateShortTrickMutation, 
  useUpdateShortTrickMutation 
} from '../redux/apis/shortTricksApi';
import { useSelector } from 'react-redux';
import { getBaseUrl } from '../utils/config';

const AdminAddShortTrickScreen = ({ route, navigation }) => {
  const { subjectId, trick } = route.params;
  const isEditing = !!trick;

  const [title, setTitle] = useState(trick?.title || '');
  const [content, setContent] = useState(trick?.content || '');
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(trick?.image || null);
  const [loading, setLoading] = useState(false);

  const { isDarkMode } = useSelector((state) => state.theme);
  const [createShortTrick] = useCreateShortTrickMutation();
  const [updateShortTrick] = useUpdateShortTrickMutation();

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    inputBg: isDarkMode ? '#1E293B' : '#FFFFFF',
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setExistingImage(null);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Required Fields', 'Please enter both title and content.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('subjectId', subjectId);

      if (image) {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('image', {
          uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
          name: `trick-${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      if (isEditing) {
        await updateShortTrick({ id: trick._id, formData }).unwrap();
        Alert.alert('Success', 'Short trick updated successfully');
      } else {
        await createShortTrick(formData).unwrap();
        Alert.alert('Success', 'Short trick created successfully');
      }
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save short trick');
    } finally {
      setLoading(false);
    }
  };

  const displayImage = image?.uri || (existingImage ? `${getBaseUrl().replace('/api', '')}${existingImage}` : null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialCommunityIcons name="close" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            {isEditing ? 'Edit Short Trick' : 'New Short Trick'}
          </Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={loading}
            style={[styles.saveBtn, (!title.trim() || !content.trim()) && { opacity: 0.5 }]}
          >
            {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.label, { color: themeColors.text }]}>TRICK TITLE</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
            placeholder="Enter a catchy title..."
            placeholderTextColor={isDarkMode ? "#94A3B8" : "#64748B"}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: themeColors.text }]}>TRICK CONTENT (TEXT AREA)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.border }]}
            placeholder="Describe the trick in detail..."
            placeholderTextColor={isDarkMode ? "#94A3B8" : "#64748B"}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />

          <Text style={[styles.label, { color: themeColors.text }]}>IMAGE ILLUSTRATION (OPTIONAL)</Text>
          <TouchableOpacity 
            style={[styles.imagePicker, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={pickImage}
          >
            {displayImage ? (
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: displayImage }} style={styles.pickedImage} />
                    <View style={styles.imageOverlay}>
                        <MaterialCommunityIcons name="camera" size={24} color="#fff" />
                        <Text style={styles.changeText}>Change Image</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.pickerPlaceholder}>
                    <MaterialCommunityIcons name="image-plus" size={40} color={COLORS.primary} />
                    <Text style={[styles.pickerText, { color: themeColors.textMuted }]}>Upload an image for this trick</Text>
                </View>
            )}
          </TouchableOpacity>
          
          {displayImage && (
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImage(null); setExistingImage(null); }}>
                  <Text style={styles.removeText}>Remove Image</Text>
              </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  saveBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  saveBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollContent: { padding: 20 },
  label: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: 1,
  },
  input: {
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 25,
  },
  textArea: {
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
    fontSize: 16,
    marginBottom: 25,
  },
  imagePicker: {
    height: 220,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerPlaceholder: {
    alignItems: 'center',
  },
  pickerText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: {
    color: '#fff',
    fontWeight: '700',
    marginTop: 5,
  },
  removeImageBtn: {
      alignSelf: 'center',
      marginTop: 15,
  },
  removeText: {
      color: COLORS.danger,
      fontWeight: '600',
  }
});

export default AdminAddShortTrickScreen;
