import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Alert, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetTestsQuery, useCreateTestMutation, useDeleteTestMutation, useUpdateTestMutation } from '../redux/apis/testApi';
import { useSelector } from 'react-redux';

const LEVEL_CONFIG = {
  easy:   { colors: ['#10B981', '#059669'], icon: 'leaf',              label: 'Easy Level'   },
  medium: { colors: ['#F59E0B', '#D97706'], icon: 'fire',              label: 'Medium Level' },
  hard:   { colors: ['#EF4444', '#DC2626'], icon: 'skull-crossbones',  label: 'Hard Level'   },
};

const TestListScreen = ({ route, navigation }) => {
  const { difficulty, label } = route.params;
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [testName, setTestName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const bg   = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card = isDarkMode ? '#1E293B' : '#FFFFFF';
  const text = isDarkMode ? '#F8FAFC' : '#1E293B';
  const muted= isDarkMode ? '#94A3B8' : '#64748B';
  const border=isDarkMode ? '#334155' : '#E2E8F0';
  const cfg  = LEVEL_CONFIG[difficulty];

  const { data: tests = [], isLoading, refetch } = useGetTestsQuery(difficulty);
  const [createTest] = useCreateTestMutation();
  const [updateTest] = useUpdateTestMutation();
  const [deleteTest]  = useDeleteTestMutation();

  const handleSave = async () => {
    if (!testName.trim()) return;
    try {
      if (editingTest) {
        await updateTest({ id: editingTest._id, name: testName.trim() }).unwrap();
      } else {
        await createTest({ name: testName.trim(), difficulty }).unwrap();
      }
      setTestName('');
      setEditingTest(null);
      setShowModal(false);
      refetch();
    } catch { Alert.alert('Error', 'Could not save test'); }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Test', `Delete "${name}" and all its questions?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteTest(id).unwrap().catch(() => Alert.alert('Error', 'Could not delete test'));
        refetch();
      }},
    ]);
  };

  const openEditModal = (item) => {
    setEditingTest(item);
    setTestName(item.name);
    setShowModal(true);
  };

  const renderTest = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.testCard, { backgroundColor: card, borderColor: border }]}
      onPress={() => {
        if (isAdmin) {
          navigation.navigate('AdminManageTest', { testId: item._id, testName: item.name, difficulty });
        } else {
          navigation.navigate('TestSetup', {
            testId: item._id,
            testName: item.name,
            questionCount: item.questionCount || 0,
            difficulty,
          });
        }
      }}
    >
      <View style={styles.testCardLeft}>
        <LinearGradient colors={cfg.colors} style={styles.testIconBox}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#fff" />
        </LinearGradient>
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={[styles.testName, { color: text }]}>{item.name}</Text>
          <Text style={[styles.testMeta, { color: muted }]}>
            {item.questionCount || 0} Questions · {label}
          </Text>
          {isAdmin && (
            <Text style={[styles.manageLabel, { color: cfg.colors[0] }]}>
              Tap to manage questions →
            </Text>
          )}
        </View>
      </View>
      <View style={styles.testActions}>
        {isAdmin ? (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: cfg.colors[0] + '20' }]}
              onPress={(e) => { e.stopPropagation?.(); openEditModal(item); }}
            >
              <MaterialCommunityIcons name="pencil-outline" size={20} color={cfg.colors[0]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EF444420' }]}
              onPress={(e) => { e.stopPropagation?.(); handleDelete(item._id, item.name); }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.startBtn, { backgroundColor: cfg.colors[0] }]}>
            <Text style={styles.startBtnText}>Start</Text>
            <MaterialCommunityIcons name="play" size={14} color="#fff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <LinearGradient colors={cfg.colors} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 15, flex: 1 }}>
          <Text style={styles.headerTitle}>{label}</Text>
          <Text style={styles.headerSub}>{tests.length} TESTS AVAILABLE</Text>
        </View>
        <MaterialCommunityIcons name={cfg.icon} size={32} color="rgba(255,255,255,0.3)" />
      </LinearGradient>

      {isLoading ? (
        <ActivityIndicator size="large" color={cfg.colors[0]} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={tests}
          renderItem={renderTest}
          keyExtractor={(i) => i._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="clipboard-outline" size={70} color={border} />
              <Text style={[styles.emptyText, { color: muted }]}>No tests yet</Text>
              {isAdmin && <Text style={{ color: muted, fontSize: 13, marginTop: 4 }}>Tap + to create one</Text>}
            </View>
          )}
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: cfg.colors[0] }]}
          onPress={() => { setEditingTest(null); setTestName(''); setShowModal(true); }}
        >
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: text }]}>{editingTest ? 'Edit Test' : 'New Test'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={muted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: bg, color: text, borderColor: border }]}
              placeholder="Enter test name"
              placeholderTextColor={muted}
              value={testName}
              onChangeText={setTestName}
            />
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: cfg.colors[0], opacity: testName.trim() ? 1 : 0.5 }]}
              onPress={handleSave}
              disabled={!testName.trim()}
            >
              <Text style={styles.createBtnText}>{editingTest ? 'Update Test' : 'Create Test'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, paddingTop: 24, paddingBottom: 24,
    elevation: 6,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  list: { padding: 20, paddingBottom: 100 },
  testCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 14, elevation: 3,
  },
  testCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  testIconBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  testName: { fontSize: 16, fontWeight: '800' },
  testMeta: { fontSize: 12, marginTop: 3 },
  manageLabel: { fontSize: 11, fontWeight: '800', marginTop: 4, letterSpacing: 0.5 },
  testActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12,
  },
  startBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  fab: {
    position: 'absolute', bottom: 30, right: 25,
    width: 62, height: 62, borderRadius: 31,
    alignItems: 'center', justifyContent: 'center',
    elevation: 10,
  },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  input: { height: 54, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontSize: 15, marginBottom: 16 },
  createBtn: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  createBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});

export default TestListScreen;
