import { Link } from 'react-router-dom';
import { useLang } from '../services/i18n.jsx';

export default function Home() {
  const { t } = useLang();
  return (
    <div className="hero">
      <h1>{t('appName')}</h1>
      <p>Jama'atu Izalatil Bid'ah Wa'iqamatis Sunnah — Members & Activities Portal</p>
      <div className="hero-actions">
        <Link to="/register" className="btn">{t('register')}</Link>
        <Link to="/login" className="btn btn-outline">{t('login')}</Link>
        <Link to="/announcements" className="btn btn-outline">{t('announcements')}</Link>
      </div>
    </div>
  );
}
