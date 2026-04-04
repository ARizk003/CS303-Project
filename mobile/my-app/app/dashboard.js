import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.welcome}>Welcome, {user?.username || 'User'}!</Text>
        <Text style={styles.info}>Email: {user?.email}</Text>
        <Text style={styles.info}>Role: {user?.role || 'user'}</Text>
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
});
