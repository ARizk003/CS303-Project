import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking,
} from 'react-native';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.8:5000';

export default function Categories() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/books`)
      .then(res => setBooks(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(books.map(b => b.category))].sort();

  const filteredBooks = selectedCategory
    ? books.filter(b => b.category === selectedCategory)
    : [];

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
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => setSelectedCategory(item)}
                >
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
        renderItem={({ item }) => (
          <View style={styles.bookCard}>
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
            <TouchableOpacity
              style={styles.readBtn}
              onPress={() => Linking.openURL(item.pdfUrl)}
            >
              <Text style={styles.readBtnText}>Read</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfaf6', paddingHorizontal: 20, paddingTop: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdfaf6' },
  heading: { fontSize: 26, fontWeight: '900', color: '#2c3e50', marginBottom: 20 },
  empty: { color: '#8e7f68', textAlign: 'center', marginTop: 40 },

  list: { paddingBottom: 20 },
  row: { justifyContent: 'space-between' },

  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8dcc8',
    shadowColor: '#C5A059',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryIcon: { fontSize: 30, marginBottom: 8 },
  categoryName: { fontSize: 14, fontWeight: '700', color: '#2c3e50', textAlign: 'center', marginBottom: 4 },
  categoryCount: { fontSize: 12, color: '#C5A059', fontWeight: '600' },

  backBtn: { marginBottom: 12 },
  backText: { color: '#C5A059', fontWeight: '700', fontSize: 15 },

  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e8dcc8',
    elevation: 1,
  },
  bookInfo: { flex: 1, marginRight: 12 },
  bookTitle: { fontSize: 15, fontWeight: '700', color: '#2c3e50', marginBottom: 4 },
  bookAuthor: { fontSize: 13, color: '#8e7f68' },
  readBtn: {
    backgroundColor: '#C5A059',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 50,
  },
  readBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
