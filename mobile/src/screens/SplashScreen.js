import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar, Image } from 'react-native';
import { COLORS } from '../constants/config';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(20);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#1E1B4B', '#312E81']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background Decorative Circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <Animated.View style={[styles.content, { 
          opacity: fadeAnim, 
          transform: [{ translateY }, { scale: scaleAnim }] 
        }]}>
          <View style={styles.brandIconContainer}>
             <View style={styles.innerIcon}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={{ width: 80, height: 80, borderRadius: 22 }}
                  resizeMode="contain"
                />
             </View>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>SpardhaPath</Text>
            <Text style={styles.marathiTitle}>स्पर्धापथ</Text>
          </View>

          <View style={styles.divider} />
          
          <Text style={styles.tagline}>MPSC | UPSC | COMPETITION</Text>
          
          <View style={styles.loadingContainer}>
             <Animated.View style={[styles.loadingProgress]} />
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  brandIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 30,
  },
  innerIcon: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoEmoji: { fontSize: 40 },
  textContainer: { alignItems: 'center' },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    fontFamily: 'NotoSansDevanagari_700Bold',
  },
  marathiTitle: {
    fontSize: 28,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: -5,
    fontFamily: 'NotoSansDevanagari_400Regular',
    letterSpacing: 2,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginVertical: 25,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '700',
    letterSpacing: 4,
  },
  loadingContainer: {
    width: 150,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginTop: 50,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '40%',
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 10,
  }
});

export default SplashScreen;
