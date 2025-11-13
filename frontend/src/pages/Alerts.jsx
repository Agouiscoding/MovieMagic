import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { getAlerts, updateAlerts } from '../api/flaskClient.js';

export default function Alerts() {
  const { user, idToken, loading } = useAuth();
  const [form, setForm] = useState({ frequency: 'weekly', keywords: '', channels: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    async function run() {
      if (!idToken) return;
      setErr(''); setOk('');
      try {
        const a = await getAlerts({ idToken });
        setForm({ frequency: a.frequency || 'weekly', keywords: a.keywords || '', channels: a.channels || '' });
      } catch (e) { setErr(e.message); }
    }
    run();
  }, [idToken]);

  async function handleSave(e) {
    e.preventDefault();
    setErr(''); setOk('');
    try {
      await updateAlerts({ ...form, idToken });
      setOk('Saved');
    } catch (e) { setErr(e.message); }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 24 }}>Please login first.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>Alert Preferences</h2>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      {ok && <p style={{ color: 'green' }}>{ok}</p>}
      <form onSubmit={handleSave} style={{ display: 'grid', gap: 10 }}>
        <label>
          Frequency
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <label>
          Keywords (comma separated)
          <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
        </label>
        <label>
          Channels (e.g., email,push)
          <input value={form.channels} onChange={(e) => setForm({ ...form, channels: e.target.value })} />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

