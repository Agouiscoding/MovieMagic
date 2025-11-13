import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { bootstrapUser, getProfile, updateProfile } from '../api/flaskClient.js';

export default function Profile() {
  const { user, idToken, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    async function run() {
      if (!idToken) return;
      setErr(''); setOk('');
      try {
        await bootstrapUser({ idToken });
        const p = await getProfile({ idToken });
        setProfile(p);
      } catch (e) {
        setErr(e.message);
      }
    }
    run();
  }, [idToken]);

  async function handleSave(e) {
    e.preventDefault();
    setErr(''); setOk('');
    try {
      await updateProfile({ display_name: profile.display_name, photo_url: profile.photo_url, idToken });
      setOk('Saved');
    } catch (e) { setErr(e.message); }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 24 }}>Please login first.</div>;
  if (!profile) return <div style={{ padding: 24 }}>Loading profile...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>Profile</h2>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      {ok && <p style={{ color: 'green' }}>{ok}</p>}
      <form onSubmit={handleSave} style={{ display: 'grid', gap: 10 }}>
        <label>
          UID
          <input value={profile.uid} disabled />
        </label>
        <label>
          Email
          <input value={profile.email || ''} disabled />
        </label>
        <label>
          Display Name
          <input value={profile.display_name || ''} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
        </label>
        <label>
          Photo URL
          <input value={profile.photo_url || ''} onChange={(e) => setProfile({ ...profile, photo_url: e.target.value })} />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

