// frontend/src/router.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider.jsx';
import Search from './pages/Search';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Alerts from './pages/Alerts.jsx';
import Favorites from './pages/Favorites.jsx';
import Nav from './components/Nav.jsx';
import Trending from './pages/Trending.jsx';

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </div>

      </BrowserRouter>
    </AuthProvider>
  );
}
