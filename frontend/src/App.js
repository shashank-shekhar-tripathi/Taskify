import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TodoApp from './components/TodoApp';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const login = (userData, tokens) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    // Preserve theme preference after logout
    localStorage.setItem('theme', theme);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        {/* Animated background orbs */}
        <div className="bg-orbs"><div className="orb-3" /></div>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/*" element={user ? <TodoApp /> : <Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
