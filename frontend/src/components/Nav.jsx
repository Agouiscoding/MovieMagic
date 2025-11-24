import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Nav() {
  const { user, logout } = useAuth();

  return (
    <div className="nav-bar">
      <div className="nav-inner">
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/trending">Trending</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/alerts">Alerts</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <div className="nav-spacer" />
        <div className="nav-user">
          {user ? (
            <>
              <span>{user.email}</span>
              <button className="btn btn-ghost" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </div>
      </div>
    </div>
  );
}

