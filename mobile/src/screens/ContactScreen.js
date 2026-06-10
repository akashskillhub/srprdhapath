import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useSubmitContactQueryMutation } from '../redux/apis/studentApi';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, FONTS } from '../constants/config';
import { LinearGradient } from 'expo-linear-gradient';

const ContactScreen = ({ navigation }) => {
  const { isDarkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const [submitQuery, { isLoading }] = useSubmitContactQueryMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [focusName, setFocusName] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusMessage, setFocusMessage] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card = isDarkMode ? '#1E293B' : '#FFFFFF';
  const text = isDarkMode ? '#F8FAFC' : '#1E293B';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';
  const border = isDarkMode ? '#334155' : '#E2E8F0';
  const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill out all the input fields' });
      return;
    }
    try {
      await submitQuery({ name, email, message, userId: user?.id || null }).unwrap();
      Toast.show({ type: 'success', text1: 'Message Sent', text2: 'Thank you! We will get back to you shortly.' });
      setMessage('');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to Send', text2: err.data?.message || 'Could not send message.' });
    }
  };

  const handleEmailPress = () => Linking.openURL('mailto:mpscspardhapath@gmail.com?subject=Support Request');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: isDarkMode ? '#33415540' : '#E2E8F060', borderColor: border }]}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Contact Support</Text>
        <View style={{ width: 42 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoRow}>
            <TouchableOpacity style={[styles.infoCard, { backgroundColor: card, borderColor: border, width: '100%' }]} onPress={handleEmailPress}>
              <View style={[styles.infoIconBox, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                <MaterialCommunityIcons name="email" size={22} color="#4F46E5" />
              </View>
              <Text style={[styles.infoLabel, { color: text }]}>Write Email</Text>
              <Text style={[styles.infoValue, { color: muted }]}>mpscspardhapath@gmail.com</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.formCard, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.formTitle, { color: text }]}>Send Us A Message</Text>
            <Text style={[styles.formSubtitle, { color: muted }]}>Have queries, bug reports, or partnership suggestions? Submit below.</Text>

            <Text style={[styles.inputLabel, { color: text }]}>Full Name</Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: focusName ? COLORS.primary : border, borderWidth: focusName ? 2 : 1 }]}>
              <MaterialCommunityIcons name="account-outline" size={20} color={focusName ? COLORS.primary : muted} style={styles.inputIcon} />
              <TextInput placeholder="Enter your name" placeholderTextColor={muted} value={name} onChangeText={setName} onFocus={() => setFocusName(true)} onBlur={() => setFocusName(false)} style={[styles.textInput, { color: text }]} />
            </View>

            <Text style={[styles.inputLabel, { color: text, marginTop: 20 }]}>Email Address</Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: focusEmail ? COLORS.primary : border, borderWidth: focusEmail ? 2 : 1 }]}>
              <MaterialCommunityIcons name="email-outline" size={20} color={focusEmail ? COLORS.primary : muted} style={styles.inputIcon} />
              <TextInput placeholder="Enter your email" placeholderTextColor={muted} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)} style={[styles.textInput, { color: text }]} />
            </View>

            <Text style={[styles.inputLabel, { color: text, marginTop: 20 }]}>Message / Feedback</Text>
            <View style={[styles.messageInputWrapper, { backgroundColor: inputBg, borderColor: focusMessage ? COLORS.primary : border, borderWidth: focusMessage ? 2 : 1 }]}>
              <TextInput placeholder="Describe your issue..." placeholderTextColor={muted} multiline numberOfLines={6} value={message} onChangeText={setMessage} onFocus={() => setFocusMessage(true)} onBlur={() => setFocusMessage(false)} style={[styles.messageTextInput, { color: text }]} />
            </View>

            <TouchableOpacity style={styles.submitBtnContainer} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.85}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              {isLoading ? <ActivityIndicator size="small" color="#fff" /> : (
                <View style={styles.btnContent}>
                  <MaterialCommunityIcons name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Send Message</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ... keep your existing styles object here (no changes needed)

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
  scroll: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    width: '48%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  infoValue: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  formSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.regular,
    height: '100%',
  },
  messageInputWrapper: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 130,
  },
  messageTextInput: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlignVertical: 'top',
    height: '100%',
  },
  submitBtnContainer: {
    height: 56,
    width: '100%',
    borderRadius: 16,
    marginTop: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});

export default ContactScreen;
