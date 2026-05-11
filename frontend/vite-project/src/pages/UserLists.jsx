import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';
import {toast} from "react-hot-toast";

const UserLists = () => {
    const [lists, setLists] = useState([]);
    const [allBooks, setAllBooks] = useState([]); // General Library
    const [activeList, setActiveList] = useState(null);
    const [newListTitle, setNewListTitle] = useState('');
    const [viewMode, setViewMode] = useState('myList'); // 'myList' or 'browse'
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('token');
    const API_URL_LISTS = `${API_URL}/api/lists`;

    useEffect(() => {
        fetchLists();
        fetchAllBooks();
    }, []);

    const fetchLists = async () => {
        try {
            const res = await axios.get(API_URL_LISTS, { headers: { 'x-auth-token': token } });
            setLists(res.data);
            if (res.data.length > 0 && !activeList) setActiveList(res.data[0]);
        } catch (err) { console.error(err); }
    };

    const fetchAllBooks = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/books`);
            setAllBooks(res.data);
        } catch (err) { console.error(err); }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;
        try {
            await axios.post(API_URL_LISTS, { title: newListTitle }, { headers: { 'x-auth-token': token } });
            setNewListTitle('');
            fetchLists();
        } catch (err) { toast.error('Failed to create list'); }
    };

    const addBookToList = async (bookId) => {
        if (!activeList) return toast("Please select or create a list first!");
        try {
            const res = await axios.patch(`${API_URL_LISTS}/${activeList._id}/add`,
                { bookId },
                { headers: { 'x-auth-token': token } }
            );
            setActiveList(res.data.list);
            setLists(lists.map(l => l._id === activeList._id ? res.data.list : l));
            toast.success("Book added!");
        } catch (err) { toast("Book already in list or error occurred"); }
    };

    const openBook = (book) => {
        if (!user) {
            navigate('/login', { state: { message: 'Please sign in or create an account to explore books.' } });
            return;
        }
        navigate('/read-book', { state: { book } });
        };

    const removeBook = async (bookId) => {
        try {
            const res = await axios.patch(`${API_URL_LISTS}/${activeList._id}/remove`,
                { bookId },
                { headers: { 'x-auth-token': token } }
            );
            setActiveList(res.data.list);
            setLists(lists.map(l => l._id === activeList._id ? res.data.list : l));
        } catch (err) { toast.error('Error removing book'); }
    };

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: '#fdfaf6', minHeight: '100vh' }}>
            <div className="container">
                <div className="row g-4">

                    {/* SIDEBAR */}
                    <div className="col-md-4 col-lg-3">
                        <div className="card border-0 shadow-sm rounded-4 bg-white p-3">
                            <form onSubmit={handleCreateList} className="mb-4">
                                <label className="small fw-bold text-muted mb-1">CREATE NEW LIST</label>
                                <div className="input-group">
                                    <input type="text" className="form-control" value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} />
                                    <button className="btn" style={{ backgroundColor: '#C5A059', color: '#white' }} type="submit">+</button>
                                </div>
                            </form>
                            <hr />
                            <div className="nav flex-column nav-pills">
                                {lists.map(list => (
                                    <button
                                        key={list._id}
                                        onClick={() => { setActiveList(list); setViewMode('myList'); }}
                                        className={`btn text-start mb-2 ${activeList?._id === list._id ? 'bg-light' : ''}`}
                                        style={{ color: activeList?._id === list._id ? '#C5A059' : '#333' }}
                                    >
                                        📁 {list.title} ({list.booksIds?.length || 0})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MAIN AREA */}
                    <div className="col-md-8 col-lg-9">
                        {/* Tab Switcher */}
                        <div className="d-flex gap-3 mb-4">
                            <button className={`btn rounded-pill px-4 ${viewMode === 'myList' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setViewMode('myList')}>My List Items</button>
                            <button className={`btn rounded-pill px-4 ${viewMode === 'browse' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setViewMode('browse')}>+ Add Books from Library</button>
                        </div>

                        {activeList ? (
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                {viewMode === 'myList' ? (
                                    <>
                                        <h2 className="mb-4" style={{ fontFamily: 'serif', color: '#002147' }}>{activeList.title}</h2>
                                        {activeList.booksIds?.length > 0 ? (
                                            <table className="table table-hover">
                                                <tbody>
                                                {activeList.booksIds.map(book => (
                                                    <tr key={book._id}>
                                                        <td><strong>{book.title}</strong><br/><small>{book.author}</small></td>
                                                        <td className="text-end"><button className="btn btn-sm btn-outline-warning" onClick={() => openBook(book)}>Preview</button></td>
                                                        <td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={() => removeBook(book._id)}>Remove</button></td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        ) : <p className="text-center py-5 text-muted">No books here yet.</p>}
                                    </>
                                ) : (
                                    <>
                                        <h2 className="mb-4">Browse Library</h2>
                                        <div className="row row-cols-1 row-cols-md-2 g-3">
                                            {allBooks.map(book => (
                                                <div className="col" key={book._id}>
                                                    <div className="card h-100 border p-3">
                                                        <h6>{book.title}</h6>
                                                        <p className="small text-muted mb-2">{book.author}</p>
                                                        <button
                                                            className="btn btn-sm text-white"
                                                            style={{ backgroundColor: '#C5A059' }}
                                                            onClick={() => addBookToList(book._id)}
                                                        >
                                                            Add to "{activeList.title}"
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-5 bg-white shadow-sm rounded-4">Create or select a list to start adding books.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLists;