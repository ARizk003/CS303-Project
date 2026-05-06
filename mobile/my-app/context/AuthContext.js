import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (token && userData) {
        setUser({ token, ...JSON.parse(userData) });
      } else if (token) {
        setUser({ token });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token, userData) => {
    try {
      await AsyncStorage.setItem('token', token);
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser({ token, ...userData });
      } else {
        setUser({ token });
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const signup = async ({ username, email, password }) => {
    if (!emailRegex.test(email)) {
      return { success: false, msg: 'Enter a valid email address' };
    }
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/register`, {
        username,
        email,
        password,
      });
      await login(res.data.token, res.data.user);
      return { success: true };
    } catch (err) {
      console.log(err.response?.data || err.message);
      return { success: false, msg: err.response?.data?.msg || 'Signup failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, signup }}>
      {children}
    </AuthContext.Provider>
  );
};