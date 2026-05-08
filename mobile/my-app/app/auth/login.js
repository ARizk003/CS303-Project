import { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';
import { BASE_URL } from '../../config/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotVisible, setForgotVisible] = useState(false);
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      await login(res.data.token, res.data.user);
      router.replace('/profile');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    if (!googleEmail.trim()) {
      Alert.alert('Error', 'Please enter your Google email');
      return;
    }
    setGoogleLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/google-login`, {
        email: googleEmail.trim(),
        username: googleName.trim() || googleEmail.split('@')[0],
      });
      await login(res.data.token, res.data.user);
      setGoogleModalVisible(false);
      router.replace('/profile');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const closeGoogleModal = () => {
    setGoogleModalVisible(false);
    setGoogleEmail('');
    setGoogleName('');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.welcome}>Welcome{'\n'}Back.</Text>
      <Text style={styles.subtitle}>
        Discover your next favorite chapter in our curated sanctuary of knowledge.
      </Text>

      <View style={styles.tabRow}>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>Login</Text>
        </View>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/auth/register')}>
          <Text style={styles.tabText}>Register</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>EMAIL ADDRESS</Text>
      <TextInput
        style={styles.input}
        placeholder="name@example.com"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.labelRow}>
        <Text style={styles.label}>PASSWORD</Text>
        <TouchableOpacity onPress={() => setForgotVisible(true)}>
          <Text style={styles.forgot}>Forgot?</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.socialBtn}
        onPress={() => setGoogleModalVisible(true)}
      >
        <Text style={styles.googleG}>G</Text>
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>

      <Modal
        visible={googleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeGoogleModal}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Continue with Google</Text>
            <Text style={styles.sheetSubtitle}>Enter your Google account details</Text>

            <Text style={styles.sheetLabel}>GOOGLE EMAIL</Text>
            <TextInput
              style={styles.sheetInput}
              placeholder="name@gmail.com"
              placeholderTextColor="#aaa"
              value={googleEmail}
              onChangeText={setGoogleEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />

            <Text style={styles.sheetLabel}>YOUR NAME (optional)</Text>
            <TextInput
              style={styles.sheetInput}
              placeholder="Your full name"
              placeholderTextColor="#aaa"
              value={googleName}
              onChangeText={setGoogleName}
            />

            <TouchableOpacity
              style={styles.sheetBtn}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.sheetBtnText}>Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={closeGoogleModal} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ForgotPasswordModal
        visible={forgotVisible}
        onClose={() => setForgotVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfaf6' },
  content: { padding: 28, paddingTop: 40, paddingBottom: 40 },

  welcome: { fontSize: 42, fontWeight: '900', color: '#2c3e50', lineHeight: 50, marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#8e7f68', lineHeight: 22, marginBottom: 32 },

  tabRow: {
    flexDirection: 'row', backgroundColor: '#ede8df',
    borderRadius: 50, padding: 4, marginBottom: 28,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 50, alignItems: 'center' },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  tabText: { fontSize: 15, fontWeight: '600', color: '#8e7f68' },
  tabTextActive: { color: '#C5A059', fontWeight: '700' },

  label: { fontSize: 11, fontWeight: '800', color: '#8e7f68', letterSpacing: 1.5, marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgot: { fontSize: 13, color: '#C5A059', fontWeight: '600' },

  input: {
    backgroundColor: '#fff', borderRadius: 50,
    paddingHorizontal: 20, paddingVertical: 14,
    fontSize: 15, color: '#2c3e50', marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },

  button: {
    backgroundColor: '#C5A059', borderRadius: 50,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 6, marginBottom: 28,
    shadowColor: '#C5A059', shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0d8cc' },
  dividerText: { fontSize: 11, color: '#aaa', fontWeight: '700', letterSpacing: 1.5, marginHorizontal: 10 },

  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 50, paddingVertical: 14,
    borderWidth: 1, borderColor: '#e0d8cc',
  },
  googleG: { fontSize: 16, fontWeight: '900', color: '#C5A059', marginRight: 8 },
  socialText: { fontSize: 15, fontWeight: '600', color: '#2c3e50' },

  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fdfaf6', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 40,
  },
  sheetTitle:    { fontSize: 22, fontWeight: '900', color: '#2c3e50', marginBottom: 6 },
  sheetSubtitle: { fontSize: 13, color: '#8e7f68', marginBottom: 24 },
  sheetLabel: {
    fontSize: 11, fontWeight: '800', color: '#8e7f68',
    letterSpacing: 1.5, marginBottom: 8,
  },
  sheetInput: {
    backgroundColor: '#fff', borderRadius: 50,
    paddingHorizontal: 20, paddingVertical: 14,
    fontSize: 15, color: '#2c3e50', marginBottom: 18,
    borderWidth: 1, borderColor: '#e0d8cc',
  },
  sheetBtn: {
    backgroundColor: '#C5A059', borderRadius: 50,
    paddingVertical: 15, alignItems: 'center', marginBottom: 12,
  },
  sheetBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelBtn:    { alignItems: 'center', marginTop: 4 },
  cancelText:   { color: '#aaa', fontSize: 14 },
});
