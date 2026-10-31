import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Members() {
  const { user } = useAuth();
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'member' });
  const [profilePicture, setProfilePicture] = useState(null); // 👈 New state for image
  const [msg, setMsg] = useState('');

  const load = () => api.get('/users').then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onFileChange = (e) => setProfilePicture(e.target.files[0]);

  
  const create = async (e) => {
  e.preventDefault();
  setMsg('');
  try {
    const formData = new FormData();
    
    // 1. Explicitly append fields (safer than Object.keys)
    formData.append('fullName', form.fullName);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('role', form.role);

    // 2. Append image if selected
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    // 3. Send as FormData WITH explicit headers
    await api.post('/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    setMsg('Member created successfully');
    
    // 4. Reset form
    setForm({ fullName: '', email: '', password: '', role: 'member' });
    setProfilePicture(null);
    document.getElementById('memberPicInput').value = ''; 
    
    load();
  } catch (e) {
    console.error(e); // Log the full error to console for debugging
    setMsg(e.response?.data?.message || 'Failed to create member');
  }
};


  
  const approve = async (id) => { await api.patch(`/users/${id}/approve`); load(); };

  return (
    <div>
      <h2>{t('members')}</h2>

      <form className="card" onSubmit={create}>
        <h3>Register member (officer)</h3>
        
        {/* File Input */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
            Profile Picture (Optional)
          </label>
          <input 
            id="memberPicInput"
            type="file" 
            accept="image/*" 
            onChange={onFileChange} 
            style={{ padding: '5px' }}
          />
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
        <button className="btn">{t('submit')}</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>State</th><th>LGA</th><th>Ward</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              {/* Updated Name column with Avatar */}
              <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {u.profilePicture ? (
                  <img 
                    src={u.profilePicture} 
                    alt={u.fullName} 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '12px' }}
                  >
                    {u.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{u.fullName}</span>
              </td>
              
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.state || '—'}</td>
              <td>{u.lga || '—'}</td>
              <td>{u.ward || '—'}</td>
              <td>{u.isApproved ? '✅' : '⏳'}</td>
              <td>
                {!u.isApproved && (
                  <button className="btn btn-sm" onClick={() => approve(u._id)}>
                    {t('approve')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
