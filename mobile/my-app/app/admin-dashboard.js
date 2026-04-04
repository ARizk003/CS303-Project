import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.error}>Access Denied</Text>
          <Text style={styles.errorText}>You don't have admin privileges</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.welcome}>Welcome, Admin {user?.username}!</Text>
        <Text style={styles.info}>Manage your library system here</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#002147',
    marginBottom: 20,
  },
  welcome: {
    fontSize: 24,
    color: '#333',
    marginBottom: 15,
  },
  info: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  error: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
