import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useGetContactQueriesQuery, useDeleteContactQueryMutation } from '../redux/apis/studentApi';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/config';
import { LinearGradient } from 'expo-linear-gradient';

const AdminContactScreen = ({ navigation }) => {
  const { isDarkMode } = useSelector((state) => state.theme);
  const { data: contactsResponse, isLoading, refetch } = useGetContactQueriesQuery();
  const [deleteContact, { isLoading: deleting }] = useDeleteContactQueryMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [focusSearch, setFocusSearch] = useState(false);

  const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card = isDarkMode ? '#1E293B' : '#FFFFFF';
  const text = isDarkMode ? '#F8FAFC' : '#1E293B';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';
  const border = isDarkMode ? '#334155' : '#E2E8F0';
  const inputBg = isDarkMode ? '#1E293B' : '#FFFFFF';

  const queries = contactsResponse?.data || [];

  // Filter queries based on search query
  const filteredQueries = queries.filter(q => 
    q.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const registeredCount = queries.filter(q => q.user).length;

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Query',
      'Are you sure you want to delete this contact message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
             try {
               await deleteContact(id).unwrap();
               Toast.show({
                 type: 'success',
                 text1: 'Success',
                 text2: 'Message deleted successfully',
               });
             } catch (e) {
               console.error('Delete query failed:', e);
               Toast.show({
                 type: 'error',
                 text1: 'Failed',
                 text2: 'Could not delete the query',
               });
             }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.queryCard, 
      { 
        backgroundColor: card, 
        borderColor: border,
        borderLeftColor: item.user ? '#10B981' : '#64748B'
      }
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.userContainer}>
          <View style={[styles.avatarBox, { backgroundColor: item.user ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)' }]}>
            <Text style={[styles.avatarText, { color: item.user ? '#10B981' : COLORS.primary }]}>
              {item.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.userEmail, { color: muted }]} numberOfLines={1}>{item.email}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.deleteBtn, { backgroundColor: isDarkMode ? '#EF444420' : '#FFF1F2' }]} 
          onPress={() => handleDelete(item._id)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <Text style={[styles.messageLabel, { color: muted }]}>MESSAGE CONTENT</Text>
      <Text style={[styles.messageText, { color: text }]}>{item.message}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <MaterialCommunityIcons name="clock-outline" size={13} color={muted} style={{ marginRight: 4 }} />
          <Text style={[styles.dateText, { color: muted }]}>{formatDate(item.createdAt)}</Text>
        </View>
        
        {item.user ? (
          <View style={[styles.registeredBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Text style={styles.registeredText}>REGISTERED</Text>
          </View>
        ) : (
          <View style={[styles.registeredBadge, { backgroundColor: 'rgba(100, 116, 139, 0.1)' }]}>
            <Text style={[styles.registeredText, { color: '#64748B' }]}>GUEST</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backBtn, { backgroundColor: isDarkMode ? '#33415540' : '#E2E8F060', borderColor: border }]}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Student Queries</Text>
        <TouchableOpacity 
          onPress={refetch} 
          style={[styles.backBtn, { backgroundColor: isDarkMode ? '#33415540' : '#E2E8F060', borderColor: border }]}
        >
          <MaterialCommunityIcons name="refresh" size={22} color={text} />
        </TouchableOpacity>
      </View>

      {/* Stats Counter Dashboard Banner */}
      {!isLoading && queries.length > 0 && (
        <View style={styles.statsWrapper}>
          <LinearGradient
            colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#E0E7FF', '#C7D2FE']}
            style={styles.statsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: isDarkMode ? '#FFF' : '#3730A3' }]}>{queries.length}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#4F46E5' }]}>Total Messages</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: isDarkMode ? '#FFF' : '#3730A3' }]}>{registeredCount}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#4F46E5' }]}>From Registered</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Search Input with shadow */}
      <View style={styles.searchWrapper}>
        <View style={[
          styles.searchContainer, 
          { 
            backgroundColor: inputBg, 
            borderColor: focusSearch ? COLORS.primary : border,
            borderWidth: focusSearch ? 2 : 1
          }
        ]}>
          <MaterialCommunityIcons name="magnify" size={22} color={focusSearch ? COLORS.primary : muted} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search queries, email or name..."
            placeholderTextColor={muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setFocusSearch(true)}
            onBlur={() => setFocusSearch(false)}
            style={[styles.searchInput, { color: text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={muted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* List content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredQueries}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="inbox-outline" size={64} color={muted} />
              <Text style={[styles.emptyTitle, { color: text }]}>No Queries Active</Text>
              <Text style={[styles.emptySubtitle, { color: muted }]}>
                {searchQuery ? 'Try refinement keywords.' : 'All customer queries have been addressed.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    height: 70,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  statsWrapper: {
    paddingHorizontal: SPACING.lg,
    marginBottom: 16,
  },
  statsGradient: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
  },
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    height: '100%',
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queryCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderLeftWidth: 6,
    padding: 20,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  userEmail: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 14,
  },
  messageLabel: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  registeredBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  registeredText: {
    fontSize: 8,
    fontFamily: FONTS.bold,
    color: '#10B981',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 40,
  },
});

export default AdminContactScreen;
