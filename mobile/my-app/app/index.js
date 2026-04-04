import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>

      <ImageBackground
        source={require('../assets/Homepage.jpg')}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Welcome to LEARNOVA</Text>
          <Text style={styles.heroSubtitle}>
            Discover thousands of books and expand your knowledge anytime.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.heroButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Why Choose LEARNOVA?</Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📚</Text>
          <Text style={styles.featureHeading}>Huge Library</Text>
          <Text style={styles.featureText}>
            Access a wide range of books from different categories.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🌐</Text>
          <Text style={styles.featureHeading}>Easy Access</Text>
          <Text style={styles.featureText}>
            Read books online anytime from anywhere.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>👤</Text>
          <Text style={styles.featureHeading}>Personal Account</Text>
          <Text style={styles.featureText}>
            Create your own account and manage your reading list.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfaf6',
  },
  hero: {
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  heroButton: {
    backgroundColor: '#C5A059',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 50,
  },
  heroButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  features: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8dcc8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureHeading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
