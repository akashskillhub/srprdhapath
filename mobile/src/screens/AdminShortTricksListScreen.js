import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { 
  useGetShortTricksQuery, 
  useDeleteShortTrickMutation 
} from '../redux/apis/shortTricksApi';
import { useSelector } from 'react-redux';
import { getBaseUrl } from '../utils/config';

const AdminShortTricksListScreen = ({ route, navigation }) => {
  const { subjectId, subjectName } = route.params;
  const { isDarkMode } = useSelector((state) => state.theme);

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
  };

  const { 
    data: tricks = [], 
    isLoading: loading,
    refetch 
  } = useGetShortTricksQuery(subjectId);

  const [deleteTrick] = useDeleteShortTrickMutation();

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Trick',
      'Are you sure you want to delete this short trick?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteTrick(id).unwrap();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete trick');
            }
          } 
        }
      ]
    );
  };

  const renderTrickItem = ({ item }) => {
    const imageUrl = item.image 
        ? `${getBaseUrl().replace('/api', '')}${item.image}`
        : null;

    return (
      <View style={[styles.trickCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.trickImage} resizeMode="cover" />
        )}
        <View style={styles.trickContent}>
          <View style={styles.trickHeader}>
            <Text style={[styles.trickTitle, { color: themeColors.text }]} numberOfLines={1}>{item.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.navigate('AdminAddShortTrick', { trick: item, subjectId })}>
                <MaterialCommunityIcons name="pencil" size={20} color={themeColors.textMuted} style={{ marginRight: 15 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id)}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.trickText, { color: themeColors.textMuted }]} numberOfLines={3}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>{subjectName}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tricks}
          renderItem={renderTrickItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyBox}>
               <MaterialCommunityIcons name="lightning-bolt-outline" size={60} color={isDarkMode ? "#1E293B" : "#E2E8F0"} />
               <Text style={styles.emptyText}>No tricks added yet</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AdminAddShortTrick', { subjectId })}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  listContent: { padding: 20, paddingBottom: 100 },
  trickCard: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  trickImage: {
    width: '100%',
    height: 180,
  },
  trickContent: {
    padding: 15,
  },
  trickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trickTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  trickText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  editBtn: {
    alignSelf: 'flex-start',
  },
  editBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94A3B8', marginTop: 10, fontSize: 16 },
});

export default AdminShortTricksListScreen;
