import { View, Text, StyleSheet } from 'react-native';

export default function Search() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Search</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdfaf6' },
  text: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
});
