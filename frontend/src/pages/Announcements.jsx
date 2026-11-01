import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Announcements() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', titleHa: '', body: '', bodyHa: '', scope: 'national' });
  const [msg, setMsg] = useState('');
  
  // State for editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', titleHa: '', body: '', bodyHa: '', scope: 'national' });

  const load = () => api.get('/announcements').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  // CREATE
  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/announcements', form);
      setForm({ title: '', titleHa: '', body: '', bodyHa: '', scope: 'national' });
      load();
      setMsg('Announcement published successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish');
    }
  };

  // DELETE (StateAdmin only)
  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement? This cannot be undone.')) return;
    try {
      await api.delete(`/announcements/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // OPEN EDIT MODE
  const startEdit = (ann) => {
    setEditingId(ann._id);
    setEditForm({
      title: ann.title || '',
      titleHa: ann.titleHa || '',
      body: ann.body || '',
      bodyHa: ann.bodyHa || '',
      scope: ann.scope || 'national'
    });
  };

  // SAVE EDIT
  const saveEdit = async (id) => {
    try {
      await api.put(`/announcements/${id}`, editForm);
      setEditingId(null); // Close edit mode
      load(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update announcement');
    }
  };

  const isOfficer = ['wardOfficer', 'lgaOfficer', 'stateAdmin'].includes(user?.role);
  const canDelete = user?.role === 'stateAdmin';

  return (
    <div>
      <h2>{t('announcements')}</h2>

      {/* CREATE FORM */}
      {isOfficer && (
        <form className="card" onSubmit={submit} style={{ marginBottom: '2rem' }}>
          <h3>{t('createAnnouncement')}</h3>
          <input name="title" placeholder={`${t('title')} (English)`} value={form.title} onChange={onChange} required />
          <input name="titleHa" placeholder={`${t('title')} (Hausa)`} value={form.titleHa} onChange={onChange} />
          <textarea name="body" placeholder={`${t('body')} (English)`} value={form.body} onChange={onChange} required />
          <textarea name="bodyHa" placeholder={`${t('body')} (Hausa)`} value={form.bodyHa} onChange={onChange} />
          
          <select name="scope" value={form.scope} onChange={onChange}>
            <option value="national">National</option>
            <option value="state">State</option>
            <option value="lga">LGA</option>
            <option value="ward">Ward</option>
          </select>
          
          <button className="btn">{t('publish')}</button>
          {msg && <p className="ok">{msg}</p>}
        </form>
      )}

      {/* ANNOUNCEMENTS LIST */}
      <div className="grid">
        {items.map((ann) => (
          <article key={ann._id} className="card" style={{ position: 'relative' }}>
            
            {/* EDIT MODE UI */}
            {editingId === ann._id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ margin: 0 }}>Editing Announcement</h4>
                <input name="title" placeholder="Title (EN)" value={editForm.title} onChange={onEditChange} />
                <input name="titleHa" placeholder="Title (HA)" value={editForm.titleHa} onChange={onEditChange} />
                <textarea name="body" placeholder="Body (EN)" value={editForm.body} onChange={onEditChange} style={{ minHeight: '80px' }} />
                <textarea name="bodyHa" placeholder="Body (HA)" value={editForm.bodyHa} onChange={onEditChange} style={{ minHeight: '80px' }} />
                <select name="scope" value={editForm.scope} onChange={onEditChange}>
                  <option value="national">National</option>
                  <option value="state">State</option>
                  <option value="lga">LGA</option>
                  <option value="ward">Ward</option>
                </select>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn" style={{ flex: 1 }} onClick={() => saveEdit(ann._id)}>Save Changes</button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              
              /* NORMAL DISPLAY UI */
              <>
                <h3>{lang === 'ha' && ann.titleHa ? ann.titleHa : ann.title}</h3>
                <p>{lang === 'ha' && ann.bodyHa ? ann.bodyHa : ann.body}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                  <small style={{ color: '#666' }}>
                    <strong style={{ textTransform: 'capitalize', color: '#0d9488' }}>{ann.scope}</strong> · {new Date(ann.createdAt).toLocaleDateString()}
                  </small>

                  {/* EDIT & DELETE BUTTONS (State Admin only) */}
                  {user?.role === 'stateAdmin' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-sm" 
                        style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 8px' }}
                        onClick={() => startEdit(ann)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm" 
                        style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px' }}
                        onClick={() => deleteAnnouncement(ann._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

          </article>
        ))}
      </div>
    </div>
  );
}
