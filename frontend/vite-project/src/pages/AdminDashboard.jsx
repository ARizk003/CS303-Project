import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [showEditBookModal, setShowEditBookModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        category: '',
        pdfUrl: ''
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'books') {
            fetchBooks();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: { 'x-auth-token': token }
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch users');
        }
        setLoading(false);
    };

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/books');
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
            await axios.delete(`http://localhost:5000/api/users/${userId}`, {
                headers: { 'x-auth-token': token }
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
            await axios.post('http://localhost:5000/api/books', newBook, {
                headers: { 'x-auth-token': token }
            });
            alert('Book added successfully');
            setShowAddBookModal(false);
            setNewBook({ title: '', author: '', category: '', pdfUrl: '' });
            fetchBooks();
        } catch (err) {
            console.error(err);
            alert('Failed to add book');
        }
    };

    const handleEditBook = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/books/${selectedBook._id}`, selectedBook, {
                headers: { 'x-auth-token': token }
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
            await axios.delete(`http://localhost:5000/api/books/${bookId}`, {
                headers: { 'x-auth-token': token }
            });
            alert('Book deleted successfully');
            fetchBooks();
        } catch (err) {
            console.error(err);
            alert('Failed to delete book');
        }
    };

    const openEditModal = (book) => {
        setSelectedBook({ ...book });
        setShowEditBookModal(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="d-flex" style={{ minHeight: 'calc(100vh - 76px)', backgroundColor: '#f8f9fa' }}>
            <div 
                className="bg-white border-end shadow-sm" 
                style={{ 
                    width: sidebarCollapsed ? '80px' : '250px',
                    transition: 'width 0.3s ease',
                    position: 'relative'
                }}
            >
                <div className="p-3 border-bottom" style={{ backgroundColor: '#002147' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        {!sidebarCollapsed && (
                            <h5 className="text-white mb-0 fw-bold">Admin Panel</h5>
                        )}
                        <button 
                            className="btn btn-sm text-white ms-auto"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            style={{ backgroundColor: '#C5A059' }}
                        >
                            {sidebarCollapsed ? '☰' : '✕'}
                        </button>
                    </div>
                </div>
                
                <div className="d-flex flex-column p-2">
                    <button 
                        className={`btn text-start mb-2 d-flex align-items-center ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('users')}
                        style={activeTab === 'users' ? { backgroundColor: '#002147', borderColor: '#002147' } : {}}
                    >
                        <span className="fs-5 me-2">👥</span>
                        {!sidebarCollapsed && <span>User Management</span>}
                    </button>
                    
                    <button 
                        className={`btn text-start mb-2 d-flex align-items-center ${activeTab === 'books' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('books')}
                        style={activeTab === 'books' ? { backgroundColor: '#002147', borderColor: '#002147' } : {}}
                    >
                        <span className="fs-5 me-2">📚</span>
                        {!sidebarCollapsed && <span>Books Management</span>}
                    </button>
                    
                    <hr />
                    
                    <button 
                        className="btn btn-outline-danger text-start d-flex align-items-center"
                        onClick={handleLogout}
                    >
                        <span className="fs-5 me-2">🚪</span>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 p-4">
                {activeTab === 'users' && (
                    <div className="bg-white rounded shadow-sm p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                            <h2 className="mb-0" style={{ color: '#002147' }}>User Management</h2>
                        </div>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" style={{ color: '#002147' }} role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead style={{ backgroundColor: '#002147', color: 'white' }}>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Date Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user._id}>
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>{new Date(user.date).toLocaleDateString()}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => deleteUser(user._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'books' && (
                    <div className="bg-white rounded shadow-sm p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                            <h2 className="mb-0" style={{ color: '#002147' }}>Books Management</h2>
                            <button 
                                className="btn text-white"
                                style={{ backgroundColor: '#C5A059' }}
                                onClick={() => setShowAddBookModal(true)}
                            >
                                + Add New Book
                            </button>
                        </div>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" style={{ color: '#002147' }} role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead style={{ backgroundColor: '#002147', color: 'white' }}>
                                        <tr>
                                            <th>Title</th>
                                            <th>Author</th>
                                            <th>Category</th>
                                            <th>PDF URL</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map(book => (
                                            <tr key={book._id}>
                                                <td>{book.title}</td>
                                                <td>{book.author}</td>
                                                <td>{book.category}</td>
                                                <td>
                                                    <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#C5A059' }}>
                                                        View PDF
                                                    </a>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm me-2"
                                                        style={{ backgroundColor: '#C5A059', color: 'white' }}
                                                        onClick={() => openEditModal(book)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => deleteBook(book._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Book Modal */}
            {showAddBookModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAddBookModal(false)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: '#002147', color: 'white' }}>
                                <h5 className="modal-title">Add New Book</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddBookModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAddBook}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Title</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={newBook.title}
                                            onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Author</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={newBook.author}
                                            onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Category</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={newBook.category}
                                            onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">PDF URL</label>
                                        <input 
                                            type="url" 
                                            className="form-control"
                                            value={newBook.pdfUrl}
                                            onChange={(e) => setNewBook({...newBook, pdfUrl: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <button type="submit" className="btn text-white w-100" style={{ backgroundColor: '#C5A059' }}>
                                        Add Book
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Book Modal */}
            {showEditBookModal && selectedBook && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowEditBookModal(false)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: '#002147', color: 'white' }}>
                                <h5 className="modal-title">Edit Book</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditBookModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleEditBook}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Title</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={selectedBook.title}
                                            onChange={(e) => setSelectedBook({...selectedBook, title: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Author</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={selectedBook.author}
                                            onChange={(e) => setSelectedBook({...selectedBook, author: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Category</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={selectedBook.category}
                                            onChange={(e) => setSelectedBook({...selectedBook, category: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">PDF URL</label>
                                        <input 
                                            type="url" 
                                            className="form-control"
                                            value={selectedBook.pdfUrl}
                                            onChange={(e) => setSelectedBook({...selectedBook, pdfUrl: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <button type="submit" className="btn text-white w-100" style={{ backgroundColor: '#C5A059' }}>
                                        Update Book
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
