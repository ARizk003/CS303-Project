// // // // ... imports (AuthContext, axios, etc.)
// // // import { useState, useEffect, useContext } from 'react';
// // // import axios from 'axios';
// // // import { AuthContext } from '../context/AuthContext';
// // // import { useNavigate } from 'react-router-dom';
// // //
// // // const UserLists = () => {
// // //     const [lists, setLists] = useState([]);
// // //     const [activeList, setActiveList] = useState(null); // The selected List object
// // //     const [loading, setLoading] = useState(false);
// // //     const [newListTitle, setNewListTitle] = useState('');
// // //
// // //     const token = localStorage.getItem('token');
// // //
// // //     useEffect(() => {
// // //         fetchLists();
// // //     }, []);
// // //
// // //     const fetchLists = async () => {
// // //         setLoading(true);
// // //         try {
// // //             const res = await axios.get('http://localhost:5000/api/lists', {
// // //                 headers: { 'x-auth-token': token }
// // //             });
// // //             setLists(res.data);
// // //             if (res.data.length > 0 && !activeList) setActiveList(res.data[0]);
// // //         } catch (err) {
// // //             console.error(err);
// // //         }
// // //         setLoading(false);
// // //     };
// // //
// // //     const handleCreateList = async (e) => {
// // //         e.preventDefault();
// // //         try {
// // //             await axios.post('http://localhost:5000/api/lists', { title: newListTitle }, {
// // //                 headers: { 'x-auth-token': token }
// // //             });
// // //             setNewListTitle('');
// // //             fetchLists();
// // //         } catch (err) {
// // //             alert('Failed to create list');
// // //         }
// // //     };
// // //
// // //     const removeBookFromList = async (bookId) => {
// // //         try {
// // //             const res = await axios.patch(
// // //                 `http://localhost:5000/api/lists/${activeList._id}/remove`,
// // //                 { bookId },
// // //                 { headers: { 'x-auth-token': token } }
// // //             );
// // //             // Update the UI with the returned list from backend
// // //             setActiveList(res.data.list);
// // //             fetchLists();
// // //         } catch (err) {
// // //             alert('Error removing book');
// // //         }
// // //     };
// // //
// // //     return (
// // //         <div className="d-flex">
// // //             {/* Sidebar now shows List Titles instead of User/Books tabs */}
// // //             <div className="sidebar" style={{ width: '250px' }}>
// // //                 <form onSubmit={handleCreateList} className="p-3">
// // //                     <input
// // //                         value={newListTitle}
// // //                         onChange={(e) => setNewListTitle(e.target.value)}
// // //                         placeholder="New List Name..."
// // //                     />
// // //                 </form>
// // //                 {lists.map(list => (
// // //                     <button key={list._id} onClick={() => setActiveList(list)}>
// // //                         {list.title}
// // //                     </button>
// // //                 ))}
// // //             </div>
// // //
// // //             {/* Main Content shows Books in the ACTIVE list */}
// // //             <div className="content p-4">
// // //                 {activeList && (
// // //                     <>
// // //                         <h2>{activeList.title}</h2>
// // //                         {activeList.booksIds.map(book => (
// // //                             <div key={book._id}>
// // //                                 {book.title}
// // //                                 <button onClick={() => removeBookFromList(book._id)}>Remove</button>
// // //                             </div>
// // //                         ))}
// // //                     </>
// // //                 )}
// // //             </div>
// // //         </div>
// // //     );
// // // };
// // //
// // // export default UserLists;
// //
// // import React, { useState, useEffect, useContext } from 'react';
// // import axios from 'axios';
// // import { AuthContext } from '../context/AuthContext';
// //
// // const UserLists = () => {
// //     const [lists, setLists] = useState([]);
// //     const [activeList, setActiveList] = useState(null);
// //     const [loading, setLoading] = useState(false);
// //     const [newListTitle, setNewListTitle] = useState('');
// //     const { user } = useContext(AuthContext);
// //
// //     const token = localStorage.getItem('token');
// //     const API_URL = 'http://localhost:5000/api/lists';
// //
// //     useEffect(() => {
// //         fetchLists();
// //     }, []);
// //
// //     const fetchLists = async () => {
// //         setLoading(true);
// //         try {
// //             const res = await axios.get(API_URL, {
// //                 headers: { 'x-auth-token': token }
// //             });
// //             setLists(res.data);
// //             // Default to the first list if one exists
// //             if (res.data.length > 0) setActiveList(res.data[0]);
// //         } catch (err) {
// //             console.error('Error fetching lists:', err);
// //         }
// //         setLoading(false);
// //     };
// //
// //     const handleCreateList = async (e) => {
// //         e.preventDefault();
// //         if (!newListTitle.trim()) return;
// //         try {
// //             const res = await axios.post(API_URL, { title: newListTitle }, {
// //                 headers: { 'x-auth-token': token }
// //             });
// //             setNewListTitle('');
// //             fetchLists(); // Refresh sidebar
// //             alert('List created!');
// //         } catch (err) {
// //             alert('Failed to create list');
// //         }
// //     };
// //
// //     const handleDeleteList = async (listId) => {
// //         if (!window.confirm('Delete this entire list?')) return;
// //         try {
// //             await axios.delete(`${API_URL}/${listId}`, {
// //                 headers: { 'x-auth-token': token }
// //             });
// //             const remainingLists = lists.filter(l => l._id !== listId);
// //             setLists(remainingLists);
// //             setActiveList(remainingLists[0] || null);
// //         } catch (err) {
// //             alert('Failed to delete list');
// //         }
// //     };
// //
// //     const removeBook = async (bookId) => {
// //         try {
// //             const res = await axios.patch(`${API_URL}/${activeList._id}/remove`,
// //                 { bookId },
// //                 { headers: { 'x-auth-token': token } }
// //             );
// //             // The backend returns { message, list: updatedList }
// //             setActiveList(res.data.list);
// //
// //             // Sync the main lists array so the count updates in sidebar
// //             setLists(lists.map(l => l._id === activeList._id ? res.data.list : l));
// //         } catch (err) {
// //             alert('Could not remove book');
// //         }
// //     };
// //
// //     return (
// //         <div className="container-fluid py-4" style={{ backgroundColor: '#fdfaf6', minHeight: '90vh' }}>
// //             <div className="row">
// //                 {/* Sidebar: List Management */}
// //                 <div className="col-md-3">
// //                     <div className="card shadow-sm border-0 mb-4">
// //                         <div className="card-header text-white" style={{ backgroundColor: '#002147' }}>
// //                             <h5 className="mb-0">My Collections</h5>
// //                         </div>
// //                         <div className="card-body">
// //                             <form onSubmit={handleCreateList} className="mb-3">
// //                                 <div className="input-group">
// //                                     <input
// //                                         type="text"
// //                                         className="form-control form-control-sm"
// //                                         placeholder="New list title..."
// //                                         value={newListTitle}
// //                                         onChange={(e) => setNewListTitle(e.target.value)}
// //                                     />
// //                                     <button className="btn btn-sm text-white" style={{ backgroundColor: '#C5A059' }} type="submit">+</button>
// //                                 </div>
// //                             </form>
// //
// //                             <div className="list-group list-group-flush">
// //                                 {lists.map(list => (
// //                                     <button
// //                                         key={list._id}
// //                                         className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${activeList?._id === list._id ? 'active' : ''}`}
// //                                         onClick={() => setActiveList(list)}
// //                                         style={activeList?._id === list._id ? { backgroundColor: '#f4ece1', color: '#002147', borderLeft: '4px solid #C5A059' } : {}}
// //                                     >
// //                                         <span>📁 {list.title}</span>
// //                                         <span className="badge rounded-pill bg-secondary">{list.booksIds?.length || 0}</span>
// //                                     </button>
// //                                 ))}
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //
// //                 {/* Main Content: Books in Selected List */}
// //                 <div className="col-md-9">
// //                     {activeList ? (
// //                         <div className="card shadow-sm border-0">
// //                             <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
// //                                 <h3 className="mb-0" style={{ color: '#002147', fontFamily: 'serif' }}>{activeList.title}</h3>
// //                                 <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteList(activeList._id)}>
// //                                     Delete List
// //                                 </button>
// //                             </div>
// //                             <div className="card-body">
// //                                 {activeList.booksIds?.length > 0 ? (
// //                                     <div className="table-responsive">
// //                                         <table className="table align-middle">
// //                                             <thead>
// //                                             <tr>
// //                                                 <th>Book Title</th>
// //                                                 <th>Author</th>
// //                                                 <th className="text-end">Actions</th>
// //                                             </tr>
// //                                             </thead>
// //                                             <tbody>
// //                                             {activeList.booksIds.map(book => (
// //                                                 <tr key={book._id}>
// //                                                     <td className="fw-bold">{book.title}</td>
// //                                                     <td>{book.author}</td>
// //                                                     <td className="text-end">
// //                                                         <button
// //                                                             className="btn btn-sm btn-link text-danger"
// //                                                             onClick={() => removeBook(book._id)}
// //                                                         >
// //                                                             Remove
// //                                                         </button>
// //                                                     </td>
// //                                                 </tr>
// //                                             ))}
// //                                             </tbody>
// //                                         </table>
// //                                     </div>
// //                                 ) : (
// //                                     <div className="text-center py-5">
// //                                         <p className="text-muted">No books in this list yet.</p>
// //                                         <a href="/books" className="btn text-white" style={{ backgroundColor: '#C5A059' }}>Browse Library</a>
// //                                     </div>
// //                                 )}
// //                             </div>
// //                         </div>
// //                     ) : (
// //                         <div className="text-center py-5 bg-white rounded shadow-sm">
// //                             <h4 className="text-muted">Select a list or create a new one to get started.</h4>
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };
// //
// // export default UserLists;
//
//
//
//
// import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import { AuthContext } from '../context/AuthContext';
// import { Link } from 'react-router-dom';
//
// const UserLists = () => {
//     // State management
//     const [lists, setLists] = useState([]);
//     const [activeList, setActiveList] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [newListTitle, setNewListTitle] = useState('');
//
//     const { user } = useContext(AuthContext);
//     const token = localStorage.getItem('token');
//     const API_URL = 'http://localhost:5000/api/lists';
//
//     // Initial Load
//     useEffect(() => {
//         fetchLists();
//     }, []);
//
//     // 1. GET ALL LISTS
//     const fetchLists = async () => {
//         setLoading(true);
//         try {
//             const res = await axios.get(API_URL, {
//                 headers: { 'x-auth-token': token }
//             });
//             setLists(res.data);
//             // Auto-select the first list if none is active
//             if (res.data.length > 0 && !activeList) {
//                 setActiveList(res.data[0]);
//             }
//         } catch (err) {
//             console.error('Error fetching lists:', err);
//         }
//         setLoading(false);
//     };
//
//     // 2. CREATE NEW LIST
//     const handleCreateList = async (e) => {
//         e.preventDefault();
//         if (!newListTitle.trim()) return;
//
//         try {
//             const res = await axios.post(API_URL,
//                 { title: newListTitle },
//                 { headers: { 'x-auth-token': token } }
//             );
//             setNewListTitle('');
//             await fetchLists(); // Refresh the sidebar
//             alert('New list created successfully!');
//         } catch (err) {
//             alert('Failed to create list');
//         }
//     };
//
//     // 3. DELETE ENTIRE LIST
//     const handleDeleteList = async (listId) => {
//         if (!window.confirm('Are you sure you want to delete this entire list?')) return;
//
//         try {
//             await axios.delete(`${API_URL}/${listId}`, {
//                 headers: { 'x-auth-token': token }
//             });
//
//             const remainingLists = lists.filter(l => l._id !== listId);
//             setLists(remainingLists);
//
//             // Move user to another list or null
//             if (activeList?._id === listId) {
//                 setActiveList(remainingLists[0] || null);
//             }
//             alert('List deleted');
//         } catch (err) {
//             alert('Failed to delete list');
//         }
//     };
//
//     // 4. REMOVE BOOK FROM LIST (PATCH)
//     const removeBook = async (bookId) => {
//         try {
//             const res = await axios.patch(`${API_URL}/${activeList._id}/remove`,
//                 { bookId },
//                 { headers: { 'x-auth-token': token } }
//             );
//
//             // Backend returns { message, list: updatedListWithPopulatedBooks }
//             const updatedList = res.data.list;
//
//             // Update active view
//             setActiveList(updatedList);
//
//             // Sync the sidebar list counts
//             setLists(lists.map(l => l._id === updatedList._id ? updatedList : l));
//         } catch (err) {
//             alert('Could not remove the book');
//         }
//     };
//
//     return (
//         <div className="container-fluid py-5" style={{ backgroundColor: '#fdfaf6', minHeight: '100vh' }}>
//             <div className="container">
//                 <div className="row g-4">
//
//                     {/* LEFT SIDEBAR: List Navigation */}
//                     <div className="col-md-4 col-lg-3">
//                         <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
//                             <div className="p-3 text-white" style={{ backgroundColor: '#002147' }}>
//                                 <h5 className="mb-0 fw-bold">My Collections</h5>
//                             </div>
//
//                             <div className="card-body bg-white">
//                                 <form onSubmit={handleCreateList} className="mb-4">
//                                     <label className="small fw-bold text-muted mb-1">CREATE NEW</label>
//                                     <div className="input-group shadow-sm">
//                                         <input
//                                             type="text"
//                                             className="form-control border-end-0"
//                                             placeholder="List name..."
//                                             value={newListTitle}
//                                             onChange={(e) => setNewListTitle(e.target.value)}
//                                             style={{ fontSize: '0.9rem' }}
//                                         />
//                                         <button
//                                             className="btn border-start-0"
//                                             type="submit"
//                                             style={{ backgroundColor: '#fff', color: '#C5A059', border: '1px solid #ced4da' }}
//                                         >
//                                             <span className="fw-bold">+</span>
//                                         </button>
//                                     </div>
//                                 </form>
//
//                                 <div className="nav flex-column nav-pills">
//                                     {lists.length === 0 && <p className="text-muted small text-center">No lists created yet.</p>}
//                                     {lists.map(list => (
//                                         <div
//                                             key={list._id}
//                                             onClick={() => setActiveList(list)}
//                                             className={`d-flex justify-content-between align-items-center p-3 mb-2 rounded-3 pointer-event shadow-sm transition-all`}
//                                             style={{
//                                                 cursor: 'pointer',
//                                                 border: activeList?._id === list._id ? '1px solid #C5A059' : '1px solid #eee',
//                                                 backgroundColor: activeList?._id === list._id ? '#fdf8ee' : '#fff',
//                                                 transition: '0.3s'
//                                             }}
//                                         >
//                                             <span className="fw-bold" style={{ color: activeList?._id === list._id ? '#C5A059' : '#2c3e50' }}>
//                                                 📁 {list.title}
//                                             </span>
//                                             <span className="badge rounded-pill text-dark" style={{ backgroundColor: '#f0e3ca' }}>
//                                                 {list.booksIds?.length || 0}
//                                             </span>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* RIGHT CONTENT: Selected List Books */}
//                     <div className="col-md-8 col-lg-9">
//                         {activeList ? (
//                             <div className="card border-0 shadow-sm rounded-4">
//                                 <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
//                                     <div>
//                                         <h2 className="display-6 fw-bold mb-0" style={{ color: '#002147', fontFamily: "'Playfair Display', serif" }}>
//                                             {activeList.title}
//                                         </h2>
//                                         <small className="text-muted">Total Books: {activeList.booksIds?.length || 0}</small>
//                                     </div>
//                                     <button
//                                         className="btn btn-sm btn-outline-danger px-3 rounded-pill"
//                                         onClick={() => handleDeleteList(activeList._id)}
//                                     >
//                                         Delete List
//                                     </button>
//                                 </div>
//
//                                 <div className="card-body p-4">
//                                     {activeList.booksIds?.length > 0 ? (
//                                         <div className="table-responsive">
//                                             <table className="table table-hover align-middle">
//                                                 <thead className="table-light">
//                                                 <tr>
//                                                     <th style={{ color: '#8e7f68' }}>TITLE</th>
//                                                     <th style={{ color: '#8e7f68' }}>AUTHOR</th>
//                                                     <th className="text-end" style={{ color: '#8e7f68' }}>ACTIONS</th>
//                                                 </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                 {activeList.booksIds.map(book => (
//                                                     <tr key={book._id}>
//                                                         <td>
//                                                             <div className="fw-bold" style={{ color: '#2c3e50' }}>{book.title}</div>
//                                                             <span className="badge bg-light text-dark border">{book.category}</span>
//                                                         </td>
//                                                         <td className="text-muted">{book.author}</td>
//                                                         <td className="text-end">
//                                                             <button
//                                                                 className="btn btn-link text-danger text-decoration-none small fw-bold"
//                                                                 onClick={() => removeBook(book._id)}
//                                                             >
//                                                                 REMOVE
//                                                             </button>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     ) : (
//                                         <div className="text-center py-5">
//                                             <div className="mb-3" style={{ fontSize: '3rem' }}>📖</div>
//                                             <h5 className="text-muted">This list is currently empty</h5>
//                                             <Link to="/books" className="btn mt-3 text-white px-4 rounded-pill" style={{ backgroundColor: '#C5A059' }}>
//                                                 Browse Library
//                                             </Link>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="d-flex flex-column align-items-center justify-content-center bg-white rounded-4 shadow-sm p-5" style={{ minHeight: '400px' }}>
//                                 <div className="mb-3" style={{ fontSize: '4rem' }}>📂</div>
//                                 <h3 className="text-muted">No list selected</h3>
//                                 <p className="text-muted">Select a collection from the sidebar or create a new one.</p>
//                             </div>
//                         )}
//                     </div>
//
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default UserLists;


