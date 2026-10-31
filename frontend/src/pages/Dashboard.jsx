import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Dashboard() {
  const { user, isOfficer } = useAuth();
  const { t } = useLang();

  return (
    <div className="card">
      <h2>{t('welcome')}, {user.fullName}</h2>
      <p><strong>{t('email')}:</strong> {user.email}</p>
      <p><strong>{t('roles')}:</strong> {user.role}</p>
      <p><strong>{t('state')}:</strong> {user.state || '—'} · <strong>{t('lga')}:</strong> {user.lga || '—'} · <strong>{t('ward')}:</strong> {user.ward || '—'}</p>
      {isOfficer && <p>You can manage members, announcements and activities.</p>}
    </div>
  );
}
