import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Members() {
  const { user } = useAuth();
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'member' });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/users').then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      setMsg('Member created');
      setForm({ fullName: '', email: '', password: '', role: 'member' });
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed');
    }
  };

  const approve = async (id) => { await api.patch(`/users/${id}/approve`); load(); };

  return (
    <div>
      <h2>{t('members')}</h2>

      <form className="card" onSubmit={create}>
        <h3>Register member (officer)</h3>
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
              <td>{u.fullName}</td>
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
