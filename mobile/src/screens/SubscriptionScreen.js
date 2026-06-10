import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '../redux/features/authSlice';
import { getBaseUrl } from '../utils/config';

const { width } = Dimensions.get('window');

const SubscriptionScreen = ({ navigation }) => {
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user, token } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animated values for the success overlay
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card = isDarkMode ? '#1E293B' : '#FFFFFF';
  const text = isDarkMode ? '#F8FAFC' : '#1E293B';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';
  const border = isDarkMode ? '#1E293B' : '#E2E8F0';

  const PLAN = {
    name: 'Premium Annual Access',
    price: '₹199',
    duration: 'per year',
    features: [
      'Unlock All Subjects & Courses',
      'Unlimited Practice MCQ Questions',
      'All Online Test Series Included',
      'State Board Repository Access',
      'Instant Short Tricks Unlocked',
      'Priority Customer Support',
    ]
  };

  const handleSubscribe = async () => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to subscribe.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${getBaseUrl()}/auth/subscribe-mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Save updated user to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        // Update Redux state
        dispatch(setUser({ user: data.user, token }));
        
        // Show success animation overlay
        setShowSuccess(true);
        Animated.parallel([
          Animated.spring(successScale, {
            toValue: 1,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(successOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ]).start();
      } else {
        Alert.alert('Error', data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Mock subscription error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={[styles.closeBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
        >
          <MaterialCommunityIcons name="close" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Subscription Plans</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner with crown */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#6366F1', '#4F46E5', '#3730A3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.glowCircle} />
            <View style={styles.crownBgIcon}>
              <MaterialCommunityIcons name="crown" size={100} color="rgba(255, 255, 255, 0.08)" />
            </View>
            <MaterialCommunityIcons name="crown" size={54} color="#F59E0B" style={styles.mainCrown} />
            <Text style={styles.heroTitle}>Upgrade to Pro</Text>
            <Text style={styles.heroSub}>Unlock full curriculum, test answers, explanation pages and learning progress tracking.</Text>
          </LinearGradient>
        </View>

        {/* Pricing Card */}
        <View style={[styles.planCard, { backgroundColor: card }]}>
          <View style={styles.popularBadge}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.badgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.popularBadgeText}>BEST VALUE</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: text }]}>{PLAN.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: text }]}>{PLAN.price}</Text>
              <Text style={[styles.duration, { color: muted }]}>{PLAN.duration}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: border }]} />

          <View style={styles.featuresList}>
            {PLAN.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureCheckCircle}>
                  <MaterialCommunityIcons name="check" size={14} color="#10B981" />
                </View>
                <Text style={[styles.featureText, { color: text }]}>{feature}</Text>
              </View>
            ))}
          </View>

          {user?.isPro ? (
            <View style={styles.alreadySubscribedBox}>
              <MaterialCommunityIcons name="check-decagram" size={24} color="#10B981" />
              <Text style={styles.alreadySubscribedText}>You are a Paid Student now!</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.subscribeBtn} 
              activeOpacity={0.85}
              onPress={handleSubscribe}
              disabled={loading}
            >
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                style={styles.subscribeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.subscribeBtnText}>Subscribe Now</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          <Text style={styles.termsText}>Secure 256-bit encrypted checkout</Text>
        </View>

        {/* Benefits section */}
        <View style={styles.benefitContainer}>
           <Text style={[styles.benefitTitle, { color: text }]}>Why Go Premium?</Text>
           <View style={styles.benefitGrid}>
              <View style={[styles.benefitBox, { backgroundColor: card, borderColor: border }]}>
                 <View style={[styles.benefitIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                   <MaterialCommunityIcons name="infinity" size={22} color="#3B82F6" />
                 </View>
                 <Text style={[styles.benefitBoxTitle, { color: text }]}>No Limits</Text>
                 <Text style={[styles.benefitBoxSub, { color: muted }]}>Access everything with zero usage bounds or locks.</Text>
              </View>
              <View style={[styles.benefitBox, { backgroundColor: card, borderColor: border }]}>
                 <View style={[styles.benefitIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                   <MaterialCommunityIcons name="lightning-bolt" size={22} color="#10B981" />
                 </View>
                 <Text style={[styles.benefitBoxTitle, { color: text }]}>Fast Prep</Text>
                 <Text style={[styles.benefitBoxSub, { color: muted }]}>Curated exam templates and tricks to save time.</Text>
              </View>
           </View>
        </View>
      </ScrollView>

      {/* SUCCESS SCREEN OVERLAY & ANIMATION */}
      {showSuccess && (
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.successCircle1} />
          <View style={styles.successCircle2} />
          
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successCrownContainer}>
              <MaterialCommunityIcons name="crown" size={48} color="#F59E0B" />
              <View style={styles.successCheckBadge}>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              </View>
            </View>
            
            <Text style={styles.successTitle}>Welcome to Pro!</Text>
            <Text style={styles.successSubtitle}>You are a Paid Student now</Text>
            
            <View style={styles.successDivider} />
            
            <Text style={styles.successDescription}>
              Congratulations! All study materials, chapters, MCQ practice question sets, and test exams are now completely unlocked.
            </Text>
            
            <TouchableOpacity 
              style={styles.successCloseBtn} 
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.successCloseBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.successCloseBtnText}>Let's Start Learning</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 25,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -40,
    right: -40,
  },
  crownBgIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.8,
  },
  mainCrown: {
    marginBottom: 8,
    elevation: 4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontSize: 13,
    paddingHorizontal: 10,
  },
  planCard: {
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  planName: {
    fontSize: 17,
    fontWeight: '900',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
  },
  duration: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B98115',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  subscribeBtn: {
    height: 54,
    borderRadius: 14,
    overflow: 'hidden',
  },
  subscribeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 12,
  },
  benefitContainer: {
    marginTop: 5,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 15,
  },
  benefitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  benefitBox: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  benefitIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  benefitBoxSub: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  alreadySubscribedBox: {
    flexDirection: 'row',
    height: 54,
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  alreadySubscribedText: {
    color: '#15803D',
    fontSize: 15,
    fontWeight: '800',
  },
  // Success Overlay Styles
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  successCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -50,
    left: -50,
  },
  successCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -100,
    right: -100,
  },
  successCard: {
    width: width * 0.86,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  successCrownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  successCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4F46E5',
    textAlign: 'center',
    marginTop: 4,
  },
  successDivider: {
    width: 50,
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 1.5,
    marginVertical: 18,
  },
  successDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successCloseBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  successCloseBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCloseBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default SubscriptionScreen;
