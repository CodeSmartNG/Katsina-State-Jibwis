import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Activities() {
  const { user, isOfficer } = useAuth();
  const { t, lang } = useLang();
  
  const [items, setItems] = useState([]);
  const [myRsvps, setMyRsvps] = useState({});
  const [form, setForm] = useState({ title: '', titleHa: '', description: '', descriptionHa: '', date: '', location: '', scope: 'national' });
  const [msg, setMsg] = useState('');

  // State for Admin viewing attendees
  const [showAttendees, setShowAttendees] = useState(null); 
  const [attendees, setAttendees] = useState([]);

  const loadActivities = () => api.get('/activities').then((r) => setItems(r.data));
  const loadMyRsvps = () => {
    if (!user) return;
    api.get('/rsvps/me').then((res) => {
      const rsvpMap = {};
      res.data.forEach(r => { rsvpMap[r.activity] = r.status; });
      setMyRsvps(rsvpMap);
    }).catch(console.error);
  };

  useEffect(() => { 
    loadActivities(); 
    loadMyRsvps();
  }, [user]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const submit = async (e) => {
    e.preventDefault();
    await api.post('/activities', form);
    setForm({ title: '', titleHa: '', description: '', descriptionHa: '', date: '', location: '', scope: 'national' });
    loadActivities();
  };

  // Handle RSVP Click
  const handleRsvp = async (activityId, status) => {
    if (!user) return alert("Please log in to RSVP.");
    try {
      await api.post(`/rsvps/${activityId}`, { status });
      // Update local state instantly
      setMyRsvps(prev => ({ ...prev, [activityId]: status }));
    } catch (err) {
      alert('Failed to save RSVP');
    }
  };

  // Fetch Attendees (Admin only)
  const viewAttendees = async (activityId) => {
    try {
      const { data } = await api.get(`/rsvps/activity/${activityId}`);
      setAttendees(data);
      setShowAttendees(activityId);
    } catch (err) {
      alert('Failed to load attendees');
    }
  };

  return (
    <div>
      <h2>{t('activities')}</h2>

      {/* CREATE ACTIVITY FORM (Officers/Admins) */}
      {isOfficer && (
        <form className="card" onSubmit={submit}>
          <h3>{t('createActivity')}</h3>
          <input name="title" placeholder={`${t('title')} (EN)`} value={form.title} onChange={onChange} required />
          <input name="titleHa" placeholder={`${t('title')} (HA)`} value={form.titleHa} onChange={onChange} />
          <textarea name="description" placeholder="Description (EN)" value={form.description} onChange={onChange} />
          <textarea name="descriptionHa" placeholder="Description (HA)" value={form.descriptionHa} onChange={onChange} />
          <input name="date" type="datetime-local" value={form.date} onChange={onChange} required />
          <input name="location" placeholder={t('location')} value={form.location} onChange={onChange} />
          <select name="scope" value={form.scope} onChange={onChange}>
            <option value="national">National</option>
            <option value="state">State</option>
            <option value="lga">LGA</option>
            <option value="ward">Ward</option>
          </select>
          <button className="btn">{t('submit')}</button>
        </form>
      )}

      {/* ACTIVITIES LIST */}
      <div className="grid">
        {items.map((a) => {
          const userRsvp = myRsvps[a._id]; // Check if user has RSVP'd

          return (
            <article key={a._id} className="card">
              <h3>{lang === 'ha' && a.titleHa ? a.titleHa : a.title}</h3>
              <p>{lang === 'ha' && a.descriptionHa ? a.descriptionHa : a.description}</p>
              <small>{new Date(a.date).toLocaleString()} · {a.location} · {a.scope}</small>

              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '15px 0' }} />

              {/* RSVP BUTTONS */}
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Will you attend?</p>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleRsvp(a._id, 'attending')}
                    className="btn btn-sm"
                    style={{ backgroundColor: userRsvp === 'attending' ? '#22c55e' : '#f3f4f6', color: userRsvp === 'attending' ? 'white' : '#374151', flex: 1 }}
                  >
                    ✅ Attending
                  </button>
                  <button 
                    onClick={() => handleRsvp(a._id, 'maybe')}
                    className="btn btn-sm"
                    style={{ backgroundColor: userRsvp === 'maybe' ? '#f59e0b' : '#f3f4f6', color: userRsvp === 'maybe' ? 'white' : '#374151', flex: 1 }}
                  >
                    🟡 Maybe
                  </button>
                  <button 
                    onClick={() => handleRsvp(a._id, 'not attending')}
                    className="btn btn-sm"
                    style={{ backgroundColor: userRsvp === 'not attending' ? '#ef4444' : '#f3f4f6', color: userRsvp === 'not attending' ? 'white' : '#374151', flex: 1 }}
                  >
                    ❌ Can't Go
                  </button>
                </div>
              </div>

              {/* ADMIN VIEW ATTENDEES BUTTON */}
              {isOfficer && (
                <button 
                  onClick={() => viewAttendees(a._id)}
                  className="btn btn-sm btn-outline" 
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  👥 View Attendees
                </button>
              )}
            </article>
          );
        })}
      </div>

      {/* ATTENDEES MODAL */}
      {showAttendees && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Attendee List</h3>
              <button className="btn btn-sm" onClick={() => setShowAttendees(null)}>✕ Close</button>
            </div>
            
            {attendees.length === 0 ? (
              <p>No one has RSVP'd yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((rsvp) => (
                    <tr key={rsvp._id}>
                      <td>
                        <div style={{ fontWeight: 'bold' }}>{rsvp.user?.fullName || 'Unknown'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{rsvp.user?.phone || 'No phone'}</div>
                      </td>
                      <td style={{ 
                        color: rsvp.status === 'attending' ? '#22c55e' : rsvp.status === 'maybe' ? '#f59e0b' : '#ef4444',
                        fontWeight: 'bold', textTransform: 'capitalize' 
                      }}>
                        {rsvp.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
