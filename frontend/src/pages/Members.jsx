import { useEffect, useState, useMemo } from 'react';
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

  // 👇 NEW: Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const updateRole = async (id, newRole) => {
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const removeMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // 👇 NEW: The Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Match (Name or Email)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        u.fullName.toLowerCase().includes(searchLower) || 
        u.email.toLowerCase().includes(searchLower);

      // 2. Role Match
      const matchesRole = filterRole === 'all' || u.role === filterRole;

      // 3. Status Match
      let matchesStatus = true;
      if (filterStatus === 'approved') matchesStatus = u.isApproved === true;
      if (filterStatus === 'pending') matchesStatus = u.isApproved === false;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  return (
    <div>
      <h2>{t('members')}</h2>

      {/* CREATE MEMBER FORM */}
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

      <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #eee' }} />

      {/* 👇 NEW: SEARCH & FILTER CONTROLS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 Search by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '1', minWidth: '200px', padding: '10px' }}
        />
        
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ padding: '10px' }}>
          <option value="all">All Roles</option>
          <option value="member">Member</option>
          <option value="wardOfficer">Ward Officer</option>
          <option value="lgaOfficer">LGA Officer</option>
          <option value="stateAdmin">State Admin</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px' }}>
          <option value="all">All Statuses</option>
          <option value="approved">Approved (✅)</option>
          <option value="pending">Pending (⏳)</option>
        </select>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
        Showing {filteredUsers.length} of {users.length} members
      </p>

      {/* MEMBERS TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => {
            const isSelf = u._id === user.id;
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
          
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No members found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
