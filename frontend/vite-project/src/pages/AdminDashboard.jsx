import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [newTagName, setNewTagName] = useState('');
    const [editingTag, setEditingTag] = useState(null);
    const [editTagName, setEditTagName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [showEditBookModal, setShowEditBookModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [borrowRequests, setBorrowRequests] = useState([]);

    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [newBook, setNewBook] = useState({
        title: '', author: '', category: '', description: '', authorBio: '', selectedTagIds: []
    });
    const [newBookFile, setNewBookFile] = useState(null);
    const [newCoverFile, setNewCoverFile] = useState(null);
    const [editCoverFile, setEditCoverFile] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchAllTags();
        if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'books') fetchBooks();
        else if (activeTab === 'borrow') fetchBorrowRequests();
    }, [activeTab]);

    const fetchBorrowRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/borrow', {
                headers: { 'x-auth-token': token }
            });
            setBorrowRequests(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const updateBorrowStatus = async (id, status) => {
        try {
            await axios.patch(`http://localhost:5000/api/borrow/${id}`, { status }, {
                headers: { 'x-auth-token': token }
            });
            setBorrowRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const fetchAllTags = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tags');
            setAllTags(res.data);
        } catch (err) {
            console.error('Failed to fetch tags', err);
        }
    };

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


    const handleCreateTag = async (e) => {
        e.preventDefault();
        if (!newTagName.trim()) return;
        try {
            await axios.post('http://localhost:5000/api/tags',
                { name: newTagName.trim() },
                { headers: { 'x-auth-token': token } }
            );
            setNewTagName('');
            fetchAllTags();
        } catch (err) {
            if (err.response?.status === 409) {
                alert('Tag already exists');
            } else {
                alert('Failed to create tag');
            }
        }
    };
    

    const handleDeleteTag = async (tagId) => {
        if (!window.confirm('Delete this tag?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/tags/${tagId}`, {
                headers: { 'x-auth-token': token }
            });
            fetchAllTags();
        } catch (err) {
            alert('Failed to delete tag');
        }
    };

    const handleEditTag = async (tagId) => {
        if (!editTagName.trim()) return;
        try {
            await axios.put(`http://localhost:5000/api/tags/${tagId}`,
                { name: editTagName.trim() },
                { headers: { 'x-auth-token': token } }
            );
            setEditingTag(null);
            setEditTagName('');
            fetchAllTags();
        } catch (err) {
            alert('Failed to update tag');
        }
    };

    const toggleTagAdd = (tagId) => {
        setNewBook(prev => ({
            ...prev,
            selectedTagIds: prev.selectedTagIds.includes(tagId)
                ? prev.selectedTagIds.filter(id => id !== tagId)
                : [...prev.selectedTagIds, tagId]
        }));
    };

    const toggleTagEdit = (tagId) => {
        setSelectedBook(prev => ({
            ...prev,
            selectedTagIds: prev.selectedTagIds.includes(tagId)
                ? prev.selectedTagIds.filter(id => id !== tagId)
                : [...prev.selectedTagIds, tagId]
        }));
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        if (!newBookFile) {
            alert('Please select a PDF file');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('title', newBook.title);
            formData.append('author', newBook.author);
            formData.append('category', newBook.category);
            formData.append('description', newBook.description);
            formData.append('authorBio', newBook.authorBio);
            formData.append('pdf', newBookFile);
            if (newCoverFile) formData.append('cover', newCoverFile);

            const res = await axios.post('http://localhost:5000/api/books',
                formData,
                { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } }
            );
            const newBookId = res.data._id;

            if (newBook.selectedTagIds.length > 0) {
                await axios.post(
                    `http://localhost:5000/api/books/${newBookId}/tags`,
                    { tag_ids: newBook.selectedTagIds },
                    { headers: { 'x-auth-token': token } }
                );
            }

            alert('Book added successfully');
            setShowAddBookModal(false);
            setNewBook({ title: '', author: '', category: '', description: '', authorBio: '', selectedTagIds: [] });
            setNewBookFile(null);
            setNewCoverFile(null);
            fetchBooks();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to add book');
        }
    };

    const handleEditBook = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', selectedBook.title);
            formData.append('author', selectedBook.author);
            formData.append('category', selectedBook.category);
            formData.append('description', selectedBook.description || '');
            formData.append('authorBio', selectedBook.authorBio || '');
            if (editCoverFile) formData.append('cover', editCoverFile);

            await axios.put(`http://localhost:5000/api/books/${selectedBook._id}`,
                formData,
                { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } }
            );

            await axios.post(
                `http://localhost:5000/api/books/${selectedBook._id}/tags`,
                { tag_ids: selectedBook.selectedTagIds },
                { headers: { 'x-auth-token': token } }
            );

            alert('Book updated successfully');
            setShowEditBookModal(false);
            setSelectedBook(null);
            setEditCoverFile(null);
            fetchBooks();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to update book');
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/users/${userId}`, {
                headers: { 'x-auth-token': token }
            });
            fetchUsers();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const deleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/books/${bookId}`, {
                headers: { 'x-auth-token': token }
            });
            fetchBooks();
        } catch (err) {
            alert('Failed to delete book');
        }
    };

    const openEditModal = (book) => {
        const existingTagIds = Array.isArray(book.tags)
            ? book.tags.map(tag => typeof tag === 'object' ? tag._id : tag)
            : [];
        setSelectedBook({...book,selectedTagIds: existingTagIds,description: book.description || '',authorBio: book.authorBio || '',});
        setEditCoverFile(null);
        setShowEditBookModal(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const textareaStyle = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        fontSize: '0.9rem',
        resize: 'vertical',
        minHeight: '90px',
        fontFamily: 'inherit',
        lineHeight: '1.5',
    };

    return (
        <div className="d-flex" style={{ minHeight: 'calc(100vh - 76px)', backgroundColor: '#f8f9fa' }}>

            {/* Sidebar */}
            <div className="bg-white border-end shadow-sm"
                style={{ width: sidebarCollapsed ? '80px' : '250px', transition: 'width 0.3s ease' }}>
                <div className="p-3 border-bottom" style={{ backgroundColor: '#002147' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        {!sidebarCollapsed && <h5 className="text-white mb-0 fw-bold">Admin Panel</h5>}
                        <button className="btn btn-sm text-white ms-auto" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            style={{ backgroundColor: '#C5A059' }}>
                            {sidebarCollapsed ? '☰' : '✕'}
                        </button>
                    </div>
                </div>

                <div className="d-flex flex-column p-2">
                    <button
                        className={`btn text-start mb-2 d-flex align-items-center ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('users')}
                        style={activeTab === 'users' ? { backgroundColor: '#002147', borderColor: '#002147' } : {}}>
                        <span className="fs-5 me-2">👥</span>
                        {!sidebarCollapsed && <span>User Management</span>}
                    </button>

                    <button
                        className={`btn text-start mb-2 d-flex align-items-center ${activeTab === 'books' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('books')}
                        style={activeTab === 'books' ? { backgroundColor: '#002147', borderColor: '#002147' } : {}}>
                        <span className="fs-5 me-2">📚</span>
                        {!sidebarCollapsed && <span>Books Management</span>}
                    </button>

                    <button
                        className={`btn text-start mb-2 d-flex align-items-center ${activeTab === 'tags' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('tags')}
                        style={activeTab === 'tags' ? { backgroundColor: '#002147', borderColor: '#002147' } : {}}>
                        <span className="fs-5 me-2">🏷️</span>
                        {!sidebarCollapsed && <span>Tags Management</span>}
                    </button>

                    <button
                        className={`btn text-start mb-2 d-flex align-items-center ${activeTab === 'borrow' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('borrow')}
                        style={activeTab === 'borrow' ? { backgroundColor: '#002147', borderColor: '#002147' } : {}}>
                        <span className="fs-5 me-2">📦</span>
                        {!sidebarCollapsed && <span>Borrow Requests</span>}
                    </button>

                    <hr />

                    <button className="btn btn-outline-danger text-start d-flex align-items-center" onClick={handleLogout}>
                        <span className="fs-5 me-2">🚪</span>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 p-4">

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded shadow-sm p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                            <h2 className="mb-0" style={{ color: '#002147' }}>User Management</h2>
                        </div>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" style={{ color: '#002147' }} role="status" />
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead style={{ backgroundColor: '#002147', color: 'white' }}>
                                        <tr>
                                            <th>Username</th><th>Email</th><th>Role</th><th>Date Joined</th><th>Actions</th>
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
                                                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Books Tab */}
                {activeTab === 'books' && (
                    <div className="bg-white rounded shadow-sm p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                            <h2 className="mb-0" style={{ color: '#002147' }}>Books Management</h2>
                            <button className="btn text-white" style={{ backgroundColor: '#C5A059' }}
                                onClick={() => setShowAddBookModal(true)}>
                                + Add New Book
                            </button>
                        </div>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" style={{ color: '#002147' }} role="status" />
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead style={{ backgroundColor: '#002147', color: 'white' }}>
                                        <tr>
                                            <th>Cover</th><th>Title</th><th>Author</th><th>Category</th><th>Tags</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map(book => (
                                            <tr key={book._id}>
                                                <td>
                                                    <img
                                                        src={book.coverImage || '/Book.jpg'}
                                                        alt={book.title}
                                                        style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                                                    />
                                                </td>
                                                <td>{book.title}</td>
                                                <td>{book.author}</td>
                                                <td>{book.category}</td>
                                                <td>
                                                    {Array.isArray(book.tags) && book.tags.map((tag, i) => (
                                                        <span key={tag._id || i} className="badge bg-light text-dark border me-1">
                                                            {typeof tag === 'object' ? tag.name : tag}
                                                        </span>
                                                    ))}
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm me-2 text-white"
                                                        style={{ backgroundColor: '#C5A059' }}
                                                        onClick={() => openEditModal(book)}>
                                                        Edit
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => deleteBook(book._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Tags Tab */}
                {activeTab === 'tags' && (
                    <div className="bg-white rounded shadow-sm p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                            <h2 className="mb-0" style={{ color: '#002147' }}>Tags Management</h2>
                        </div>

                        <form onSubmit={handleCreateTag} className="d-flex gap-2 mb-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="New tag name..."
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                style={{ maxWidth: '300px' }}
                            />
                            <button type="submit" className="btn text-white" style={{ backgroundColor: '#C5A059' }}>
                                + Add Tag
                            </button>
                        </form>

                        <div className="d-flex flex-wrap gap-2">
                            {allTags.length === 0 ? (
                                <p className="text-muted">No tags yet.</p>
                            ) : (
                                allTags.map(tag => (
                                    <span key={tag._id} className="badge d-flex align-items-center gap-2 px-3 py-2 fs-6"
                                        style={{ backgroundColor: '#f8f9fa', color: '#002147', border: '1px solid #dee2e6' }}>
                                        
                                        {editingTag === tag._id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={editTagName}
                                                    onChange={(e) => setEditTagName(e.target.value)}
                                                    className="form-control form-control-sm"
                                                    style={{ width: '100px' }}
                                                    autoFocus
                                                />
                                                <button className="btn btn-sm btn-success py-0 px-1" onClick={() => handleEditTag(tag._id)}>✓</button>
                                                <button className="btn btn-sm btn-secondary py-0 px-1" onClick={() => setEditingTag(null)}>✕</button>
                                            </>
                                        ) : (
                                            <>
                                                {tag.name}
                                                <button
                                                    className="btn btn-sm py-0 px-1"
                                                    style={{ fontSize: '0.6rem' }}
                                                    onClick={() => { setEditingTag(tag._id); setEditTagName(tag.name); }}
                                                >✏️</button>
                                                <button
                                                    className="btn-close btn-close-sm"
                                                    style={{ fontSize: '0.6rem' }}
                                                    onClick={() => handleDeleteTag(tag._id)}
                                                />
                                            </>
                                        )}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Add Book Modal */}
            {showAddBookModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAddBookModal(false)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: '#002147', color: 'white' }}>
                                <h5 className="modal-title">Add New Book</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddBookModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                <form onSubmit={handleAddBook}>

                                    <p className="fw-bold text-uppercase small mb-2" style={{ color: '#C5A059', letterSpacing: '0.08em' }}>
                                        Basic Information
                                    </p>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Title <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={newBook.title}
                                                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Author <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={newBook.author}
                                                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} required />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-bold">Category <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={newBook.category}
                                                onChange={(e) => setNewBook({ ...newBook, category: e.target.value })} required />
                                        </div>
                                    </div>

                                    <hr className="my-3" />
                                    
                                    <p className="fw-bold text-uppercase small mb-2" style={{ color: '#C5A059', letterSpacing: '0.08em' }}>
                                        Book Details
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Book Description
                                            <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.8rem' }}>(optional)</span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Write a compelling description about the book — what readers will learn, the key themes, and why it's worth reading "
                                            value={newBook.description}
                                            onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                                            style={textareaStyle}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            About the Author
                                            <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.8rem' }}>(optional)</span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Share the author's background, expertise, academic achievements, etc"
                                            value={newBook.authorBio}
                                            onChange={(e) => setNewBook({ ...newBook, authorBio: e.target.value })}
                                            style={textareaStyle}
                                        />
                                    </div>

                                    <hr className="my-3" />
                                    <p className="fw-bold text-uppercase small mb-2" style={{ color: '#C5A059', letterSpacing: '0.08em' }}>
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Tags</label>
                                        {allTags.length === 0 ? (
                                            <p className="text-muted small">No tags available. Add tags from Tags Management first.</p>
                                        ) : (
                                            <div className="d-flex flex-wrap gap-2 p-2 border rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                {allTags.map(tag => (
                                                    <div key={tag._id} className="form-check">
                                                        <input className="form-check-input" type="checkbox"
                                                            id={`add-tag-${tag._id}`}
                                                            checked={newBook.selectedTagIds.includes(tag._id)}
                                                            onChange={() => toggleTagAdd(tag._id)} />
                                                        <label className="form-check-label" htmlFor={`add-tag-${tag._id}`}>
                                                            {tag.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Cover Image</label>
                                            <input type="file" className="form-control" accept="image/*"
                                                onChange={(e) => setNewCoverFile(e.target.files[0] || null)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">PDF File <span className="text-danger">*</span></label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept=".pdf"
                                                onChange={(e) => setNewBookFile(e.target.files[0] || null)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn text-white w-100 py-2 mt-2" style={{ backgroundColor: '#C5A059', fontWeight: 600 }}>
                                        + Add Book
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
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: '#002147', color: 'white' }}>
                                <h5 className="modal-title"> Edit Book</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditBookModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                <form onSubmit={handleEditBook}>

                                    <p className="fw-bold text-uppercase small mb-2" style={{ color: '#C5A059', letterSpacing: '0.08em' }}>
                                        Basic Information
                                    </p>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Title <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={selectedBook.title}
                                                onChange={(e) => setSelectedBook({ ...selectedBook, title: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Author <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={selectedBook.author}
                                                onChange={(e) => setSelectedBook({ ...selectedBook, author: e.target.value })} required />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-bold">Category <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={selectedBook.category}
                                                onChange={(e) => setSelectedBook({ ...selectedBook, category: e.target.value })} required />
                                        </div>
                                    </div>

                                    <hr className="my-3" />

                                    <p className="fw-bold text-uppercase small mb-2" style={{ color: '#C5A059', letterSpacing: '0.08em' }}>
                                        Book Details
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Book Description
                                            <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.8rem' }}>(optional)</span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Write a compelling description about the book..."
                                            value={selectedBook.description}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, description: e.target.value })}
                                            style={textareaStyle}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            About the Author
                                            <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.8rem' }}>(optional)</span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Share the author's background and expertise..."
                                            value={selectedBook.authorBio}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, authorBio: e.target.value })}
                                            style={textareaStyle}
                                        />
                                    </div>

                                    <hr className="my-3" />
                                    <p className="fw-bold text-uppercase small mb-2" style={{ color: '#C5A059', letterSpacing: '0.08em' }}>
                                        Tags & Cover
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Tags</label>
                                        {allTags.length === 0 ? (
                                            <p className="text-muted small">No tags available.</p>
                                        ) : (
                                            <div className="d-flex flex-wrap gap-2 p-2 border rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                {allTags.map(tag => (
                                                    <div key={tag._id} className="form-check">
                                                        <input className="form-check-input" type="checkbox"
                                                            id={`edit-tag-${tag._id}`}
                                                            checked={selectedBook.selectedTagIds.includes(tag._id)}
                                                            onChange={() => toggleTagEdit(tag._id)} />
                                                        <label className="form-check-label" htmlFor={`edit-tag-${tag._id}`}>
                                                            {tag.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Cover Image</label>
                                        {selectedBook.coverImage && (
                                            <img src={selectedBook.coverImage} alt="Current Cover"
                                                style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', display: 'block', marginBottom: '8px' }} />
                                        )}
                                        <input type="file" className="form-control" accept="image/*"
                                            onChange={(e) => setEditCoverFile(e.target.files[0] || null)} />
                                        <small className="text-muted">Leave empty to keep current cover</small>
                                    </div>

                                    <button type="submit" className="btn text-white w-100 py-2 mt-2" style={{ backgroundColor: '#C5A059', fontWeight: 600 }}>
                                        Save Changes
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Borrow Requests Tab */}
            {activeTab === 'borrow' && (
                <div className="flex-grow-1 p-4">
                    <div className="bg-white rounded shadow-sm p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                            <h2 className="mb-0" style={{ color: '#002147' }}>📦 Borrow Requests</h2>
                            <span className="badge bg-warning text-dark fs-6">{borrowRequests.filter(r => r.status === 'pending').length} Pending</span>
                        </div>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" style={{ color: '#002147' }} role="status" />
                            </div>
                        ) : borrowRequests.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <div style={{ fontSize: '3rem' }}>📭</div>
                                <p>No borrow requests yet.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead style={{ backgroundColor: '#002147', color: 'white' }}>
                                        <tr>
                                            <th>User</th>
                                            <th>Book</th>
                                            <th>Full Name</th>
                                            <th>Phone</th>
                                            <th>Address</th>
                                            <th>National ID</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {borrowRequests.map(req => (
                                            <tr key={req._id}>
                                                <td>
                                                    <div className="fw-bold">{req.user?.username}</div>
                                                    <small className="text-muted">{req.user?.email}</small>
                                                </td>
                                                <td className="fw-semibold">{req.book?.title}</td>
                                                <td>{req.fullName}</td>
                                                <td>{req.phone}</td>
                                                <td>{req.address}</td>
                                                <td>{req.nationalId}</td>
                                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge ${req.status === 'pending' ? 'bg-warning text-dark' : req.status === 'approved' ? 'bg-success' : 'bg-danger'}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {req.status === 'pending' && (
                                                        <div className="d-flex gap-2">
                                                            <button className="btn btn-success btn-sm" onClick={() => updateBorrowStatus(req._id, 'approved')}>✓ Approve</button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => updateBorrowStatus(req._id, 'rejected')}>✕ Reject</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                         </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;