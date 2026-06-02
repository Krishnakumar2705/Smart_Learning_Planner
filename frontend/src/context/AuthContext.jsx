import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check token
  useEffect(() => {
    const storedUser = localStorage.getItem('slp_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Configure global Axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      } catch (err) {
        console.error('Failed to parse stored user session:', err);
        localStorage.removeItem('slp_user');
      }
    }
    setLoading(false);
  }, []);

  // Email Register
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, { username, email, password });
      const data = response.data;
      setUser(data);
      localStorage.setItem('slp_user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Email Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const data = response.data;
      setUser(data);
      localStorage.setItem('slp_user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Invalid email or password.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Google Login Simulation
  const googleLoginSimulate = async () => {
    setLoading(true);
    try {
      // Simulate random user details for a beautiful, responsive sandbox experience
      const emails = ['placement_crack@gmail.com', 'topper_student@gmail.com', 'consistent_learner@gmail.com'];
      const names = ['Karan Sharma', 'Preeti Patel', 'Aditya Sen'];
      const randomIdx = Math.floor(Math.random() * names.length);
      
      const email = emails[randomIdx];
      const username = names[randomIdx];
      const googleId = `g_${Math.floor(100000 + Math.random() * 900000)}`;
      const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${username.replace(' ', '')}`;

      const response = await axios.post(`${API_URL}/google`, {
        email,
        username,
        googleId,
        avatar
      });
      
      const data = response.data;
      setUser(data);
      localStorage.setItem('slp_user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Google Auth simulation failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('slp_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLoginSimulate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
