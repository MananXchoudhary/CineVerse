import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Film, LayoutDashboard, Film as MovieIcon, LogOut, ShieldAlert } from 'lucide-react';
import './Header.css';

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled glass-panel' : ''}`}>
      <div className="container header-container">
        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="logo">
          <Film className="logo-icon" />
          <span className="logo-text text-gradient">CineVerse</span>
        </Link>

        {isAuthenticated && (
          <nav className="nav-links">
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link to="/catalog" className={`nav-link ${isActive('/catalog')}`}>
              <MovieIcon size={18} />
              <span>Catalog</span>
            </Link>
          </nav>
        )}

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-profile-nav flex">
              <span className={`nav-role-badge ${(user?.role || '').toLowerCase().replace(' ', '-')}`}>
                {user?.role}
              </span>
              <span className="nav-username">{user?.username}</span>
              <button onClick={handleLogoutClick} className="nav-logout-btn flex-center" title="Log Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary btn-sm flex-center">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
