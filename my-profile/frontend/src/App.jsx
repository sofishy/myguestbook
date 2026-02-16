import { useEffect, useState } from 'react';
import './App.css';

// Use environment variable for the backend URL
const API_URL = import.meta.env.VITE_API_URL || '/api/guestbook';

export default function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: '', message: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setEntries(data);
      setError('');
    } catch (err) {
      console.error('Error loading entries:', err);
      setError('Failed to load guestbook entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      setForm({ name: '', message: '' });
      setEditingId(null);
      await loadEntries();
    } catch (err) {
      console.error('Error submitting entry:', err);
      setError('Failed to submit entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      await loadEntries();
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setForm({ name: entry.name, message: entry.message });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', message: '' });
  };

  return (
    <div className="app">
      <h1>My Profile & Guestbook</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="guestbook-form">
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          required
          disabled={loading}
        />
        <textarea
          placeholder="Your Message"
          value={form.message}
          onChange={e => setForm({...form, message: e.target.value})}
          required
          disabled={loading}
          rows="3"
        />
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (editingId ? 'Update Entry' : 'Sign Guestbook')}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <hr />
      
      {loading && <p>Loading entries...</p>}
      
      <div className="entries">
        {entries.map(entry => (
          <div key={entry.id} className="entry">
            <div className="entry-header">
              <strong>{entry.name}</strong>
              <span className="entry-date">
                {new Date(entry.created_at).toLocaleString()}
              </span>
            </div>
            <p className="entry-message">{entry.message}</p>
            <div className="entry-actions">
              <button onClick={() => startEdit(entry)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(entry.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
        {entries.length === 0 && !loading && (
          <p className="no-entries">No guestbook entries yet. Be the first to sign!</p>
        )}
      </div>
    </div>
  );
}