import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth, useTheme } from '../App';

export default function Register() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.username) e.username = 'Required';
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.user, data.tokens);
    } catch (err) {
      const d = err.response?.data || {};
      const msg = Object.values(d).flat().join(' ') || 'Registration failed.';
      setErrors({ general: msg });
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
          <p>Create your account</p>
        </div>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label>First Name</label>
              <input name="first_name" value={form.first_name} onChange={handle} placeholder="John" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="last_name" value={form.last_name} onChange={handle} placeholder="Doe" />
            </div>
          </div>
          <div className="form-group">
            <label>Username *</label>
            <input name="username" value={form.username} onChange={handle} placeholder="johndoe" />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="john@example.com" />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Min. 8 characters" />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          {errors.general && <div className="form-error">⚠ {errors.general}</div>}
          <button className="btn-primary" style={{ marginTop: 20 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
