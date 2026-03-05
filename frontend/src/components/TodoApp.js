import React, { useState, useEffect, useCallback } from 'react';
import { todosAPI } from '../api';
import { useAuth } from '../App';
import { format, isPast, parseISO } from 'date-fns';

const CATEGORIES = ['all', 'personal', 'work', 'shopping', 'health', 'other'];
const PRIORITIES = ['all', 'high', 'medium', 'low'];

const CATEGORY_ICONS = { personal: '👤', work: '💼', shopping: '🛒', health: '💪', other: '📌', all: '📋' };
const PRIORITY_ICONS = { high: '🔴', medium: '🟡', low: '🟢' };

function TodoModal({ todo, onClose, onSave }) {
  const initial = todo || { title: '', description: '', priority: 'medium', category: 'personal', due_date: '' };
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    try {
      const payload = { ...form, due_date: form.due_date || null };
      let result;
      if (todo?.id) {
        result = await todosAPI.update(todo.id, payload);
      } else {
        result = await todosAPI.create(payload);
      }
      onSave(result.data, !!todo?.id);
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{todo?.id ? '✏️ Edit Task' : '✦ New Task'}</h3>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Title *</label>
            <input className="form-input" name="title" value={form.title} onChange={handle} placeholder="What needs to be done?" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-input" name="description" value={form.description || ''} onChange={handle} placeholder="Add more details…" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select className="form-input" name="priority" value={form.priority} onChange={handle}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" name="category" value={form.category} onChange={handle}>
                <option value="personal">👤 Personal</option>
                <option value="work">💼 Work</option>
                <option value="shopping">🛒 Shopping</option>
                <option value="health">💪 Health</option>
                <option value="other">📌 Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input className="form-input" type="date" name="due_date" value={form.due_date || ''} onChange={handle} />
          </div>
          {error && <div className="form-error">⚠ {error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving…' : todo?.id ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const isOverdue = todo.due_date && !todo.completed && isPast(parseISO(todo.due_date));
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className={`priority-bar priority-${todo.priority}`} />
      <div
        className={`checkbox ${todo.completed ? 'checked' : ''}`}
        onClick={() => onToggle(todo)}
        title="Toggle complete"
      >
        {todo.completed && <span className="check-icon">✓</span>}
      </div>
      <div className="todo-body">
        <div className="todo-title">{todo.title}</div>
        {todo.description && <div className="todo-desc">{todo.description}</div>}
        <div className="todo-meta">
          <span className={`badge badge-priority-${todo.priority}`}>
            {PRIORITY_ICONS[todo.priority]} {todo.priority}
          </span>
          <span className="badge badge-category">
            {CATEGORY_ICONS[todo.category]} {todo.category}
          </span>
          {todo.due_date && (
            <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
              {isOverdue ? '⚠ ' : '📅 '}
              {format(parseISO(todo.due_date), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>
      <div className="todo-actions">
        <button className="btn-icon edit" onClick={() => onEdit(todo)} title="Edit">✏</button>
        <button className="btn-icon" onClick={() => onDelete(todo.id)} title="Delete">🗑</button>
      </div>
    </div>
  );
}

export default function TodoApp() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, high_priority: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal] = useState(null); // null | 'new' | todo object
  const [editTodo, setEditTodo] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [todosRes, statsRes] = await Promise.all([todosAPI.getAll(), todosAPI.getStats()]);
      setTodos(todosRes.data.results || todosRes.data);
      setStats(statsRes.data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggle = async (todo) => {
    try {
      const { data } = await todosAPI.update(todo.id, { completed: !todo.completed });
      setTodos(p => p.map(t => t.id === todo.id ? data : t));
      setStats(p => ({
        ...p,
        completed: p.completed + (data.completed ? 1 : -1),
        pending: p.pending + (data.completed ? -1 : 1),
      }));
    } catch {}
  };

  const handleSave = (saved, isEdit) => {
    if (isEdit) {
      setTodos(p => p.map(t => t.id === saved.id ? saved : t));
    } else {
      setTodos(p => [saved, ...p]);
      setStats(p => ({ ...p, total: p.total + 1, pending: p.pending + 1 }));
    }
    setModal(null);
    setEditTodo(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const todo = todos.find(t => t.id === id);
      await todosAPI.delete(id);
      setTodos(p => p.filter(t => t.id !== id));
      setStats(p => ({
        ...p,
        total: p.total - 1,
        completed: todo?.completed ? p.completed - 1 : p.completed,
        pending: !todo?.completed ? p.pending - 1 : p.pending,
      }));
    } catch {}
  };

  const filtered = todos.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || t.category === filterCat;
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'completed' && t.completed) ||
      (filterStatus === 'pending' && !t.completed);
    return matchSearch && matchCat && matchStatus;
  });

  const progress = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const initials = user?.first_name ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">✦ Taskify</div>
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="name">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</div>
            <div className="email">{user?.email || '@' + user?.username}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-label">Filter by Status</div>
          {[['all','All Tasks'], ['pending','Pending'], ['completed','Completed']].map(([v, l]) => (
            <div key={v} className={`nav-item ${filterStatus === v ? 'active' : ''}`} onClick={() => setFilterStatus(v)}>
              <span className="nav-icon">{v === 'all' ? '📋' : v === 'pending' ? '⏳' : '✅'}</span>
              {l}
              <span className="nav-count">
                {v === 'all' ? stats.total : v === 'pending' ? stats.pending : stats.completed}
              </span>
            </div>
          ))}
          <div className="nav-label">Filter by Category</div>
          {CATEGORIES.map(cat => (
            <div key={cat} className={`nav-item ${filterCat === cat ? 'active' : ''}`} onClick={() => setFilterCat(cat)}>
              <span className="nav-icon">{CATEGORY_ICONS[cat]}</span>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <span>⎋</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="main-header fade-up">
          <h2>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'} {user?.first_name || user?.username} 👋</h2>
          <p>You have <strong>{stats.pending}</strong> pending tasks today.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Total Tasks', value: stats.total, icon: '📋' },
            { label: 'Completed', value: stats.completed, icon: '✅' },
            { label: 'Pending', value: stats.pending, icon: '⏳' },
            { label: 'High Priority', value: stats.high_priority, icon: '🔥' },
          ].map((s, i) => (
            <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-icon">{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Overall Progress</span>
            <span>{progress}% complete</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks…"
            />
          </div>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <button className="btn-add" onClick={() => { setEditTodo(null); setModal('new'); }}>
            <span>+</span> New Task
          </button>
        </div>

        {/* Todo List */}
        {loading ? (
          <>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ animationDelay: `${i * 0.1}s` }} />)}</>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>{todos.length === 0 ? 'No tasks yet!' : 'No matching tasks'}</h3>
            <p>{todos.length === 0 ? 'Click "New Task" to get started.' : 'Try adjusting your search or filters.'}</p>
          </div>
        ) : (
          <div className="todo-list">
            {filtered.map((todo, i) => (
              <div key={todo.id} style={{ animationDelay: `${i * 0.04}s` }}>
                <TodoItem
                  todo={todo}
                  onToggle={handleToggle}
                  onEdit={(t) => { setEditTodo(t); setModal('edit'); }}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '32px 0 8px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          letterSpacing: '0.03em'
        }}>
          Made with ❤️ by Shashank
        </div>

      </main>

      {/* Modal */}
      {(modal === 'new' || modal === 'edit') && (
        <TodoModal
          todo={modal === 'edit' ? editTodo : null}
          onClose={() => { setModal(null); setEditTodo(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
