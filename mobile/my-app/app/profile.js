import { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => router.push('/auth/register')}>
          <Text style={styles.btnOutlineText}>Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(user.username || 'U')[0].toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{user.username}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.role}>{user.role || 'user'}</Text>

      {user.role === 'admin' && (
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/admin-dashboard')}>
          <Text style={styles.btnText}>Admin Dashboard</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={logout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdfaf6', padding: 30 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#C5A059', justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  avatarText: { fontSize: 34, fontWeight: 'bold', color: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 24 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  email: { fontSize: 14, color: '#8e7f68', marginBottom: 4 },
  role: { fontSize: 13, color: '#C5A059', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 28 },
  btn: {
    backgroundColor: '#C5A059', paddingVertical: 13, paddingHorizontal: 40,
    borderRadius: 50, marginTop: 12, width: '100%', alignItems: 'center',
  },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#C5A059' },
  btnDanger: { backgroundColor: '#dc3545' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  btnOutlineText: { color: '#C5A059', fontWeight: 'bold', fontSize: 15 },
});
