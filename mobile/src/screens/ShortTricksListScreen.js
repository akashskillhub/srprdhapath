import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
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
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ShortTricksListScreen = ({ route, navigation }) => {
  const { subjectId, subjectName } = route.params;
  const { isDarkMode } = useSelector((state) => state.theme);

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    accent: isDarkMode ? '#F43F5E' : '#E11D48',
    glass: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
  };

  const { 
    data: tricks = [], 
    isLoading: loading 
  } = useGetShortTricksQuery(subjectId);

  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

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

  const renderTrickCard = ({ item, index }) => {
    const isLocked = !user?.isPro && index > 0 && !isAdmin;
    const imageUrl = item.image 
        ? `${getBaseUrl().replace('/api', '')}${item.image}`
        : null;

    return (
      <TouchableOpacity 
        disabled={!isLocked} 
        onPress={() => navigation.navigate('Subscription')}
        activeOpacity={0.9}
        style={[styles.trickCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
      >
        <View style={[styles.cardTypeBadge, { backgroundColor: isLocked ? '#94A3B8' : themeColors.accent }]}>
             <Text style={styles.cardTypeText}>{isLocked ? 'LOCKED' : `TRICK #${tricks.length - index}`}</Text>
        </View>

        <View style={styles.cardHeader}>
             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                   <Text style={[styles.trickTitle, { color: themeColors.text }]} numberOfLines={1}>{item.title}</Text>
                   {isLocked && <MaterialCommunityIcons name="crown" size={20} color="#F59E0B" style={{ marginLeft: 8 }} />}
                </View>
                {isAdmin && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('AdminAddShortTrick', { trick: item, subjectId })}>
                      <MaterialCommunityIcons name="pencil" size={20} color={themeColors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item._id)}>
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
             </View>
        </View>

        {imageUrl && (
            <View style={[styles.imageContainer, isLocked && { opacity: 0.3 }]}>
                <Image source={{ uri: imageUrl }} style={styles.trickImage} resizeMode="contain" />
                <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.4)']} 
                    style={styles.imageOverlay} 
                />
            </View>
        )}

        <View style={[styles.cardContent, isLocked && { opacity: 0.2 }]}>
          <Text style={[styles.trickText, { color: themeColors.text }]} numberOfLines={isLocked ? 2 : undefined}>
            {item.content}
          </Text>
        </View>

        {isLocked && (
            <View style={styles.lockOverlay}>
                <MaterialCommunityIcons name="lock" size={30} color={themeColors.text} />
                <Text style={[styles.lockText, { color: themeColors.text }]}>Subscribe to Unlock</Text>
            </View>
        )}

        <View style={[styles.cardFooter, { borderTopColor: themeColors.border }]}>
             <View style={styles.footerLeft}>
                <MaterialCommunityIcons name={isLocked ? "lock-outline" : "clock-outline"} size={14} color={themeColors.textMuted} />
                <Text style={[styles.footerText, { color: themeColors.textMuted }]}>
                    {isLocked ? 'Premium Only' : 'Read time: 1 min'}
                </Text>
             </View>
             {!isLocked && (
                 <TouchableOpacity style={styles.actionIcon}>
                    <MaterialCommunityIcons name="bookmark-outline" size={20} color={themeColors.accent} />
                 </TouchableOpacity>
             )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.transparentHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerBackBtn, { backgroundColor: themeColors.card }]}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitleText, { color: themeColors.text }]} numberOfLines={1}>{subjectName}</Text>
        <View style={{ width: 45 }} />
      </View>

      <FlatList
        data={tricks}
        renderItem={renderTrickCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
           <View style={styles.heroSection}>
              <LinearGradient
                colors={isDarkMode ? ['#312E81', '#1E1B4B'] : ['#4F46E5', '#312E81']}
                style={styles.heroBanner}
              >
                 <View style={styles.heroContent}>
                    <Text style={styles.heroSubject}>{subjectName}</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{tricks.length} Short Tricks Found</Text>
                    </View>
                 </View>
                 <MaterialCommunityIcons name="lightbulb-on" size={80} color="rgba(255,255,255,0.1)" style={styles.heroIcon} />
              </LinearGradient>
           </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
             {loading ? (
                <ActivityIndicator size="large" color={themeColors.accent} />
             ) : (
                <>
                <MaterialCommunityIcons name="book-open-blank-variant" size={80} color={isDarkMode ? "#1E293B" : "#E2E8F0"} />
                <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>Coming Soon!</Text>
                <Text style={[styles.emptySubText, { color: themeColors.textMuted }]}>Our educators are preparing tricks for this subject.</Text>
                </>
             )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  transparentHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 10,
  },
  headerBackBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Outfit-Bold',
    flex: 1,
    textAlign: 'center',
  },
  listContent: { paddingBottom: 50 },
  heroSection: { padding: 20 },
  heroBanner: {
    height: 140,
    borderRadius: 32,
    padding: 24,
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  heroContent: { zIndex: 2 },
  heroSubject: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  countBadge: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 10, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  countText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  heroIcon: { position: 'absolute', right: 20, bottom: 10 },
  trickCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 30,
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  cardTypeBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 5,
  },
  cardTypeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  cardHeader: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 15 },
  trickTitle: { fontSize: 22, fontWeight: '900', lineHeight: 28, maxWidth: '85%' },
  imageContainer: { width: '100%', height: 260, backgroundColor: '#fdfdfd' },
  trickImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  cardContent: { padding: 22 },
  trickText: { fontSize: 16, lineHeight: 26, fontFamily: 'Outfit-Medium' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, fontWeight: '600' },
  actionIcon: { padding: 5 },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    top: 60,
    bottom: 60,
  },
  lockText: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
    fontFamily: 'Outfit-Bold',
  },
  emptyBox: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { fontSize: 20, fontWeight: '900', marginTop: 15 },
  emptySubText: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});

export default ShortTricksListScreen;
