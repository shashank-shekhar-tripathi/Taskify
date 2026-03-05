import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth, useTheme } from '../App';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.user, data.tokens);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <span className="theme-icon sun">☀️</span>
            <span className="theme-icon moon">🌙</span>
          </button>
        </div>
        <div className="auth-logo">
          <h1>✦ Taskify</h1>
          <p>Sign in to manage your tasks</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input name="username" value={form.username} onChange={handle} placeholder="your_username" autoComplete="username" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && <div className="form-error">⚠ {error}</div>}
          <button className="btn-primary" style={{ marginTop: 24 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
