import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import UploadResume from './components/Resume/UploadResume';
import ResumeDetail from './components/Resume/ResumeDetail';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';
import Homepage from './components/Homepage/Homepage';
import Profile from './components/User/Profile';
import Settings from './components/User/Settings';

// API configuration - determine base URL based on environment
const apiBaseURL = process.env.NODE_ENV === 'production' 
  ? '/api' // In production, requests go to the same domain (handled by proxy)
  : 'http://localhost:5001/api'; // In development, point to the dev backend

axios.defaults.baseURL = apiBaseURL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on component mount
    const token = localStorage.getItem('token');
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (token) => {
    try {
      setError(null);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axios.get('/auth/me');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to authenticate. Please login again.');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      await loadUser(res.data.token);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to login. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const res = await axios.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      await loadUser(res.data.token);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to register. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar isAuthenticated={isAuthenticated} user={user} logout={logout} />
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
            {error}
            <button 
              className="float-right font-bold" 
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}
        
        <main className="container mx-auto px-4 py-8 pt-20">
          <Routes>
            <Route path="/" element={<Homepage />} />
            
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login login={login} />
            } />
            
            <Route path="/register" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Register register={register} />
            } />
            
            <Route path="/dashboard" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Profile user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/settings" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Settings user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/upload" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <UploadResume user={user} />
              </PrivateRoute>
            } />
            
            <Route path="/resume/:id" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <ResumeDetail />
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <AdminRoute isAuthenticated={isAuthenticated} user={user}>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            <Route path="/admin/users" element={
              <AdminRoute isAuthenticated={isAuthenticated} user={user}>
                <UserManagement />
              </AdminRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
