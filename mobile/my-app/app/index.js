import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const stats = [
  { value: '10,000+', label: 'Books Available' },
  { value: '50+',     label: 'Categories' },
  { value: '25,000+', label: 'Happy Readers' },
  { value: '100%',    label: 'Free to Browse' },
];

const features = [
  {
    icon: '📚',
    title: 'Huge Library',
    desc: 'Access a wide range of books from different categories — fiction, science, history, and more.',
  },
  {
    icon: '⚡',
    title: 'Easy Access',
    desc: 'Read books online anytime, anywhere, on any device — no downloads needed.',
  },
  {
    icon: '👤',
    title: 'Personal Account',
    desc: 'Create your account, track your reading progress, and manage your personal reading list.',
  },
  {
    icon: '🔖',
    title: 'Bookmarks',
    desc: 'Save your favourite pages and come back to them anytime.',
  },
  {
    icon: '🔍',
    title: 'Smart Search',
    desc: 'Find exactly what you\'re looking for by title, genre, or keyword.',
  },
];

const featured = [
  { title: 'Mathematics', genre: 'Math',    cover: 'https://covers.openlibrary.org/b/isbn/9780073383095-M.jpg' },
  { title: 'Physics',     genre: 'Physics', cover: 'https://covers.openlibrary.org/b/isbn/9780321909107-M.jpg' },
  { title: 'Chemistry',   genre: 'Science', cover: 'https://covers.openlibrary.org/b/isbn/9781305957404-M.jpg' },
  { title: 'Programming', genre: 'CS',      cover: 'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg' },
];

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>

      {/* Hero */}
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
          <Text style={styles.heroTagline}>
            Your personal digital library — read, bookmark, and grow.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/books')}
          >
            <Text style={styles.heroButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Why Choose LEARNOVA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose LEARNOVA?</Text>
        <Text style={styles.sectionSubtitle}>Everything you need for a great reading experience</Text>

        <View style={styles.featuresGrid}>
          {features.slice(0, 2).map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureHeading}>{f.title}</Text>
              <Text style={styles.featureText}>{f.desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.featuresGrid}>
          {features.slice(2, 4).map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureHeading}>{f.title}</Text>
              <Text style={styles.featureText}>{f.desc}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.featuresGrid, { justifyContent: 'center' }]}>
          {features.slice(4).map((f) => (
            <View key={f.title} style={[styles.featureCard, { maxWidth: '48%' }]}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureHeading}>{f.title}</Text>
              <Text style={styles.featureText}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Featured Books */}
      <View style={styles.featuredSection}>
        <View style={styles.featuredHeader}>
          <View>
            <Text style={styles.sectionTitle}>Featured Books</Text>
            <Text style={styles.sectionSubtitle}>Hand-picked reads to get you started</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/books')}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.booksGrid}>
          {featured.map((b) => (
            <TouchableOpacity key={b.title} style={styles.bookCard}>
              <Image
                source={{ uri: b.cover }}
                style={styles.bookCover}
              />
              <View style={styles.bookInfo}>
                <View style={styles.genreBadge}>
                  <Text style={styles.genreText}>{b.genre}</Text>
                </View>
                <Text style={styles.bookTitle}>{b.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Ready to Start Reading?</Text>
        <Text style={styles.ctaSubtitle}>
          Join LEARNOVA today for free and unlock access to thousands of books across every genre.
        </Text>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.ctaBtnText}>Create Free Account</Text>
        </TouchableOpacity>
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
    height: 420,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 22,
  },
  heroTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 22,
  },
  heroButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 13,
    paddingHorizontal: 36,
    borderRadius: 8,
  },
  heroButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 22,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textAlign: 'center',
  },

  section: {
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },

  featuredSection: {
    backgroundColor: '#f8fafc',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAll: {
    color: '#f59e0b',
    fontWeight: '600',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bookCard: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  bookCover: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  bookInfo: {
    padding: 10,
  },
  genreBadge: {
    backgroundColor: '#fef9c3',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: 6,
  },
  genreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
  },

  cta: {
    backgroundColor: '#1e293b',
    padding: 48,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 300,
  },
  ctaBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 13,
    paddingHorizontal: 36,
    borderRadius: 8,
  },
  ctaBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});