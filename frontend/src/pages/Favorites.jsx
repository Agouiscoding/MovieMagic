import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { listFavorites, removeFavorite } from '../api/flaskClient.js';

export default function Favorites() {
  const { user, idToken, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

  async function load() {
    if (!idToken) return;
    setErr('');
    try {
      const data = await listFavorites({ idToken });
      setItems(data);
    } catch (e) { setErr(e.message); }
  }

  useEffect(() => { load(); }, [idToken]);

  async function del(it) {
    try {
      await removeFavorite({ media_type: it.media_type, tmdb_id: it.tmdb_id, idToken });
      await load();
    } catch (e) { setErr(e.message); }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 24 }}>Please login first.</div>;

  return (
    <div className="container" style={{ padding: 24 }}>
      <h2>Favorites</h2>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      {!items.length && <p>No favorites yet.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 200px)', gap: 16 }}>
        {items.map((it) => (
          <div key={`${it.media_type}-${it.tmdb_id}`} style={{ width: 200 }}>
            <img alt={it.title} src={it.poster_path ? `https://image.tmdb.org/t/p/w200${it.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'} style={{ width: '100%', borderRadius: 8 }} />
            <div style={{ marginTop: 6 }}>
              <strong>{it.title}</strong>
            </div>
            <button onClick={() => del(it)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

