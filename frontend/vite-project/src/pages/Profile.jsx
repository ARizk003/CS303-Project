// Profile.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editName, setEditName] = useState(false);
    const [newName, setNewName] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    
    const token = localStorage.getItem('token');
    const API_URL = 'http://localhost:5000';

    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { message: 'Please sign in to view your profile.' } });
            return;
        }
        fetchProfile();
    }, [user?.id]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/users/profile`, {
                headers: { 'x-auth-token': token }
            });
            setProfile(res.data);
            setNewName(res.data.name || user?.name || '');

        // if (setUser) {
        //     console.log("setUser true");
        // }
            const updatedUser = { 
                ...user, 
                name: res.data.name,
                image: res.data.image 
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
        setLoading(false);
    };

    const handleNameUpdate = async () => {
        if (!newName.trim()) return;
        try {
            const res = await axios.put(`${API_URL}/api/users/profile`, 
                { name: newName },
                { headers: { 'x-auth-token': token } }
            );
            setProfile(res.data);
            if (setUser) setUser({ ...user, name: newName });
            setEditName(false);
        } catch (err) {
            alert('Failed to update name');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await axios.post(`${API_URL}/api/users/profile/image`, 
                formData,
                { 
                    headers: { 
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    } 
                }
            );
            setProfile({ ...profile, image: res.data.image });
                const updatedUser = { ...user, image: res.data.image };
                console.log(updatedUser);
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            alert('Failed to upload image, ' + err.name + ": " + err.message);
        }
        setUploading(false);
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status" />
                <p className="mt-3 text-muted">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="container py-5" style={{ backgroundColor: '#fdfaf6', minHeight: '100vh' }}>
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 text-white text-center" style={{ backgroundColor: '#002147' }}>
                            <div className="mb-3 position-relative d-inline-block">
                                <img
                                    src={profile?.image }
                                    alt=""
                                    className="rounded-circle border border-3 border-white"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                                <button
                                    className="btn btn-sm rounded-circle position-absolute bottom-0 end-0 p-1 shadow"
                                    style={{ backgroundColor: '#C5A059', color: '#fff', width: '30px', height: '30px' , position: 'absolute', top:'70px'}}
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={uploading}
                                    title="Change photo"
                                >
                                    {uploading ? '...' : '📷'}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {editName ? (
                                <div className="d-flex gap-2 justify-content-center">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm rounded-pill"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        style={{ maxWidth: '200px' }}
                                        autoFocus
                                    />
                                    <button
                                        className="btn btn-sm btn-light rounded-pill px-3"
                                        onClick={handleNameUpdate}
                                    >
                                        ✓
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-light rounded-pill px-3"
                                        onClick={() => {
                                            setEditName(false);
                                            setNewName(profile?.name || '');
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                    <h4 className="fw-bold mb-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {profile?.name || user?.name}
                                    </h4>
                                    <button
                                        className="btn btn-sm p-0 text-white opacity-75"
                                        onClick={() => setEditName(true)}
                                        title="Edit name"
                                        style={{ fontSize: '0.8rem' }}
                                    >
                                        ✎
                                    </button>
                                </div>
                            )}
                            <p className="mb-0 opacity-75 small mt-1">{profile?.role || user?.role}</p>
                        </div>

                        {/* Details */}
                        <div className="card-body p-4">
                            <div className="mb-3">
                                <small className="text-muted fw-bold d-block mb-1">EMAIL</small>
                                <p className="mb-0 text-dark">{profile?.email || user?.email}</p>
                            </div>

                            <div className="mb-3">
                                <small className="text-muted fw-bold d-block mb-1">ROLE</small>
                                <p className="mb-0">
                                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: profile?.role === 'admin' ? '#002147' : '#C5A059', color: '#fff' }}>
                                        {profile?.role || user?.role || 'User'}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <small className="text-muted fw-bold d-block mb-1">JOINED</small>
                                <p className="mb-0 text-dark">
                                    {profile?.createdAt
                                        ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;