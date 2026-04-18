import { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Modal,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PdfViewerModal from '../components/PdfViewerModal';

const BASE_URL = 'http://192.168.1.8:5000';

function StarRating({ bookId, initialRating, initialAvg, initialCount, token, onRated }) {
  const [userRating, setUserRating]   = useState(initialRating);
  const [avgRating, setAvgRating]     = useState(initialAvg);
  const [ratingCount, setRatingCount] = useState(initialCount);
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => { setUserRating(initialRating); }, [initialRating]);
  useEffect(() => { setAvgRating(initialAvg); },    [initialAvg]);
  useEffect(() => { setRatingCount(initialCount); }, [initialCount]);

  const handleRate = useCallback(async (star) => {
    if (!token) {
      Alert.alert('Login required', 'Please log in to rate books.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/books/${bookId}/rate`,
        { rating: star },
        { headers: { 'x-auth-token': token } }
      );
      setUserRating(res.data.your_rating);
      setAvgRating(res.data.average_rating);
      setRatingCount(res.data.ratings_count);
      onRated?.(bookId, {
        user_rating: res.data.your_rating,
        average_rating: res.data.average_rating,
        ratings_count: res.data.ratings_count,
      });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Could not submit rating.');
    } finally {
      setSubmitting(false);
    }
  }, [bookId, token, submitting]);

  return (
    <View style={styles.ratingRow}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => handleRate(star)} disabled={submitting}>
            <Text style={[styles.star, star <= (userRating || 0) && styles.starFilled]}>
              {star <= (userRating || 0) ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingMeta}>
        {avgRating > 0 ? `${avgRating} (${ratingCount})` : 'No ratings yet'}
      </Text>
    </View>
  );
}

function TagChips({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <View style={styles.tagsRow}>
      {tags.map(tag => (
        <View key={tag._id} style={styles.tagChip}>
          <Text style={styles.tagText}>#{tag.name}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Categories() {
  const { user } = useContext(AuthContext);
  const [books, setBooks]                       = useState([]);
  const [ratings, setRatings]                   = useState({});
  const [loading, setLoading]                   = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pdfBook, setPdfBook]                   = useState(null); 

  const handleRated = useCallback((bookId, data) => {
    setRatings(prev => ({ ...prev, [bookId]: data }));
  }, []);

  useEffect(() => { fetchBooks(); }, []);

  useEffect(() => {
    if (books.length > 0) fetchRatings(books);
  }, [user, books.length]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/books`);
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async (bookList) => {
    const token = user?.token || null;
    const headers = token ? { 'x-auth-token': token } : {};
    const results = await Promise.allSettled(
      bookList.map(b => axios.get(`${BASE_URL}/api/books/${b._id}/rating`, { headers }))
    );
    const map = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') map[bookList[i]._id] = r.value.data;
    });
    setRatings(map);
  };

  const categories    = [...new Set(books.map(b => b.category))].sort();
  const filteredBooks = selectedCategory ? books.filter(b => b.category === selectedCategory) : [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  if (!selectedCategory) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Categories</Text>
        {categories.length === 0 ? (
          <Text style={styles.empty}>No categories found.</Text>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={item => item}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const count = books.filter(b => b.category === item).length;
              return (
                <TouchableOpacity style={styles.categoryCard} onPress={() => setSelectedCategory(item)}>
                  <Text style={styles.categoryIcon}>📂</Text>
                  <Text style={styles.categoryName}>{item}</Text>
                  <Text style={styles.categoryCount}>{count} book{count !== 1 ? 's' : ''}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedCategory(null)}>
        <Text style={styles.backText}>← Categories</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>{selectedCategory}</Text>

      <FlatList
        data={filteredBooks}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const r = ratings[item._id] || { average_rating: 0, ratings_count: 0, user_rating: null };
          return (
            <View style={styles.bookCard}>
              <View style={styles.bookHeader}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>
              </View>
              <TagChips tags={item.tags} />
              <StarRating
                bookId={item._id}
                initialRating={r.user_rating}
                initialAvg={r.average_rating}
                initialCount={r.ratings_count}
                token={user?.token}
                onRated={handleRated}
              />
              <TouchableOpacity
                style={styles.readBtn}
                onPress={() => {
                  if (!user?.token) {
                    Alert.alert('Login required', 'Please log in to read books.');
                    return;
                  }
                  setPdfBook(item);
                }}
              >
                <Text style={styles.readBtnText}>Read</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <PdfViewerModal
        book={pdfBook}
        token={user?.token}
        onClose={() => setPdfBook(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfaf6', paddingHorizontal: 20, paddingTop: 24 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdfaf6' },
  heading:   { fontSize: 26, fontWeight: '900', color: '#2c3e50', marginBottom: 20 },
  empty:     { color: '#8e7f68', textAlign: 'center', marginTop: 40 },
  list:      { paddingBottom: 20 },
  row:       { justifyContent: 'space-between' },

  categoryCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 14,
    width: '48%', alignItems: 'center', borderWidth: 1, borderColor: '#e8dcc8',
    shadowColor: '#C5A059', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  categoryIcon:  { fontSize: 30, marginBottom: 8 },
  categoryName:  { fontSize: 14, fontWeight: '700', color: '#2c3e50', textAlign: 'center', marginBottom: 4 },
  categoryCount: { fontSize: 12, color: '#C5A059', fontWeight: '600' },

  backBtn:  { marginBottom: 12 },
  backText: { color: '#C5A059', fontWeight: '700', fontSize: 15 },

  bookCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#e8dcc8', elevation: 1,
  },
  bookHeader: { marginBottom: 8 },
  bookTitle:  { fontSize: 15, fontWeight: '700', color: '#2c3e50', marginBottom: 3 },
  bookAuthor: { fontSize: 13, color: '#8e7f68' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tagChip: { backgroundColor: '#f0e8d5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 11, color: '#C5A059', fontWeight: '700' },

  ratingRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  starsRow:   { flexDirection: 'row', gap: 2 },
  star:       { fontSize: 22, color: '#d4c4a8' },
  starFilled: { color: '#C5A059' },
  ratingMeta: { fontSize: 12, color: '#8e7f68', fontWeight: '600' },

  readBtn: {
    backgroundColor: '#C5A059', paddingVertical: 9, paddingHorizontal: 20,
    borderRadius: 50, alignSelf: 'flex-start',
  },
  readBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  pdfContainer: { flex: 1, backgroundColor: '#fdfaf6' },
  pdfHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e8dcc8', gap: 12,
  },
  pdfBackBtn:      { paddingVertical: 4, paddingHorizontal: 2 },
  pdfBackText:     { color: '#C5A059', fontWeight: '700', fontSize: 15 },
  pdfTitle:        { flex: 1, fontSize: 15, fontWeight: '700', color: '#2c3e50' },
  pdfLoading: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'center',
    alignItems: 'center', backgroundColor: 'rgba(253,250,246,0.85)', gap: 12,
  },
  pdfLoadingText: { color: '#8e7f68', fontSize: 14, fontWeight: '600' },
  pdfError:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  pdfErrorText:   { fontSize: 16, fontWeight: '700', color: '#c0392b', marginBottom: 8 },
  pdfErrorSub:    { fontSize: 13, color: '#8e7f68', textAlign: 'center' },
});
