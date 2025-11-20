import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';

export default function Login() {
  const { user, signIn, register, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  if (user) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Logged in</h2>
        <p>{user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setErr('');
    try { await signIn(email, password); } catch (e) { setErr(e.message); }
  }
  async function handleRegister(e) {
    e.preventDefault();
    setErr('');
    try { await register(email, password); } catch (e) { setErr(e.message); }
  }

  return (
    <div style={{ padding: 24, maxWidth: 360 }}>
      <h2>Login / Register</h2>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <form style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSignIn}>Sign in</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      </form>
    </div>
  );
}

