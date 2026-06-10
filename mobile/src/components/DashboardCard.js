import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING } from '../constants/config';

import { useSelector } from 'react-redux';

const DashboardCard = ({ item, onPress }) => {
  const { isDarkMode } = useSelector((state) => state.theme);
  const { width } = useWindowDimensions();
  const COLUMN_COUNT = 3;
  const CARD_MARGIN = 8;
  const CARD_WIDTH = (width - SPACING.lg * 2 - CARD_MARGIN * (COLUMN_COUNT - 1) * 2) / COLUMN_COUNT;

  const themeColors = {
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    iconBg: isDarkMode ? '#334155' : '#F1F5F9',
  };

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer, 
        { 
          width: CARD_WIDTH,
          height: CARD_WIDTH * 1.2,
          backgroundColor: themeColors.card,
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: isDarkMode ? '#334155' : 'transparent',
        }
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={isDarkMode ? [item.color + '15', item.color + '05'] : ['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? item.color + '25' : themeColors.iconBg }]}>
          <MaterialCommunityIcons name={item.icon} size={30} color={item.color} />
        </View>
        <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={2}>
          {item.name || item.title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 10,
    marginHorizontal: 8,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  gradientCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default DashboardCard;
