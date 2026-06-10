import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getBaseUrl } from '../utils/config';

const ImageViewerScreen = ({ route, navigation }) => {
  const { width, height } = useWindowDimensions();
  const { url, title } = route.params;
  const fullUrl = url.startsWith('http') ? url : `${getBaseUrl().replace('/api', '')}${url}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>

      <View style={styles.imageBox}>
          <Image 
            source={{ uri: fullUrl }} 
            style={[styles.image, { width: width, height: height * 0.8 }]} 
            resizeMode="contain" 
          />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    height: 70, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backBtn: { padding: 5, marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1 },
  imageBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: {},
});

export default ImageViewerScreen;
