import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { useSelector } from 'react-redux';
import { 
  useGetStudentsQuery, 
  useUpdateStudentStatusMutation 
} from '../redux/apis/adminApi';
import { getImageUrl } from '../utils/config';

const AdminStudentsScreen = ({ route, navigation }) => {
  const { filter } = route.params || {}; // paid, unpaid
  const { isDarkMode } = useSelector((state) => state.theme);
  const [search, setSearch] = useState('');

  const { data: studentsData, isLoading, refetch } = useGetStudentsQuery();
  const [updateStatus] = useUpdateStudentStatusMutation();

  const students = studentsData?.data || [];

  const filteredStudents = useMemo(() => {
    let result = students;
    if (filter === 'paid') result = result.filter(s => s.isPaid);
    if (filter === 'unpaid') result = result.filter(s => !s.isPaid);
    
    if (search) {
      result = result.filter(s => 
        s.name?.toLowerCase().includes(search.toLowerCase()) || 
        s.phone?.includes(search) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [students, filter, search]);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await updateStatus({ id, isPaid: !currentStatus }).unwrap();
      Alert.alert('Success', 'Status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderStudent = ({ item }) => (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      <View style={styles.cardHeader}>
        {item.avatar ? (
          <Image 
            source={{ uri: getImageUrl(item.avatar) }} 
            style={styles.avatar} 
          />
        ) : (
          <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' }]}>
            <MaterialCommunityIcons name="account" size={30} color="#94A3B8" />
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.name, isDarkMode && styles.textDark]}>{item.name}</Text>
          <Text style={styles.subInfo}>{item.phone}</Text>
          <Text style={styles.subInfo}>{item.email}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
         <View style={[styles.badge, item.isPaid ? styles.badgePaid : styles.badgeUnpaid]}>
            <Text style={item.isPaid ? styles.badgePaidText : styles.badgeUnpaidText}>
              {item.isPaid ? 'PAID' : 'UNPAID'}
            </Text>
         </View>
         <TouchableOpacity 
           onPress={() => toggleStatus(item._id, item.isPaid)}
           style={[styles.actionBtn, item.isPaid ? styles.btnDeactivate : styles.btnActivate]}
         >
           <Text style={styles.actionBtnText}>{item.isPaid ? 'Revoke Access' : 'Grant Access'}</Text>
         </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.textDark]}>
          {filter ? `${filter.toUpperCase()} STUDENTS` : 'ALL STUDENTS'}
        </Text>
      </View>

      <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
        <MaterialCommunityIcons name="magnify" size={24} color="#94A3B8" />
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.textDark]}
          placeholder="Search name, phone or email..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredStudents}
          extraData={isDarkMode}
          keyExtractor={(item) => item._id}
          renderItem={renderStudent}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-search-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>No students found matching your criteria.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backBtn: { marginRight: SPACING.md },
  title: { fontSize: 20, fontWeight: 'bold' },
  textDark: { color: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchContainerDark: { backgroundColor: '#1E293B', borderColor: '#334155' },
  searchInput: { flex: 1, height: 45, marginLeft: SPACING.sm },
  list: { padding: SPACING.md },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: RADIUS.lg, 
    padding: SPACING.md, 
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardDark: { backgroundColor: '#1E293B' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F1F5F9' },
  info: { marginLeft: SPACING.md, flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  subInfo: { fontSize: 13, color: '#64748B', marginTop: 2 },
  cardFooter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgePaid: { backgroundColor: '#DCFCE7' },
  badgeUnpaid: { backgroundColor: '#FEE2E2' },
  badgePaidText: { color: '#166534', fontSize: 12, fontWeight: 'bold' },
  badgeUnpaidText: { color: '#991B1B', fontSize: 12, fontWeight: 'bold' },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: RADIUS.md },
  btnActivate: { backgroundColor: COLORS.primary },
  btnDeactivate: { backgroundColor: '#EF4444' },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#94A3B8', marginTop: SPACING.md, fontSize: 16 },
});

export default AdminStudentsScreen;
