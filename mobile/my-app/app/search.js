import { useState, useEffect, useContext, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Modal, ScrollView, Alert, Linking,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PdfViewerModal from '../components/PdfViewerModal';
import { BASE_URL } from '../config/api';



function Stars({ value }) {
  return (
    <View style={styles.starsRow}>
      {[1,2,3,4,5].map(s => (
        <Text key={s} style={[styles.star, s <= Math.round(value || 0) && styles.starFilled]}>
          {s <= Math.round(value || 0) ? '★' : '☆'}
        </Text>
      ))}
      {value > 0 && <Text style={styles.ratingMeta}>{value}</Text>}
    </View>
  );
}

function TagChips({ tags }) {
  if (!tags?.length) return null;
  return (
    <View style={styles.tagsRow}>
      {tags.map(t => (
        <View key={t._id} style={styles.tagChip}>
          <Text style={styles.tagText}>#{t.name}</Text>
        </View>
      ))}
    </View>
  );
}

function Pill({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function Search() {
  const { user } = useContext(AuthContext);

  const [books, setBooks]           = useState([]);
  const [ratings, setRatings]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState('');
  const [activeAuthors, setActiveAuthors] = useState([]);
  const [activeTags, setActiveTags]       = useState([]);
  const [showFilters, setShowFilters]     = useState(false);
  const [pdfBook, setPdfBook]             = useState(null);

  useEffect(() => { fetchBooks(); }, []);
  useEffect(() => { if (books.length) fetchRatings(books); }, [user, books.length]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/books`);
      setBooks(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchRatings = async (list) => {
    const headers = user?.token ? { 'x-auth-token': user.token } : {};
    const results = await Promise.allSettled(
      list.map(b => axios.get(`${BASE_URL}/api/books/${b._id}/rating`, { headers }))
    );
    const map = {};
    results.forEach((r, i) => { if (r.status === 'fulfilled') map[list[i]._id] = r.value.data; });
    setRatings(map);
  };

  const allAuthors = useMemo(() => [...new Set(books.map(b => b.author))].sort(), [books]);
  const allTags    = useMemo(() => {
    const map = {};
    books.forEach(b => b.tags?.forEach(t => { map[t._id] = t; }));
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [books]);

  const toggleAuthor = (a) =>
    setActiveAuthors(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const toggleTag = (id) =>
    setActiveTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const clearFilters = () => { setActiveAuthors([]); setActiveTags([]); };

  const filtered = useMemo(() => {
    let result = books;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(q));
    }
    if (activeAuthors.length)
      result = result.filter(b => activeAuthors.includes(b.author));
    if (activeTags.length)
      result = result.filter(b => b.tags?.some(t => activeTags.includes(t._id)));
    return result;
  }, [books, query, activeAuthors, activeTags]);

  const activeFilterCount = activeAuthors.length + activeTags.length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  return (
    <View style={styles.container}>


      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books by title…"
            placeholderTextColor="#b0a090"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterBtnIcon}>⚙</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.resultsCount}>
        {filtered.length} book{filtered.length !== 1 ? 's' : ''} found
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={b => b._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No books match your search.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const r = ratings[item._id] || { average_rating: 0 };
          return (
            <View style={styles.bookCard}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
              <TagChips tags={item.tags} />
              <Stars value={r.average_rating} />
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
                <Text style={styles.readBtnText}>Explore Now</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <Modal visible={showFilters} animationType="slide" transparent onRequestClose={() => setShowFilters(false)}>
        <View style={styles.filterOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFilters}>Clear all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSection}>By Author</Text>
              <View style={styles.pillsWrap}>
                {allAuthors.map(a => (
                  <Pill key={a} label={a} active={activeAuthors.includes(a)} onPress={() => toggleAuthor(a)} />
                ))}
              </View>

              <Text style={styles.filterSection}>By Tag</Text>
              <View style={styles.pillsWrap}>
                {allTags.map(t => (
                  <Pill key={t._id} label={`#${t.name}`} active={activeTags.includes(t._id)} onPress={() => toggleTag(t._id)} />
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyBtnText}>Show {filtered.length} result{filtered.length !== 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <PdfViewerModal
        book={pdfBook}
        token={user?.token}
        isAdmin={user?.role === 'admin'}
        onClose={() => setPdfBook(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fdfaf6', paddingHorizontal: 16, paddingTop: 20 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText:    { color: '#8e7f68', fontSize: 15 },

  searchRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  searchBox:    {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#e8dcc8',
    shadowColor: '#C5A059', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  searchIcon:   { fontSize: 16, marginRight: 8 },
  searchInput:  { flex: 1, fontSize: 14, color: '#2c3e50' },
  clearBtn:     { fontSize: 14, color: '#b0a090', paddingLeft: 6 },

  filterBtn: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e8dcc8', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#C5A059', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  filterBtnActive:  { backgroundColor: '#C5A059', borderColor: '#C5A059' },
  filterBtnIcon:    { fontSize: 18 },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#2c3e50', borderRadius: 10,
    width: 18, height: 18, justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  resultsCount: { fontSize: 12, color: '#8e7f68', fontWeight: '600', marginBottom: 12 },

  list:       { paddingBottom: 24 },
  bookCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#e8dcc8', elevation: 1,
  },
  bookTitle:  { fontSize: 15, fontWeight: '800', color: '#2c3e50', marginBottom: 3 },
  bookAuthor: { fontSize: 13, color: '#8e7f68', marginBottom: 8 },

  tagsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tagChip:    { backgroundColor: '#f0e8d5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText:    { fontSize: 11, color: '#C5A059', fontWeight: '700' },

  starsRow:   { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 12 },
  star:       { fontSize: 18, color: '#d4c4a8' },
  starFilled: { color: '#C5A059' },
  ratingMeta: { fontSize: 12, color: '#8e7f68', fontWeight: '600', marginLeft: 4 },

  readBtn: {
    backgroundColor: '#C5A059', paddingVertical: 8, paddingHorizontal: 20,
    borderRadius: 50, alignSelf: 'flex-start',
  },
  readBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  filterOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  filterSheet: {
    backgroundColor: '#fdfaf6', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '80%',
  },
  filterHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterTitle:   { fontSize: 18, fontWeight: '900', color: '#2c3e50' },
  clearFilters:  { fontSize: 13, color: '#C5A059', fontWeight: '700' },
  filterSection: { fontSize: 13, fontWeight: '800', color: '#2c3e50', marginBottom: 10, marginTop: 4 },
  pillsWrap:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },

  pill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8dcc8',
  },
  pillActive:     { backgroundColor: '#C5A059', borderColor: '#C5A059' },
  pillText:       { fontSize: 13, color: '#2c3e50', fontWeight: '600' },
  pillTextActive: { color: '#fff', fontWeight: '700' },

  applyBtn: {
    backgroundColor: '#2c3e50', borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  pdfContainer: { flex: 1, backgroundColor: '#fdfaf6' },
  pdfHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e8dcc8', gap: 12,
  },
  pdfBackBtn:  { paddingVertical: 4, paddingHorizontal: 2 },
  pdfBackText: { color: '#C5A059', fontWeight: '700', fontSize: 15 },
  pdfTitle:    { flex: 1, fontSize: 15, fontWeight: '700', color: '#2c3e50' },
  pdfLoading: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'center',
    alignItems: 'center', backgroundColor: 'rgba(253,250,246,0.85)', gap: 12,
  },
  pdfLoadingText: { color: '#8e7f68', fontSize: 14, fontWeight: '600' },
});
