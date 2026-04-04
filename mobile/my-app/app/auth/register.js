import { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useContext(AuthContext);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const result = await signup({ username, email, password });
    if (result.success) {
      router.push('/dashboard');
    } else {
      Alert.alert('Error', result.msg);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.welcome}>Create{'\n'}Account.</Text>
      <Text style={styles.subtitle}>
        Join LEARNOVA and start your reading journey today.
      </Text>

      <View style={styles.tabRow}>
        <TouchableOpacity style={styles.tab} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>Register</Text>
        </View>
      </View>

      <Text style={styles.label}>USERNAME</Text>
      <TextInput
        style={styles.input}
        placeholder="your_username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

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

      <Text style={styles.label}>PASSWORD</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.socialBtn}>
        <Text style={styles.googleG}>G</Text>
        <Text style={styles.socialText}>Google</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfaf6' },
  content: { padding: 28, paddingTop: 40, paddingBottom: 40 },

  welcome: { fontSize: 42, fontWeight: '900', color: '#2c3e50', lineHeight: 50, marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#8e7f68', lineHeight: 22, marginBottom: 32 },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#ede8df',
    borderRadius: 50,
    padding: 4,
    marginBottom: 28,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 50, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 15, fontWeight: '600', color: '#8e7f68' },
  tabTextActive: { color: '#C5A059', fontWeight: '700' },

  label: { fontSize: 11, fontWeight: '800', color: '#8e7f68', letterSpacing: 1.5, marginBottom: 8 },

  input: {
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2c3e50',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  button: {
    backgroundColor: '#C5A059',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 28,
    shadowColor: '#C5A059',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0d8cc' },
  dividerText: { fontSize: 11, color: '#aaa', fontWeight: '700', letterSpacing: 1.5, marginHorizontal: 10 },

  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#e0d8cc',
  },
  googleG: { fontSize: 16, fontWeight: '900', color: '#C5A059', marginRight: 8 },
  socialText: { fontSize: 15, fontWeight: '600', color: '#2c3e50' },
});