import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserLists = () => {
    const [lists, setLists] = useState([]);
    const [allBooks, setAllBooks] = useState([]); // General Library
    const [activeList, setActiveList] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const [viewMode, setViewMode] = useState('myList'); // 'myList' or 'browse'

    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('token');
    const API_URL = 'http://localhost:5000/api/lists';

    useEffect(() => {
        fetchLists();
        fetchAllBooks();
    }, []);

    const fetchLists = async () => {
        try {
            const res = await axios.get(API_URL, { headers: { 'x-auth-token': token } });
            setLists(res.data);
            if (res.data.length > 0 && !activeList) setActiveList(res.data[0]);
        } catch (err) { console.error(err); }
    };

    const fetchAllBooks = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/books');
            setAllBooks(res.data);
        } catch (err) { console.error(err); }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;
        try {
            await axios.post(API_URL, { title: newListTitle }, { headers: { 'x-auth-token': token } });
            setNewListTitle('');
            fetchLists();
        } catch (err) { alert('Failed to create list'); }
    };

    const addBookToList = async (bookId) => {
        if (!activeList) return alert("Please select or create a list first!");
        try {
            const res = await axios.patch(`${API_URL}/${activeList._id}/add`,
                { bookId },
                { headers: { 'x-auth-token': token } }
            );
            setActiveList(res.data.list);
            setLists(lists.map(l => l._id === activeList._id ? res.data.list : l));
            alert("Book added!");
        } catch (err) { alert("Book already in list or error occurred"); }
    };

    const removeBook = async (bookId) => {
        try {
            const res = await axios.patch(`${API_URL}/${activeList._id}/remove`,
                { bookId },
                { headers: { 'x-auth-token': token } }
            );
            setActiveList(res.data.list);
            setLists(lists.map(l => l._id === activeList._id ? res.data.list : l));
        } catch (err) { alert('Error removing book'); }
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