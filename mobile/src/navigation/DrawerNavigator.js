import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { logout } from '../redux/features/authSlice';
import { useLogoutMutation } from '../redux/apis/authApi';
import { COLORS, SPACING, RADIUS } from '../constants/config';
import { getBaseUrl } from '../utils/config';
import MainStackNavigator from './MainStackNavigator';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (e) {
      console.warn('Logout mutation failed', e);
    } finally {
      dispatch(logout());
    }
  };

  const profileImageUrl = user?.profileImage 
    ? `${getBaseUrl().replace('/api', '')}${user.profileImage}`
    : null;

  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#FFFFFF',
    divider: isDarkMode ? '#1E293B' : '#F1F5F9',
    footerBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    footerBorder: isDarkMode ? '#1E293B' : '#F1F5F9',
    logoutBg: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#FFF1F2',
    logoutBorder: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#FECACA',
    adminText: isDarkMode ? '#818CF8' : '#94A3B8',
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={[styles.drawerScroll, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={['#1E1B4B', '#312E81']}
        style={styles.drawerHeader}
      >
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => props.navigation.navigate('MainStack', { screen: 'Profile' })}
        >
           {profileImageUrl ? (
             <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
           ) : (
             <MaterialCommunityIcons name="account-circle" size={80} color="rgba(255,255,255,0.9)" />
           )}
           {user?.role === 'admin' && (
             <View style={styles.adminBadge}>
               <MaterialCommunityIcons name="shield-account" size={14} color="#fff" />
             </View>
           )}
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.name || 'Authorized Student'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'Student Account'}</Text>
        <View style={[styles.badge, user?.isPro ? styles.proBadge : styles.freeBadge]}>
           <Text style={styles.badgeText}>{user?.isPro ? 'PREMIUM USER' : 'FREE ACCESS'}</Text>
        </View>
      </LinearGradient>

      <View style={styles.drawerItemsContainer}>
         <DrawerItem
           label="Subscription Plan"
           labelStyle={{ color: '#F59E0B', fontWeight: '900' }}
           icon={({ size }) => <MaterialCommunityIcons name="crown" color="#F59E0B" size={size} />}
           onPress={() => props.navigation.navigate('MainStack', { screen: 'Subscription' })}
           style={styles.premiumMenuItem}
         />
         <DrawerItemList {...props} />
         
           {user?.role === 'admin' ? (
             <>
               <View style={styles.adminSectionHeader}>
                 <Text style={[styles.adminSectionTitle, { color: themeColors.adminText }]}>ADMIN CONTROL</Text>
               </View>
               <DrawerItem
                 label="All Students"
                 icon={({ color, size }) => <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />}
                 onPress={() => props.navigation.navigate('MainStack', { screen: 'AdminStudents' })}
               />
               <DrawerItem
                 label="Paid Students"
                 icon={({ color, size }) => <MaterialCommunityIcons name="account-check-outline" color="#22C55E" size={size} />}
                 onPress={() => props.navigation.navigate('MainStack', { screen: 'AdminStudents', params: { filter: 'paid' } })}
               />
               <DrawerItem
                 label="Unpaid Students"
                 icon={({ color, size }) => <MaterialCommunityIcons name="account-off-outline" color="#EF4444" size={size} />}
                 onPress={() => props.navigation.navigate('MainStack', { screen: 'AdminStudents', params: { filter: 'unpaid' } })}
               />
               <DrawerItem
                 label="Overall Progress"
                 icon={({ color, size }) => <MaterialCommunityIcons name="chart-bell-curve-cumulative" color="#8B5CF6" size={size} />}
                 onPress={() => props.navigation.navigate('MainStack', { screen: 'AdminAnalytics' })}
               />
               <DrawerItem
                 label="Content Hub"
                 icon={({ color, size }) => <MaterialCommunityIcons name="database-edit-outline" color={color} size={size} />}
                 onPress={() => props.navigation.navigate('MainStack', { screen: 'Admin' })}
               />
               <DrawerItem
                 label="Contact Messages"
                 icon={({ color, size }) => <MaterialCommunityIcons name="email-multiple-outline" color="#3B82F6" size={size} />}
                 onPress={() => props.navigation.navigate('MainStack', { screen: 'AdminContacts' })}
               />
             </>
           ) : (
             <>
               <DrawerItem
                 label="Your Progress"
                 icon={({ color, size }) => <MaterialCommunityIcons name="chart-line" color={color} size={size} />}
                 onPress={() => props.navigation.navigate('MainStack', { screen: 'Progress' })}
               />
               <DrawerItem
                 label="My Profile"
                 icon={({ color, size }) => <MaterialCommunityIcons name="account-outline" color={color} size={size} />}
                 onPress={() => props.navigation.navigate('MainStack', { screen: 'Profile' })}
               />
               <DrawerItem
                 label="Contact Support"
                 icon={({ color, size }) => <MaterialCommunityIcons name="email-outline" color={color} size={size} />}
                 onPress={() => props.navigation.navigate('MainStack', { screen: 'Contact' })}
               />
             </>
           )}
 
           <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />
           
           <DrawerItem
             label="About Us"
             icon={({ color, size }) => <MaterialCommunityIcons name="information-outline" color={color} size={size} />}
             onPress={() => props.navigation.navigate('MainStack', { screen: 'About' })}
           />
           <DrawerItem
             label="Terms & Conditions"
             icon={({ color, size }) => <MaterialCommunityIcons name="file-document-outline" color={color} size={size} />}
             onPress={() => props.navigation.navigate('MainStack', { screen: 'Terms' })}
           />
           <DrawerItem
             label="Change Password"
             icon={({ color, size }) => <MaterialCommunityIcons name="lock-reset" color={color} size={size} />}
             onPress={() => props.navigation.navigate('MainStack', { screen: 'ChangePassword' })}
           />
        </View>
 
       <View style={[styles.footer, { backgroundColor: themeColors.footerBg, borderTopColor: themeColors.footerBorder }]}>
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: themeColors.logoutBg, borderColor: themeColors.logoutBorder }]} onPress={handleLogout}>
             <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
             <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v1.0.0 (SpardhaPath)</Text>
       </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  const { isDarkMode } = useSelector((state) => state.theme);
  const themeColors = {
    background: isDarkMode ? '#0F172A' : '#FFFFFF',
    activeBg: isDarkMode ? '#4338CA25' : '#4338CA10',
    activeText: isDarkMode ? '#818CF8' : '#4338CA',
    inactiveText: isDarkMode ? '#94A3B8' : '#64748B',
  };

  return (
    <Drawer.Navigator
      initialRouteName="MainStack"
      drawerContent={(props) => <CustomDrawerContent {...props} isSubscribed={false} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: themeColors.activeBg,
        drawerActiveTintColor: themeColors.activeText,
        drawerInactiveTintColor: themeColors.inactiveText,
        drawerLabelStyle: {
           marginLeft: -10, // Fixed: Reduced negative margin to prevent overlap
           fontFamily: 'Outfit-SemiBold',
           fontSize: 15,
        },
        drawerItemStyle: {
           borderRadius: 16,
           marginHorizontal: 12,
           paddingHorizontal: 8,
        }
      }}
    >
      <Drawer.Screen
        name="MainStack"
        component={MainStackNavigator}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerScroll: {
     flexGrow: 1,
     backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    marginBottom: 10,
    elevation: 10,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    borderRadius:  global.RADIUS?.full || 20,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Outfit-Bold',
    color: '#FFFFFF',
    marginTop: 5,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
    fontFamily: 'Outfit-Medium',
  },
  badge: {
     paddingHorizontal: 14,
     paddingVertical: 6,
     borderRadius: 12,
     backgroundColor: 'rgba(255,255,255,0.15)',
     borderWidth: 1,
     borderColor: 'rgba(255,255,255,0.2)',
  },
  proBadge: {
     backgroundColor: 'rgba(245, 158, 11, 0.2)',
     borderColor: '#F59E0B',
  },
  freeBadge: {
     backgroundColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
     fontSize: 9,
     fontFamily: 'Outfit-Bold',
     color: '#fff',
     letterSpacing: 1,
  },
  drawerItemsContainer: {
     flex: 1,
     paddingTop: 10,
  },
  premiumMenuItem: {
     backgroundColor: 'rgba(245, 158, 11, 0.08)',
     borderWidth: 1,
     borderColor: 'rgba(245, 158, 11, 0.2)',
     marginBottom: 10,
  },
  footer: {
     padding: 20,
     borderTopWidth: 1,
     borderTopColor: '#F1F5F9',
     backgroundColor: '#F8FAFC',
  },
  logoutBtn: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#FFF1F2',
     padding: 14,
     borderRadius: 16,
     marginBottom: 15,
     borderWidth: 1,
     borderColor: '#FECACA',
  },
  logoutText: {
     marginLeft: 12,
     color: '#EF4444',
     fontFamily: 'Outfit-Bold',
     fontSize: 15,
  },
  adminSectionHeader: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 8,
  },
  adminSectionTitle: {
    fontSize: 11,
    fontFamily: 'Outfit-Bold',
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F1F5F9',
    marginVertical: 15,
    marginHorizontal: 20,
  },
  versionText: {
     fontSize: 11,
     color: '#94A3B8',
     textAlign: 'center',
     fontFamily: 'Outfit-Medium',
  }
});

export default DrawerNavigator;
