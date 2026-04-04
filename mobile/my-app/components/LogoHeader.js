import { View, Image, Text, StyleSheet } from 'react-native';

export default function LogoHeader() {
  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/LEARNOVA.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.textWrap}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.learn}>LEARN</Text>
          <Text style={styles.ova}>OVA</Text>
        </View>
        <Text style={styles.sub}>PREMIUM LIBRARY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdfaf6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#C5A059',
  },
  logo: {
    width: 50,
    height: 34,
    marginRight: 10,
  },
  textWrap: {
    borderLeftWidth: 2,
    borderLeftColor: '#C5A059',
    paddingLeft: 10,
  },
  learn: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  ova: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C5A059',
  },
  sub: {
    fontSize: 8,
    color: '#8e7f68',
    letterSpacing: 2,
    fontWeight: '800',
  },
});
