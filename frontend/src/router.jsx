// frontend/src/router.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider.jsx';
import Search from './pages/Search';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Alerts from './pages/Alerts.jsx';
import Favorites from './pages/Favorites.jsx';

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function Nav() {
  const { user, signOut } = useAuth();
  return (
    <div style={{ display: 'flex', gap: 12, padding: 10, borderBottom: '1px solid #eee' }}>
      <Link to="/">Home</Link>
      <Link to="/favorites">Favorites</Link>
      <Link to="/alerts">Alerts</Link>
      <Link to="/profile">Profile</Link>
      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <>
            <span style={{ marginRight: 8 }}>{user.email}</span>
            <button onClick={() => signOut()}>Sign out</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
}
