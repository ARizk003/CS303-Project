import { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking, Alert, Modal,
} from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = 'http://192.168.1.8:5000';

function PdfViewer({ url }) {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const pdfJsHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fdfaf6; }
    #viewer { width: 100vw; }
    canvas { display: block; width: 100% !important; height: auto !important; margin-bottom: 8px; }
    #error { color: #c0392b; text-align: center; padding: 40px 20px; font-family: sans-serif; }
    #loading { color: #8e7f68; text-align: center; padding: 40px 20px; font-family: sans-serif; }
  </style>
</head>
<body>
  <div id="loading">Rendering PDF…</div>
  <div id="viewer"></div>
  <div id="error" style="display:none"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const url = ${JSON.stringify(url)};
    const viewer = document.getElementById('viewer');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');

    pdfjsLib.getDocument({ url, withCredentials: false }).promise
      .then(pdf => {
        loadingEl.style.display = 'none';
        const renders = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          renders.push(
            pdf.getPage(i).then(page => {
              const viewport = page.getViewport({ scale: window.innerWidth / page.getViewport({ scale: 1 }).width });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              viewer.appendChild(canvas);
              return page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            })
          );
        }
        return renders.reduce((p, r) => p.then(() => r), Promise.resolve());
      })
      .catch(err => {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = 'Failed to load PDF: ' + (err.message || err);
      });
  </script>
</body>
</html>`;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ html: pdfJsHtml }}
        style={{ flex: 1 }}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        mixedContentMode="always"
      />
      {loading && (
        <View style={styles.pdfLoading}>
          <ActivityIndicator size="large" color="#C5A059" />
          <Text style={styles.pdfLoadingText}>Loading PDF…</Text>
        </View>
      )}
      {error && (
        <View style={styles.pdfError}>
          <Text style={styles.pdfErrorText}>Failed to load PDF</Text>
          <Text style={styles.pdfErrorSub}>Check your internet connection and try again.</Text>
        </View>
      )}
    </View>
  );
}

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
  const [pdfBook, setPdfBook]                   = useState(null); // { url, title }

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
                  const url = item.pdfUrl;
                  if (url?.toLowerCase().endsWith('.pdf')) {
                    setPdfBook({ url, title: item.title });
                  } else {
                    Linking.openURL(url);
                  }
                }}
              >
                <Text style={styles.readBtnText}>Read</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <Modal
        visible={!!pdfBook}
        animationType="slide"
        onRequestClose={() => setPdfBook(null)}
      >
        <View style={styles.pdfContainer}>
          <View style={styles.pdfHeader}>
            <TouchableOpacity onPress={() => setPdfBook(null)} style={styles.pdfBackBtn}>
              <Text style={styles.pdfBackText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.pdfTitle} numberOfLines={1}>{pdfBook?.title || 'Book'}</Text>
          </View>
          {pdfBook && <PdfViewer url={pdfBook.url} />}
        </View>
      </Modal>
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
