import React, {useContext, useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Button,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator
} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {useRouter} from "expo-router";
import axios from "axios";
import {navigate} from "expo-router/build/global-state/routing";

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from "react-native-safe-area-context";
import {Alert} from 'react-native';

//
// // Saving data
// await SecureStore.setItemAsync('userToken', 'abc-123');
//
// // Retrieving data
// const token = await SecureStore.getItemAsync('userToken');


export default function AdminDashboard() {
    const {user} = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [showEditBookModal, setShowEditBookModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const {logout} = useContext(AuthContext);
    const router = useRouter();


    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        category: '',
        pdfUrl: ''
    });

    // getItemAsync is async and await error is ignored "safely?"


    const fetchUsers = async () => {
        // const token = await SecureStore.setItemAsync('userToken' , JSON.stringify(user));

        const token = await AsyncStorage.getItem('token');
        setLoading(true);
        try {
            console.log("before***********************");
            console.log(token);

            const res = await axios.get('http://192.168.8.162:5000/api/users', {
                headers: {'x-auth-token': token}
            });

            console.log("after***********************");

            setUsers(res.data);
        } catch (err) {
            console.error(err);
            console.log(err);

            alert('Failed to fetch users');
        }
        setLoading(false);
    };

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://192.168.8.162:5000/api/books');
            setBooks(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch books');
        }
        setLoading(false);
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await axios.delete(`http://192.168.8.162:5000/api/users/${userId}`, {
                headers: {'x-auth-token': token}
            });
            alert('User deleted successfully');
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Failed to delete user');
        }
    };



    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://192.168.8.162:5000/api/books', newBook, {
                headers: {'x-auth-token': token}
            });
            alert('Book added successfully');
            setShowAddBookModal(false);
            setNewBook({title: '', author: '', category: '', pdfUrl: ''});
            fetchBooks();
        } catch (err) {
            console.error(err);
            alert('Failed to add book');
        }
    };

    const handleEditBook = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://192.168.8.162:5000/api/books/${selectedBook._id}`, selectedBook, {
                headers: {'x-auth-token': token}
            });
            alert('Book updated successfully');
            setShowEditBookModal(false);
            setSelectedBook(null);
            fetchBooks();
        } catch (err) {
            console.error(err);
            alert('Failed to update book');
        }
    };

    const deleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;

        try {
            await axios.delete(`http://192.168.8.162:5000/api/books/${bookId}`, {
                headers: {'x-auth-token': token}
            });
            alert('Book deleted successfully');
            fetchBooks();
        } catch (err) {
            console.error(err);
            alert('Failed to delete book');
        }
    };

    const openEditModal = (book) => {
        setSelectedBook({...book});
        setShowEditBookModal(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'books') {
            fetchBooks();
        }
    }, [activeTab]);


    if (user?.role === 'admin') {
        return (


            <SafeAreaView style={styles.container}>
                <View style={styles.layout}>

                    {/* SIDEBAR */}
                    <View style={[styles.sidebar, {width: sidebarCollapsed ? 70 : 220}]}>
                        <View style={styles.sidebarHeader}>
                            {!sidebarCollapsed && <Text style={styles.brandText}>Admin</Text>}
                            <TouchableOpacity
                                onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
                                style={styles.toggleBtn}
                            >
                                <Text style={{color: 'white'}}>{sidebarCollapsed ? '☰' : '✕'}</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.sidebarNav}>
                            <TouchableOpacity
                                onPress={() => setActiveTab('users')}
                                style={[styles.navItem, activeTab === 'users' && styles.navItemActive]}
                            >
                                <Text style={styles.navIcon}>👥</Text>
                                {!sidebarCollapsed && <Text
                                    style={[styles.navText, activeTab === 'users' && styles.navTextActive]}>Users</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setActiveTab('books');
                                    fetchBooks();
                                }}
                                style={[styles.navItem, activeTab === 'books' && styles.navItemActive]}
                            >
                                <Text style={styles.navIcon}>📚</Text>
                                {!sidebarCollapsed && <Text
                                    style={[styles.navText, activeTab === 'books' && styles.navTextActive]}>Books</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* MAIN CONTENT */}
                    <View style={styles.mainContent}>
                        <ScrollView contentContainerStyle={{padding: 20}}>
                            <Text style={styles.headerTitle}>
                                {activeTab === 'users' ? 'User Management' : 'Books Management'}
                            </Text>

                            {loading ? (
                                <ActivityIndicator size="large" color="#002147"/>
                            ) : (
                                <View style={styles.card}>
                                    {/* Simplified Table Header */}
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableHeaderText, {flex: 2}]}>Name</Text>
                                        <Text style={[styles.tableHeaderText, {flex: 1}]}>Role</Text>
                                    </View>


                                    {/* List Items */}

                                    {activeTab === 'users' && users.map((user) => (
                                        <View key={user._id} style={styles.tableRow}>
                                            <View style={{flex: 2}}>
                                                <Text style={styles.rowMainText}>{user.username}</Text>
                                                <Text style={styles.rowSubText}>{user.email}</Text>
                                                <TouchableOpacity
                                                    onPress={deleteUser()}><Text>Del</Text></TouchableOpacity>
                                            </View>
                                            <View style={{flex: 1}}>
                                                <Text
                                                    style={user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}>
                                                    {user.role}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                    {activeTab === 'books' && books.map((book) => (
                                        <View key={book._id} style={styles.tableRow}>
                                            <View style={{flex: 2}}>
                                                <Text style={styles.rowMainText}>{book.title}</Text>
                                                <Text style={styles.rowSubText}>{book.author}</Text>
                                                <TouchableOpacity
                                                    onPress={() => deleteBook()}><Text>Del</Text></TouchableOpacity>
                                            </View>
                                            {/*<View style={{flex: 1}}>*/}
                                            {/*    <Text*/}
                                            {/*        style={user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}>*/}
                                            {/*        {user.role}*/}
                                            {/*    </Text>*/}
                                            {/*</View>*/}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </SafeAreaView>


        );
    }

    // return (
    //     <View style={styles.container}>
    //         <Navbar/>
    //         <ScrollView contentContainerStyle={styles.content}>
    //             <Text style={styles.title}>Admin Dashboard</Text>
    //             <Text style={styles.welcome}>Welcome, Admin {user?.username}!</Text>
    //             <Text style={styles.info}>Manage your library system here</Text>
    //         </ScrollView>
    //     </View>
    // );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#002147',
        marginBottom: 20,
    },
    welcome: {
        fontSize: 24,
        color: '#333',
        marginBottom: 15,
    },
    info: {
        fontSize: 18,
        color: '#666',
        marginBottom: 10,
    },
    error: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#dc3545',
        marginBottom: 10,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },

    layout: {
        flex: 1,
        flexDirection: 'row', // This creates the Sidebar | Content split
    },
    sidebar: {
        backgroundColor: 'white',
        borderRightWidth: 1,
        borderRightColor: '#ddd',
        height: '100%',
    },
    sidebarHeader: {
        backgroundColor: '#002147',
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    brandText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    toggleBtn: {
        backgroundColor: '#C5A059',
        padding: 8,
        borderRadius: 5,
    },
    sidebarNav: {
        padding: 10,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    navItemActive: {
        backgroundColor: '#002147',
    },
    navIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    navText: {
        color: '#444',
        fontWeight: '500',
    },
    navTextActive: {
        color: 'white',
    },
    mainContent: {
        flex: 1, // This makes the content take up the remaining screen width
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#002147',
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
        marginBottom: 10,
    },
    tableHeaderText: {
        fontWeight: 'bold',
        color: '#888',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
    },
    rowMainText: {
        fontWeight: '600',
        color: '#333',
    },
    rowSubText: {
        fontSize: 12,
        color: '#999',
    },
    badgeUser: {
        color: 'green',
        backgroundColor: '#e6ffed',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 12,
        textAlign: 'center',
    },
    badgeAdmin: {
        color: 'red',
        backgroundColor: '#fff1f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 12,
        textAlign: 'center',
    }
});
