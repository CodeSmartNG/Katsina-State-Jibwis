import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Members() {
  const { user } = useAuth();
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'member' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [msg, setMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => api.get('/users').then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onFileChange = (e) => setProfilePicture(e.target.files[0]);

  const create = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('role', form.role);
      if (profilePicture) formData.append('profilePicture', profilePicture);

      await api.post('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setMsg('Member created successfully');
      setForm({ fullName: '', email: '', password: '', role: 'member' });
      setProfilePicture(null);
      document.getElementById('memberPicInput').value = ''; 
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to create member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const approve = async (id) => { 
    await api.patch(`/users/${id}/approve`); 
    load(); 
  };

  // 👇 NEW: Update Role (Promotion)
  const updateRole = async (id, newRole) => {
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      load(); // Refresh the table
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  // 👇 NEW: Remove Member
  const removeMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}? This cannot be undone.`)) return;
    
    try {
      await api.delete(`/users/${id}`);
      load(); // Refresh the table
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div>
      <h2>{t('members')}</h2>

      <form className="card" onSubmit={create}>
        <h3>Register member (officer)</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
            Profile Picture (Optional)
          </label>
          <input id="memberPicInput" type="file" accept="image/*" onChange={onFileChange} style={{ padding: '5px' }} />
        </div>

        <input name="fullName" placeholder={t('fullName')} value={form.fullName} onChange={onChange} required />
        <input name="email" type="email" placeholder={t('email')} value={form.email} onChange={onChange} required />
        <input name="password" type="password" placeholder={t('password')} value={form.password} onChange={onChange} required />
        
        <select name="role" value={form.role} onChange={onChange}>
          <option value="member">member</option>
          {user.role !== 'wardOfficer' && <option value="wardOfficer">wardOfficer</option>}
          {['lgaOfficer', 'stateAdmin'].includes(user.role) && <option value="lgaOfficer">lgaOfficer</option>}
          {user.role === 'stateAdmin' && <option value="stateAdmin">stateAdmin</option>}
        </select>
        
        {msg && <p className="ok">{msg}</p>}
        <button className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : t('submit')}
        </button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u._id === user.id; // Prevent admin from editing themselves
            const canManage = user.role === 'stateAdmin' && !isSelf;

            return (
              <tr key={u._id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {u.profilePicture ? (
                    <img src={u.profilePicture} alt={u.fullName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '12px' }}>
                      {u.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{u.fullName}</span>
                </td>
                
                <td>{u.email}</td>
                
                {/* 👇 ROLE DROPDOWN / TEXT */}
                <td>
                  {canManage ? (
                    <select 
                      value={u.role} 
                      onChange={(e) => updateRole(u._id, e.target.value)}
                      style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="member">member</option>
                      <option value="wardOfficer">wardOfficer</option>
                      <option value="lgaOfficer">lgaOfficer</option>
                      <option value="stateAdmin">stateAdmin</option>
                    </select>
                  ) : (
                    <span style={{ textTransform: 'capitalize' }}>{u.role}</span>
                  )}
                </td>

                <td>{u.isApproved ? '✅' : '⏳'}</td>
                
                {/* 👇 ACTION BUTTONS (Approve / Remove) */}
                <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {!u.isApproved && (
                    <button className="btn btn-sm" onClick={() => approve(u._id)}>
                      {t('approve')}
                    </button>
                  )}
                  {canManage && (
                    <button 
                      className="btn btn-sm" 
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                      onClick={() => removeMember(u._id, u.fullName)}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
