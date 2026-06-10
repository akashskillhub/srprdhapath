import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GenericModuleScreen = ({ route, navigation }) => {
  const { title } = route.params || { title: 'Module' };
  const { isDarkMode } = useSelector((state) => state.theme);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? "#fff" : "#333"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>{title}</Text>
      </View>

      <View style={styles.placeholder}>
        <MaterialCommunityIcons name="lightning-bolt-outline" size={100} color={isDarkMode ? "#1E293B" : "#F1F5F9"} style={{ position: 'absolute', top: 100 }} />
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="progress-clock" size={60} color="#3B82F6" />
        </View>
        <Text style={[styles.placeholderTitle, isDarkMode && styles.textDark]}>{title} Module</Text>
        <Text style={styles.placeholderSubtitle}>Our team is crafting a premium experience for this section.</Text>
        <TouchableOpacity 
            style={styles.btn}
            onPress={() => navigation.goBack()}
        >
            <Text style={styles.btnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Outfit-Bold',
    color: '#1E293B',
  },
  textDark: {
    color: '#fff',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  iconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#3B82F610',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 25,
  },
  placeholderTitle: {
    fontSize: 24,
    fontFamily: 'Outfit-Bold',
    color: '#1E293B',
    marginTop: 10,
  },
  placeholderSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Outfit-Medium',
  },
  btn: {
    marginTop: 35,
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    elevation: 4,
  },
  btnText: {
    color: '#fff',
    fontFamily: 'Outfit-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

export default GenericModuleScreen;
