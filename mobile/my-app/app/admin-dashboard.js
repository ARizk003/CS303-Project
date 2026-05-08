import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal, Image,
  Animated, Easing, RefreshControl, Platform
} from 'react-native';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../config/api';

const C = {
  ink:      '#1A1A2E',
  paper:    '#FAF7F2',
  cream:    '#F0EBE1',
  sienna:   '#C5622A',
  gold:     '#D4A843',
  sage:     '#5A7A5A',
  rust:     '#B84A3A',
  mist:     '#9BA8AB',
  border:   '#E0D8CE',
  white:    '#FFFFFF',
};

const Appear = ({ children, delay = 0, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

const Pill = ({ label, color = C.mist }) => (
  <View style={[s.pill, { backgroundColor: color + '22', borderColor: color + '55' }]}>
    <Text style={[s.pillText, { color }]}>{label}</Text>
  </View>
);

const pillColor = (type) => ({
  admin: C.sienna, user: C.sage, pending: C.gold, approved: C.sage, rejected: C.rust,
})[type] || C.mist;

const Divider = ({ text }) => (
  <View style={s.dividerRow}>
    <View style={s.dividerLine} />
    <Text style={s.dividerText}>{text}</Text>
    <View style={s.dividerLine} />
  </View>
);

const Field = ({ label, value, onChangeText, placeholder, multiline, required }) => (
  <View style={s.fieldWrap}>
    <Text style={s.fieldLabel}>{label}{required && <Text style={{ color: C.rust }}> *</Text>}</Text>
    <TextInput
      style={[s.input, multiline && s.textarea]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.mist}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
    />
  </View>
);

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);

  const [newTagName, setNewTagName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const emptyBook = { title: '', author: '', category: '', description: '', authorBio: '', selectedTagIds: [] };
  const [newBook, setNewBook] = useState(emptyBook);
  

  const [newBookFile, setNewBookFile] = useState(null);
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [editCoverFile, setEditCoverFile] = useState(null);

  const token = user?.token;
  const headers = { 'x-auth-token': token };

 
  const fetchUsers = async () => {
    setLoading(true);
    try { const r = await axios.get(`${BASE_URL}/api/users`, { headers }); setUsers(r.data); }
    catch { Alert.alert('Error', 'Failed to fetch users'); }
    setLoading(false);
  };

  const fetchBooks = async () => {
    setLoading(true);
    try { const r = await axios.get(`${BASE_URL}/api/books`); setBooks(r.data); }
    catch { Alert.alert('Error', 'Failed to fetch books'); }
    setLoading(false);
  };

  const fetchAllTags = async () => {
    try { const r = await axios.get(`${BASE_URL}/api/tags`); setAllTags(r.data); }
    catch { console.error('Failed to fetch tags'); }
  };

  const fetchBorrowRequests = async () => {
    setLoading(true);
    try { const r = await axios.get(`${BASE_URL}/api/borrow`, { headers }); setBorrowRequests(r.data); }
    catch { Alert.alert('Error', 'Failed to fetch borrow requests'); }
    setLoading(false);
  };

  const fetchAll = async () => {
    await fetchAllTags();
    if (activeTab === 'users') await fetchUsers();
    else if (activeTab === 'books') await fetchBooks();
    else if (activeTab === 'borrow') await fetchBorrowRequests();
    else if (activeTab === 'tags') await fetchAllTags();
  };

  useEffect(() => { 
    if (user && user.role === 'admin') { fetchAll(); }
  }, [activeTab, user]);

  const onRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  
  const pickDocument = async (type) => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: type === 'pdf' ? 'application/pdf' : 'image/*',
        copyToCacheDirectory: true
      });
      
      if (!result.canceled) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType,
        };
        
        if (type === 'pdf') setNewBookFile(file);
        else if (type === 'cover') setNewCoverFile(file);
        else if (type === 'editCover') setEditCoverFile(file);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  //add new book
  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.category || !newBookFile) {
      Alert.alert('Missing Info', 'Please provide Title, Author, Category and the PDF file.'); 
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newBook.title);
      formData.append('author', newBook.author);
      formData.append('category', newBook.category);
      formData.append('description', newBook.description || '');
      formData.append('authorBio', newBook.authorBio || '');

    
      formData.append('pdf', {
        uri: newBookFile.uri,
        name: newBookFile.name,
        type: newBookFile.type || 'application/pdf',
      });

      if (newCoverFile) {
        formData.append('cover', {
          uri: newCoverFile.uri,
          name: newCoverFile.name,
          type: newCoverFile.type || 'image/jpeg',
        });
      }

      const res = await axios.post(`${BASE_URL}/api/books`, formData, {
        headers: { 
          ...headers, 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      if (newBook.selectedTagIds.length > 0) {
        await axios.post(`${BASE_URL}/api/books/${res.data._id}/tags`, { tag_ids: newBook.selectedTagIds }, { headers });
      }

      Alert.alert('Success', 'Book added successfully!');
      setShowAddModal(false);
      setNewBook(emptyBook);
      setNewBookFile(null);
      setNewCoverFile(null);
      fetchBooks();
    } catch (err) {
      console.log(err.response?.data);
      Alert.alert('Upload Error', err.response?.data?.msg || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

 
  const handleEditBook = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', selectedBook.title);
      formData.append('author', selectedBook.author);
      formData.append('category', selectedBook.category);
      formData.append('description', selectedBook.description || '');
      formData.append('authorBio', selectedBook.authorBio || '');

      if (editCoverFile) {
        formData.append('cover', {
          uri: editCoverFile.uri,
          name: editCoverFile.name,
          type: editCoverFile.type || 'image/jpeg',
        });
      }

      await axios.put(`${BASE_URL}/api/books/${selectedBook._id}`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });

      await axios.post(`${BASE_URL}/api/books/${selectedBook._id}/tags`, { tag_ids: selectedBook.selectedTagIds }, { headers });

      Alert.alert('Updated', 'Book updated successfully!');
      setShowEditModal(false);
      setSelectedBook(null);
      setEditCoverFile(null);
      fetchBooks();
    } catch (err) {
      Alert.alert('Error', 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // delete and other actionss
  const deleteUser = (id) => Alert.alert('Delete user?', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await axios.delete(`${BASE_URL}/api/users/${id}`, { headers }); fetchUsers(); }
      catch { Alert.alert('Error', 'Failed'); }
    }},
  ]);

  const deleteBook = (id) => Alert.alert('Delete book?', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await axios.delete(`${BASE_URL}/api/books/${id}`, { headers }); fetchBooks(); }
      catch { Alert.alert('Error', 'Failed'); }
    }},
  ]);

  const openEditModal = (book) => {
    const tagIds = Array.isArray(book.tags) ? book.tags.map(t => typeof t === 'object' ? t._id : t) : [];
    setSelectedBook({ ...book, selectedTagIds: tagIds, description: book.description || '', authorBio: book.authorBio || '' });
    setEditCoverFile(null);
    setShowEditModal(true);
  };

  const updateBorrowStatus = async (id, status) => {
    try {
      await axios.patch(`${BASE_URL}/api/borrow/${id}`, { status }, { headers });
      setBorrowRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch { Alert.alert('Error', 'Failed to update status'); }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await axios.post(`${BASE_URL}/api/tags`, { name: newTagName.trim() }, { headers });
      setNewTagName(''); fetchAllTags();
    } catch { Alert.alert('Error', 'Tag exists or error occurred'); }
  };

  const handleDeleteTag = (id) => Alert.alert('Delete tag?', '', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await axios.delete(`${BASE_URL}/api/tags/${id}`, { headers }); fetchAllTags(); }
      catch { Alert.alert('Error', 'Failed'); }
    }},
  ]);

  const handleLogout = () => Alert.alert('Log out?', '', [
    { text: 'Stay', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth/login'); }},
  ]);

  const tabs = [
    { key: 'users', label: 'Users', icon: '👤' },
    { key: 'books', label: 'Books', icon: '📚' },
    { key: 'tags',  label: 'Tags',  icon: '🏷' },
    { key: 'borrow',label: 'Borrow',icon: '📦' },
  ];

  const pendingCount = borrowRequests.filter(r => r.status === 'pending').length;

  return (
    <View style={s.root}>
      
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Admin Panel</Text>
          <Text style={s.headerSub}>Manage your library</Text>
        </View>
        <TouchableOpacity style={s.logoutPill} onPress={handleLogout}>
          <Text style={s.logoutPillText}>Log out</Text>
        </TouchableOpacity>
      </View>

      
      <View style={s.tabBar}>
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <TouchableOpacity key={t.key} style={[s.tab, active && s.tabActive]} onPress={() => setActiveTab(t.key)}>
              <Text style={s.tabIcon}>{t.icon}</Text>
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{t.label}</Text>
              {t.key === 'borrow' && pendingCount > 0 && (
                <View style={s.dot}><Text style={s.dotText}>{pendingCount}</Text></View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.sienna} />}
      >
        {activeTab === 'users' && (
          <View style={s.section}>
            <Text style={s.pageTitle}>Members</Text>
            {users.map((u, i) => (
              <Appear key={u._id} delay={i * 50}>
                <View style={s.card}>
                  <View style={s.row}>
                    <View style={[s.avatar, { backgroundColor: C.sienna + '22' }]}>
                      <Text style={[s.avatarLetter, { color: C.sienna }]}>{u.username?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.name}>{u.username}</Text>
                      <Text style={s.meta}>{u.email}</Text>
                    </View>
                    <Pill label={u.role} color={pillColor(u.role)} />
                  </View>
                  <TouchableOpacity style={s.ghostDanger} onPress={() => deleteUser(u._id)}>
                    <Text style={s.ghostDangerText}>Remove User</Text>
                  </TouchableOpacity>
                </View>
              </Appear>
            ))}
          </View>
        )}

        {activeTab === 'books' && (
          <View style={s.section}>
            <View style={[s.row, { justifyContent: 'space-between', marginBottom: 15 }]}>
                <Text style={s.pageTitle}>Collection</Text>
                <TouchableOpacity style={s.primaryBtn} onPress={() => setShowAddModal(true)}>
                  <Text style={s.primaryBtnText}>+ Add Book</Text>
                </TouchableOpacity>
            </View>
            {books.map((book, i) => (
              <Appear key={book._id} delay={i * 50}>
                <View style={s.card}>
                  <View style={s.row}>
                    <Image source={{ uri: book.coverImage || 'https://via.placeholder.com/50x70' }} style={s.cover} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.name}>{book.title}</Text>
                      <Text style={s.meta}>{book.author}</Text>
                    </View>
                  </View>
                  <View style={[s.row, { marginTop: 10, gap: 10 }]}>
                    <TouchableOpacity style={[s.outlineBtn, { flex: 1 }]} onPress={() => openEditModal(book)}>
                      <Text style={s.outlineBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.ghostDanger, { flex: 1, marginTop: 0 }]} onPress={() => deleteBook(book._id)}>
                      <Text style={s.ghostDangerText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Appear>
            ))}
          </View>
        )}

        {activeTab === 'tags' && (
           <View style={s.section}>
             <Text style={s.pageTitle}>Manage Tags</Text>
             <View style={[s.card, { flexDirection: 'row', gap: 10 }]}>
                <TextInput style={[s.input, { flex: 1 }]} placeholder="New tag name..." value={newTagName} onChangeText={setNewTagName} />
                <TouchableOpacity style={s.primaryBtn} onPress={handleCreateTag}>
                   <Text style={s.primaryBtnText}>Add</Text>
                </TouchableOpacity>
             </View>
             {allTags.map((tag) => (
                <View key={tag._id} style={s.tagLine}>
                  <Text style={s.tagName}># {tag.name}</Text>
                  <TouchableOpacity onPress={() => handleDeleteTag(tag._id)}><Text style={{color: C.rust}}>Delete</Text></TouchableOpacity>
                </View>
             ))}
           </View>
        )}

        {activeTab === 'borrow' && (
          <View style={s.section}>
            <Text style={s.pageTitle}>Borrow Requests</Text>
            {borrowRequests.map((req, i) => (
              <View key={req._id} style={s.card}>
                <Text style={s.name}>{req.book?.title}</Text>
                <Text style={s.meta}>Requested by: {req.user?.username}</Text>
                <View style={{ marginTop: 8 }}><Pill label={req.status} color={pillColor(req.status)} /></View>
                {req.status === 'pending' && (
                  <View style={[s.row, { marginTop: 15, gap: 10 }]}>
                    <TouchableOpacity style={[s.primaryBtn, { flex: 1, backgroundColor: C.sage }]} onPress={() => updateBorrowStatus(req._id, 'approved')}>
                      <Text style={s.primaryBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.primaryBtn, { flex: 1, backgroundColor: C.rust }]} onPress={() => updateBorrowStatus(req._id, 'rejected')}>
                      <Text style={s.primaryBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      
      <BookModal
        visible={showAddModal}
        title="Add New Book"
        book={newBook}
        setBook={setNewBook}
        allTags={allTags}
        onPickFile={() => pickDocument('pdf')}
        onPickCover={() => pickDocument('cover')}
        pdfFile={newBookFile}
        coverFile={newCoverFile}
        toggleTag={(id) => setNewBook(prev => ({
          ...prev, selectedTagIds: prev.selectedTagIds.includes(id) ? prev.selectedTagIds.filter(x => x !== id) : [...prev.selectedTagIds, id]
        }))}
        onSubmit={handleAddBook}
        onClose={() => setShowAddModal(false)}
        loading={loading}
      />

      {selectedBook && (
        <BookModal
          visible={showEditModal}
          title="Edit Book Details"
          book={selectedBook}
          setBook={setSelectedBook}
          allTags={allTags}
          onPickCover={() => pickDocument('editCover')}
          coverFile={editCoverFile}
          toggleTag={(id) => setSelectedBook(prev => ({
            ...prev, selectedTagIds: prev.selectedTagIds.includes(id) ? prev.selectedTagIds.filter(x => x !== id) : [...prev.selectedTagIds, id]
          }))}
          onSubmit={handleEditBook}
          onClose={() => setShowEditModal(false)}
          loading={loading}
          isEdit
        />
      )}
    </View>
  );
}

// modal Component 
function BookModal({ visible, title, book, setBook, allTags, toggleTag, onSubmit, onClose, onPickFile, onPickCover, pdfFile, coverFile, loading, isEdit }) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={s.modalRoot}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Text style={s.closeBtnText}>✕</Text></TouchableOpacity>
        </View>

        <ScrollView style={s.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
          <Divider text="Basic Information" />
          <Field label="Book Title" value={book.title} onChangeText={v => setBook({ ...book, title: v })} required />
          <Field label="Author Name" value={book.author} onChangeText={v => setBook({ ...book, author: v })} required />
          <Field label="Category" value={book.category} onChangeText={v => setBook({ ...book, category: v })} required />
          <Field label="Description" value={book.description} onChangeText={v => setBook({ ...book, description: v })} multiline />
          
          <Divider text="Media & Files" />
          {!isEdit && (
            <TouchableOpacity style={s.filePicker} onPress={onPickFile}>
               <Text style={s.filePickerText}>{pdfFile ? `📄 ${pdfFile.name}` : '📁 Select PDF Document *'}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={[s.filePicker, {marginTop: 10}]} onPress={onPickCover}>
             <Text style={s.filePickerText}>{coverFile ? `🖼️ ${coverFile.name}` : '🖼️ Select Cover Image'}</Text>
          </TouchableOpacity>

          <Divider text="Tags" />
          <View style={s.tagGrid}>
            {allTags.map(tag => (
              <TouchableOpacity
                key={tag._id}
                style={[s.tagToggle, book.selectedTagIds.includes(tag._id) && s.tagToggleActive]}
                onPress={() => toggleTag(tag._id)}
              >
                <Text style={[s.tagToggleText, book.selectedTagIds.includes(tag._id) && s.tagToggleTextActive]}>{tag.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>{isEdit ? 'Update Book' : 'Add Book'}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

// styles 
const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.paper },
  scroll:     { flex: 1 },
  section:    { padding: 16 },
  header:     { backgroundColor: C.ink, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle:{ color: C.white, fontSize: 24, fontWeight: '700' },
  headerSub:  { color: C.mist, fontSize: 12 },
  logoutPill: { borderWidth: 1, borderColor: C.mist + '55', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  logoutPillText: { color: C.mist, fontSize: 12 },
  tabBar:     { flexDirection: 'row', backgroundColor: C.ink },
  tab:        { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive:  { borderBottomWidth: 3, borderBottomColor: C.gold },
  tabIcon:    { fontSize: 18 },
  tabLabel:   { fontSize: 11, color: C.mist, marginTop: 4 },
  tabLabelActive: { color: C.gold, fontWeight: '700' },
  dot:        { position: 'absolute', top: 8, right: 12, backgroundColor: C.rust, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dotText:    { color: C.white, fontSize: 10, fontWeight: '700' },
  pageTitle:  { fontSize: 22, fontWeight: '800', color: C.ink, marginBottom: 15 },
  card:       { backgroundColor: C.white, borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity:0.1, shadowRadius:4 },
  row:        { flexDirection: 'row', alignItems: 'center' },
  avatar:     { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarLetter: { fontSize: 18, fontWeight: '700' },
  name:       { fontSize: 16, fontWeight: '700', color: C.ink },
  meta:       { fontSize: 13, color: C.mist },
  cover:      { width: 45, height: 60, borderRadius: 4, marginRight: 12, backgroundColor: C.cream },
  pill:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  pillText:   { fontSize: 10, fontWeight: '700' },
  primaryBtn: { backgroundColor: C.sienna, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  primaryBtnText: { color: C.white, fontWeight: '700', fontSize: 14 },
  outlineBtn: { borderWidth: 1.5, borderColor: C.sienna, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  outlineBtnText: { color: C.sienna, fontWeight: '700' },
  ghostDanger:{ backgroundColor: C.rust + '10', paddingVertical: 8, borderRadius: 8, marginTop: 8 },
  ghostDangerText: { color: C.rust, fontWeight: '700', textAlign: 'center' },
  tagLine:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  tagName:    { fontSize: 15, color: C.ink, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 12 },
  dividerLine:{ flex: 1, height: 1, backgroundColor: C.border },
  dividerText:{ fontSize: 11, fontWeight: '700', color: C.mist, textTransform: 'uppercase' },
  fieldWrap:  { marginBottom: 15 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 6 },
  input:      { borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: C.white },
  textarea:   { minHeight: 90, textAlignVertical: 'top' },
  filePicker: { borderWidth: 1, borderStyle: 'dashed', borderColor: C.sienna, padding: 18, borderRadius: 10, alignItems: 'center', backgroundColor: C.sienna + '05' },
  filePickerText: { color: C.sienna, fontWeight: '700' },
  tagGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagToggle:  { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: C.cream },
  tagToggleActive: { backgroundColor: C.ink },
  tagToggleText: { fontSize: 12, color: C.ink },
  tagToggleTextActive: { color: C.white },
  modalRoot:  { flex: 1, backgroundColor: C.paper },
  modalHeader:{ backgroundColor: C.ink, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: C.white, fontSize: 18, fontWeight: '700' },
  closeBtnText: { color: C.white, fontSize: 22 },
  modalBody:  { padding: 20 },
  submitBtn:  { backgroundColor: C.ink, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: C.white, fontWeight: '700', fontSize: 16 }
});