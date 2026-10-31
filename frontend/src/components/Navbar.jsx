import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Navbar() {
  const { user, logout, isOfficer } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  // Helper for active link styles
  const linkClass = ({ isActive }) => (isActive ? 'nav-item active' : 'nav-item');

  return (
    <nav className="navbar-modern">
      <div className="nav-container">
        
        {/* Brand */}
        <div className="brand">
          <NavLink to="/" onClick={() => setIsOpen(false)}>
            <span className="brand-dot"></span>
            {t('appName')}
          </NavLink>
        </div>

        {/* Mobile Hamburger Button */}
        <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✕' : '☰'}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links-wrapper ${isOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <NavLink to="/announcements" className={linkClass} onClick={() => setIsOpen(false)}>
              {t('announcements')}
            </NavLink>
            <NavLink to="/activities" className={linkClass} onClick={() => setIsOpen(false)}>
              {t('activities')}
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={linkClass} onClick={() => setIsOpen(false)}>
                {t('dashboard')}
              </NavLink>
            )}
            {isOfficer && (
              <NavLink to="/members" className={linkClass} onClick={() => setIsOpen(false)}>
                {t('members')}
              </NavLink>
            )}
          </div>

          <div className="nav-actions">
            {/* Language Switcher */}
            <select 
              className="lang-select"
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="en">English 🇬🇧</option>
              <option value="ha">Hausa 🇳🇬</option>
            </select>

            {/* User Info / Auth Buttons */}
            {user ? (
              <div className="user-section">
                <div className="user-chip">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="nav-avatar" />
                  ) : (
                    <div className="nav-avatar fallback">{user.fullName.charAt(0).toUpperCase()}</div>
                  )}
                  <div className="user-text">
                    <span className="user-name">{user.fullName}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <NavLink to="/login" className="btn-outline" onClick={() => setIsOpen(false)}>
                  {t('login')}
                </NavLink>
                <NavLink to="/register" className="btn-solid" onClick={() => setIsOpen(false)}>
                  {t('register')}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
