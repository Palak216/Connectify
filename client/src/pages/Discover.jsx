import { useEffect, useState } from 'react';
import { API_URL, getAuthHeaders } from '../config';

export default function Discover() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const loadUsers = async () => {
    try {
      setError('');
      const response = await fetch(`${API_URL}/users/discover?q=${encodeURIComponent(query)}`, { headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load users');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Could not load users');
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleFollow = async (id) => {
    setBusyId(id);
    try {
      const response = await fetch(`${API_URL}/users/${id}/follow`, { method: 'POST', headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not update follow');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Could not update follow');
    } finally {
      setBusyId('');
    }
  };

  return (
    <main className="container" style={{ marginTop: '30px', maxWidth: '760px' }}>
      <section className="glass-panel" style={{ padding: '24px' }}>
        <h1>Discover people</h1>
        <form onSubmit={(e) => { e.preventDefault(); loadUsers(); }} style={{ display: 'flex', gap: '10px', margin: '18px 0' }}>
          <input className="form-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search usernames" aria-label="Search usernames" />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
        {error && <p role="alert" style={{ color: 'var(--error)' }}>{error}</p>}
        {users.length === 0 && !error && <p style={{ color: 'var(--text-muted)' }}>No people found yet.</p>}
        <div style={{ display: 'grid', gap: '12px' }}>
          {users.map((user) => (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div className="avatar">{user.username?.[0]?.toUpperCase() || '?'}</div>
              <div style={{ flex: 1 }}>
                <strong>{user.username}</strong>
                {user.bio && <p style={{ color: 'var(--text-secondary)', margin: '4px 0' }}>{user.bio}</p>}
                <small style={{ color: 'var(--text-muted)' }}>{user.followersCount} followers · {user.followingCount} following</small>
              </div>
              <button className="btn btn-primary" disabled={busyId === user.id} onClick={() => toggleFollow(user.id)}>
                {busyId === user.id ? 'Please wait…' : 'Follow / Unfollow'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
