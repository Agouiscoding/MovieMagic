// frontend/src/components/Nav.jsx
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "./Nav.css";
export default function Nav() {
  const { user, signOut } = useAuth();

  return (
    <div className="nav-bar">
      <div className="nav-inner">
        {/* Logo + brand */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-circle">MM</div>
          <span className="nav-logo-text">MovieMagic</span>
        </Link>

        {/* Main nav links */}
        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/trending"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            Trending
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            Favorites
          </NavLink>
          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            Alerts
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            Profile
          </NavLink>
        </nav>

        <div className="nav-spacer" />

        {/* User area */}
        <div className="nav-user">
          {user ? (
            <>
              <span className="nav-user-email">{user.email}</span>
              <button className="btn btn-ghost nav-signout" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <Link className="nav-link nav-link-auth" to="/login">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
