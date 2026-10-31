import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Navbar() {
  const { user, logout, isOfficer } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="brand">
        <Link to="/">{t('appName')}</Link>
      </div>
      <div className="nav-links">
        <Link to="/announcements">{t('announcements')}</Link>
        <Link to="/activities">{t('activities')}</Link>
        {user && <Link to="/dashboard">{t('dashboard')}</Link>}
        {isOfficer && <Link to="/members">{t('members')}</Link>}
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="ha">Hausa</option>
        </select>
        {user ? (
          <>
            <span className="user-chip">{user.fullName} ({user.role})</span>
            <button
              className="btn"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              {t('logout')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login">{t('login')}</Link>
            <Link to="/register" className="btn">{t('register')}</Link>
          </>
        )}
      </div>
    </nav>
  );
}
