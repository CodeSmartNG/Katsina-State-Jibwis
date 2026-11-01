import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Dashboard() {
  const { user, isOfficer } = useAuth();
  const { t } = useLang();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Failed to load stats', err));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* PROFILE HEADER */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.fullName} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0d9488' }} />
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#9ca3af', border: '3px solid #d1d5db' }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 5px 0' }}>{t('welcome')}, {user.fullName}</h2>
            <p style={{ margin: 0, color: '#666' }}>{user.email}</p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ background: '#ccfbf1', color: '#0f766e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {user.role}
              </span>
              <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>
                {user.state || 'No State'} • {user.lga || 'No LGA'}
              </span>
            </div>
          </div>
          <Link to="/profile" className="btn">Edit Profile</Link>
        </div>
      </div>

      {/* STATISTICS GRID */}
      {stats && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>Portal Overview</h3>
          <div className="stats-grid">
            
            {/* Total Members */}
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>👥</div>
              <div>
                <p className="stat-label">Total Members</p>
                <h2 className="stat-number">{stats.totalMembers}</h2>
              </div>
            </div>

            {/* Pending Approvals (Only Officers see this) */}
            {isOfficer && (
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>⏳</div>
                <div>
                  <p className="stat-label">Pending Approvals</p>
                  <h2 className="stat-number">{stats.pendingMembers}</h2>
                </div>
              </div>
            )}

            {/* Total Announcements */}
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>📢</div>
              <div>
                <p className="stat-label">Announcements</p>
                <h2 className="stat-number">{stats.totalAnnouncements}</h2>
              </div>
            </div>

            {/* Total Activities */}
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>📅</div>
              <div>
                <p className="stat-label">Activities</p>
                <h2 className="stat-number">{stats.totalActivities}</h2>
              </div>
            </div>

            {/* Total Leaders */}
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>🖼️</div>
              <div>
                <p className="stat-label">Leaders Displayed</p>
                <h2 className="stat-number">{stats.totalLeaders}</h2>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* OFFICER ACTIONS */}
      {isOfficer && (
        <div className="card" style={{ background: '#f0fdfa', border: '1px solid #0d9488' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#065f46' }}>Quick Actions</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#0f766e' }}>
            You have administrative privileges. You can approve new members, post announcements, and manage leaders.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/members" className="btn">Manage Members</Link>
            <Link to="/announcements" className="btn" style={{ background: '#3b82f6' }}>Post Announcement</Link>
          </div>
        </div>
      )}

    </div>
  );
}
