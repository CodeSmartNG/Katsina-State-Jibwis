import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Dashboard() {
  const { user, isOfficer } = useAuth();
  const { t } = useLang();

  return (
    <div className="card">
      {/* Profile Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        
        {/* Avatar Logic */}
        {user.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={user.fullName} 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '3px solid #0d9488' // Adds a nice brand-color ring
            }} 
          />
        ) : (
          <div 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              backgroundColor: '#e5e7eb', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '2.5rem', 
              color: '#9ca3af',
              border: '3px solid #d1d5db'
            }}
          >
            {user.fullName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Welcome Text */}
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>
            {t('welcome')}, {user.fullName}
          </h2>
          <p style={{ margin: 0, color: '#666' }}>{user.email}</p>
        </div>
      </div>

      {/* User Details Section */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <p><strong>{t('roles')}:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role}</span></p>
        <p>
          <strong>{t('state')}:</strong> {user.state || '—'} · <strong>{t('lga')}:</strong> {user.lga || '—'} · <strong>{t('ward')}:</strong> {user.ward || '—'}
        </p>
        
        {isOfficer && (
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0fdfa', borderRadius: '5px', color: '#065f46' }}>
            <p style={{ margin: 0 }}><strong>Officer Access:</strong> You can manage members, announcements and activities.</p>
          </div>
        )}
      </div>
    </div>
  );
}
