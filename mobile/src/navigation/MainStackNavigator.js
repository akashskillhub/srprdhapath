import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import PYQHubScreen from '../screens/PYQHubScreen';
import PracticeQuestionsScreen from '../screens/PracticeQuestionsScreen';
import NewsScreen from '../screens/NewsScreen';
import GenericModuleScreen from '../screens/GenericModuleScreen';
import AdminScreen from '../screens/AdminScreen';
import AdminManageQuestionsScreen from '../screens/AdminManageQuestionsScreen';
import AdminManageFoldersScreen from '../screens/AdminManageFoldersScreen';
import QuestionListScreen from '../screens/QuestionListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProgressScreen from '../screens/ProgressScreen';
import AdminStudentsScreen from '../screens/AdminStudentsScreen';
import AdminAnalyticsScreen from '../screens/AdminAnalyticsScreen';
// Short Tricks Screens
import AdminShortTricksCategoriesScreen from '../screens/AdminShortTricksCategoriesScreen';
import AdminShortTricksListScreen from '../screens/AdminShortTricksListScreen';
import AdminAddShortTrickScreen from '../screens/AdminAddShortTrickScreen';
import ShortTricksSubjectsScreen from '../screens/ShortTricksSubjectsScreen';
import ShortTricksListScreen from '../screens/ShortTricksListScreen';
import StateBoardFolderScreen from '../screens/StateBoardFolderScreen';
import StateBoardContentScreen from '../screens/StateBoardContentScreen';
import AdminAddMaterialScreen from '../screens/AdminAddMaterialScreen';
import PDFViewerScreen from '../screens/PDFViewerScreen';
import ImageViewerScreen from '../screens/ImageViewerScreen';
import SyllabusFolderScreen from '../screens/SyllabusFolderScreen';
import SyllabusContentScreen from '../screens/SyllabusContentScreen';
import YouTubeLinksFolderScreen from '../screens/YouTubeLinksFolderScreen';
import YouTubeLinksContentScreen from '../screens/YouTubeLinksContentScreen';
import QuestionPaperFolderScreen from '../screens/QuestionPaperFolderScreen';
import QuestionPaperContentScreen from '../screens/QuestionPaperContentScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TestSeriesScreen from '../screens/TestSeriesScreen';
import TestListScreen from '../screens/TestListScreen';
import TestSetupScreen from '../screens/TestSetupScreen';
import TestAttemptScreen from '../screens/TestAttemptScreen';
import AdminManageTestScreen from '../screens/AdminManageTestScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ContactScreen from '../screens/ContactScreen';
import AdminContactScreen from '../screens/AdminContactScreen';
import AboutScreen from '../screens/AboutScreen';
import TermsScreen from '../screens/TermsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import { COLORS } from '../constants/config';
import { useSelector } from 'react-redux';

const Stack = createNativeStackNavigator();

const MainStackNavigator = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const initialRoute = user?.role === 'admin' ? 'Admin' : 'Dashboard';

  const themeColors = {
    headerBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    primary: isDarkMode ? '#6366F1' : '#3B82F6',
  };

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: themeColors.headerBg,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: themeColors.text,
        },
        headerTintColor: themeColors.primary,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PYQHub" 
        component={PYQHubScreen} 
        options={{ title: 'PYQ Hub' }}
      />
      <Stack.Screen 
        name="PracticeQuestions" 
        component={PracticeQuestionsScreen} 
        options={{ title: 'Practice Questions' }}
      />
      <Stack.Screen 
        name="CurrentAffairs" 
        component={NewsScreen} 
        options={{ title: 'Current Affairs' }}
      />
      
      {/* Short Tricks Module */}
      <Stack.Screen name="ShortTricks" component={ShortTricksSubjectsScreen} />
      <Stack.Screen name="ShortTricksList" component={ShortTricksListScreen} />

      {/* State Board Module */}
      <Stack.Screen name="StateBoard" component={StateBoardFolderScreen} initialParams={{ title: 'State Board', level: 'class' }} />
      <Stack.Screen name="StateBoardFolders" component={StateBoardFolderScreen} />
      <Stack.Screen name="StateBoardContent" component={StateBoardContentScreen} />
      <Stack.Screen name="AdminAddMaterial" component={AdminAddMaterialScreen} />
      <Stack.Screen name="PDFViewer" component={PDFViewerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ImageViewer" component={ImageViewerScreen} options={{ headerShown: false }} />
      {/* Test Series Module */}
      <Stack.Screen name="TestSeries" component={TestSeriesScreen} />
      <Stack.Screen name="TestList" component={TestListScreen} />
      <Stack.Screen name="TestSetup" component={TestSetupScreen} />
      <Stack.Screen name="TestAttempt" component={TestAttemptScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminManageTest" component={AdminManageTestScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Syllabus" component={SyllabusFolderScreen} initialParams={{ title: 'Syllabus', level: 'group' }} />
      <Stack.Screen name="SyllabusFolder" component={SyllabusFolderScreen} />
      <Stack.Screen name="SyllabusContent" component={SyllabusContentScreen} />
      <Stack.Screen name="QuestionPaper" component={QuestionPaperFolderScreen} initialParams={{ title: 'Question Paper', level: 'group' }} />
      <Stack.Screen name="QuestionPaperFolders" component={QuestionPaperFolderScreen} />
      <Stack.Screen name="QuestionPaperContent" component={QuestionPaperContentScreen} />
      <Stack.Screen name="YouTubeLinks" component={YouTubeLinksFolderScreen} initialParams={{ title: 'Important Links', level: 'root' }} />
      <Stack.Screen name="YouTubeLinksFolder" component={YouTubeLinksFolderScreen} />
      <Stack.Screen name="YouTubeLinksContent" component={YouTubeLinksContentScreen} />
      
      <Stack.Screen 
        name="Admin" 
        component={AdminScreen} 
        options={{ title: 'Admin Panel' }}
      />

      {/* Admin Short Tricks */}
      <Stack.Screen name="AdminShortTricks" component={AdminShortTricksCategoriesScreen} />
      <Stack.Screen name="AdminShortTricksList" component={AdminShortTricksListScreen} />
      <Stack.Screen name="AdminAddShortTrick" component={AdminAddShortTrickScreen} />
      <Stack.Screen 
        name="AdminManageQuestions" 
        component={AdminManageQuestionsScreen} 
        options={{ title: 'Manage Questions' }}
      />
      <Stack.Screen 
        name="AdminManageFolders" 
        component={AdminManageFoldersScreen} 
        options={{ title: 'Manage Folders' }}
      />
      <Stack.Screen 
        name="QuestionList" 
        component={QuestionListScreen} 
        options={({ route }) => ({ title: route.params?.title || 'Questions' })}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Progress" 
        component={ProgressScreen} 
        options={{ title: 'Your Progress' }}
      />
      <Stack.Screen 
        name="AdminStudents" 
        component={AdminStudentsScreen} 
        options={{ title: 'Student Management' }}
      />
      <Stack.Screen 
        name="AdminAnalytics" 
        component={AdminAnalyticsScreen} 
        options={{ title: 'Overall Performance' }}
      />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="AdminContacts" component={AdminContactScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
