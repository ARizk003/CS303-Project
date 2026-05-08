import React, { useState, useEffect, useContext } from "react";
import { BASE_URL } from '../config/api';
import PdfViewerModal from "../components/PdfViewerModal";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserLists = () => {
  const [lists, setLists] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [activeList, setActiveList] = useState(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [viewMode, setViewMode] = useState("myList");
  const [pdfBook, setPdfBook] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchLists(), fetchAllBooks()]);
    setLoading(false);
  };

  const fetchLists = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/lists`, {
        headers: { "x-auth-token": token },
      });
      setLists(res.data);
      if (res.data.length > 0 && !activeList) setActiveList(res.data[0]);
      if (activeList) {
        const updated = res.data.find((l) => l._id === activeList._id);
        if (updated) setActiveList(updated);
      }
    } catch (err) {
      console.error("Error fetching lists:", err);
    }
  };

  const fetchAllBooks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/books`);
      setAllBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const getBooksForActiveList = () => {
    if (!activeList || !activeList.booksIds) return [];

    return activeList.booksIds
      .map((bookId) => {
        const idToFind = typeof bookId === "object" ? bookId._id : bookId;
        return allBooks.find((book) => book._id === idToFind);
      })
      .filter((book) => book !== undefined);
  };

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/lists`,
        { title: newListTitle },
        { headers: { "x-auth-token": token } },
      );
      setNewListTitle("");
      fetchLists();
      Alert.alert("Success", "New list created!");
    } catch (err) {
      Alert.alert("Error", "Failed to create list");
    }
  };

  const addBookToList = async (bookId) => {
    if (!activeList) return Alert.alert("Wait", "Please select a list first!");
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.patch(
        `${BASE_URL}/api/lists/${activeList._id}/add`,
        { bookId },
        { headers: { "x-auth-token": token } },
      );
      setActiveList(res.data.list);
      setLists(
        lists.map((l) => (l._id === activeList._id ? res.data.list : l)),
      );
      Alert.alert("Success", "Book added to list!");
    } catch (err) {
      Alert.alert("Error", "Book already in list or error occurred");
    }
  };

  const removeBook = async (bookId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.patch(
        `${BASE_URL}/api/lists/${activeList._id}/remove`,
        { bookId },
        { headers: { "x-auth-token": token } },
      );
      setActiveList(res.data.list);
      setLists(
        lists.map((l) => (l._id === activeList._id ? res.data.list : l)),
      );
    } catch (err) {
      Alert.alert("Error", "Could not remove book");
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#C5A059" style={{ flex: 1 }} />
    );
  }

    return (
    <View style={styles.container}>
      <View style={styles.sidebarEmulator}>
        <Text style={styles.label}>CREATE NEW LIST</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={newListTitle}
            onChangeText={setNewListTitle}
            placeholder="List Title..."
          />
          <TouchableOpacity style={styles.plusBtn} onPress={handleCreateList}>
            <Text style={{ color: "white", fontSize: 20 }}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.listSelector}
        >
          {lists.map((list) => (
            <TouchableOpacity
              key={list._id}
              onPress={() => {
                setActiveList(list);
                setViewMode("myList");
              }}
              style={[
                styles.listTab,
                activeList?._id === list._id && styles.activeListTab,
              ]}
            >
              <Text
                style={[
                  styles.listTabText,
                  activeList?._id === list._id && { color: "#C5A059" },
                ]}
              >
                📁 {list.title} ({list.booksIds?.length || 0})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabBtn, viewMode === "myList" && styles.tabBtnActive]}
          onPress={() => setViewMode("myList")}
        >
          <Text
            style={
              viewMode === "myList"
                ? styles.tabBtnTextActive
                : styles.tabBtnText
            }
          >
            My Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, viewMode === "browse" && styles.tabBtnActive]}
          onPress={() => setViewMode("browse")}
        >
          <Text
            style={
              viewMode === "browse"
                ? styles.tabBtnTextActive
                : styles.tabBtnText
            }
          >
            + Add Books
          </Text>
        </TouchableOpacity>
      </View>

      {activeList || viewMode === "browse" ? (
        <View style={styles.contentCard}>
          <Text style={styles.listHeader}>
            {viewMode === "myList" ? activeList?.title : "Browse Library"}
          </Text>
          <FlatList
            data={viewMode === "myList" ? getBooksForActiveList() : allBooks}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.bookItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookTitle}>{item.title}</Text>
                  <Text style={styles.bookAuthor}>{item.author}</Text>
                </View>
                <View style={styles.actionButtons}>
                  {viewMode === "myList" ? (
                    <>
                      <TouchableOpacity
                        onPress={() => setPdfBook(item)}
                        style={styles.previewBtn}
                      >
                        <Text style={{ color: "#C5A059", fontSize: 12 }}>
                          Read
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeBook(item._id)}
                        style={styles.removeBtn}
                      >
                        <Text style={{ color: "red", fontSize: 12 }}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={() => addBookToList(item._id)}
                      style={styles.addBtn}
                    >
                      <Text style={{ color: "white", fontSize: 11 }}>
                        Add to List
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No books found here.</Text>
            }
          />
        </View>
      ) : null}
      <PdfViewerModal
        book={pdfBook}
        token={user?.token}
        isAdmin={user?.role === "admin"}
        onClose={() => setPdfBook(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfaf6",
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  sidebarEmulator: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  label: { fontSize: 10, fontWeight: "bold", color: "#666", marginBottom: 5 },
  inputGroup: { flexDirection: "row", marginBottom: 15 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  plusBtn: {
    backgroundColor: "#C5A059",
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  listSelector: { flexDirection: "row", paddingVertical: 5 },
  listTab: {
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
  },
  activeListTab: {
    backgroundColor: "#fff8eb",
    borderBottomWidth: 2,
    borderBottomColor: "#C5A059",
  },
  listTabText: { fontSize: 13, color: "#333" },
  tabSwitcher: { flexDirection: "row", gap: 10, marginBottom: 15 },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    borderWeight: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: "#333" },
  tabBtnText: { color: "#333", fontWeight: "500" },
  tabBtnTextActive: { color: "white", fontWeight: "500" },
  contentCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    marginBottom: 10,
  },
  listHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#002147",
    marginBottom: 15,
  },
  bookItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  bookTitle: { fontSize: 14, fontWeight: "bold" },
  bookAuthor: { fontSize: 11, color: "#777" },
  actionButtons: { flexDirection: "row", gap: 5 },
  previewBtn: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#C5A059",
    borderRadius: 5,
  },
  removeBtn: {
    padding: 5,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 5,
  },
  addBtn: { backgroundColor: "#C5A059", padding: 8, borderRadius: 5 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
});

export default UserLists;
