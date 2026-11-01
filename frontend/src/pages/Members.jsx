
import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Members() {
  const { user } = useAuth();
  const { t } = useLang();

  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'member',
    rank: 'Member',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [msg, setMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const load = () =>
    api.get('/users').then((r) => setUsers(r.data));

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (e) =>
    setProfilePicture(e.target.files[0]);

  // CREATE MEMBER
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
      formData.append('rank', form.rank);

      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      await api.post('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsg('Member created successfully');

      setForm({
        fullName: '',
        email: '',
        password: '',
        role: 'member',
        rank: 'Member',
      });

      setProfilePicture(null);

      const fileInput = document.getElementById('memberPicInput');
      if (fileInput) fileInput.value = '';

      load();

    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to create member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // APPROVE MEMBER
  const approve = async (id) => {
    try {
      await api.patch(`/users/${id}/approve`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve member');
    }
  };

  // UPDATE ROLE
  const updateRole = async (id, newRole) => {
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  // REMOVE MEMBER
  const removeMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}? This cannot be undone.`)) return;

    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // PROMOTE / DEMOTE
  const handleRankChange = (id, currentRole, action) => {
    const ranks = ['member', 'wardOfficer', 'lgaOfficer', 'stateAdmin'];
    const currentIndex = ranks.indexOf(currentRole);

    if (action === 'promote' && currentIndex < ranks.length - 1) {
      updateRole(id, ranks[currentIndex + 1]);
    } else if (action === 'demote' && currentIndex > 0) {
      updateRole(id, ranks[currentIndex - 1]);
    }
  };

  // ROLE BADGE
  const getRoleBadge = (role) => {
    const styles = {
      stateAdmin: { background: '#fef2f2', color: '#ef4444', label: 'State Admin' },
      lgaOfficer: { background: '#eff6ff', color: '#3b82f6', label: 'LGA Officer' },
      wardOfficer: { background: '#f0fdf4', color: '#22c55e', label: 'Ward Officer' },
      member: { background: '#f3f4f6', color: '#6b7280', label: 'Member' },
    };

    const item = styles[role] || styles.member;

    return (
      <span style={{
        background: item.background,
        color: item.color,
        padding: '4px 8px',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '0.8rem',
      }}>
        {item.label}
      </span>
    );
  };

  // SEARCH AND FILTER
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        (u.fullName || '').toLowerCase().includes(searchLower) ||
        (u.email || '').toLowerCase().includes(searchLower) ||
        (u.rank || '').toLowerCase().includes(searchLower);

      const matchesRole =
        filterRole === 'all' || u.role === filterRole;

      let matchesStatus = true;

      if (filterStatus === 'approved') {
        matchesStatus = u.isApproved === true;
      }

      if (filterStatus === 'pending') {
        matchesStatus = u.isApproved === false;
      }

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // EXPORT CSV
  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      return alert('No members to export.');
    }

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Role',
      'Rank',
      'State',
      'LGA',
      'Ward',
      'Status',
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const csvRows = filteredUsers.map((u) => [
      u.fullName,
      u.email,
      u.phone,
      u.role,
      u.rank || 'Member',
      u.state,
      u.lga,
      u.ward,
      u.isApproved ? 'Approved' : 'Pending',
    ].map(escapeCSV).join(','));

    const csvContent = [
      headers.join(','),
      ...csvRows,
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute(
      'download',
      `JIBWIS_Members_${new Date().toISOString().split('T')[0]}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>{t('members')}</h2>

      {/* REGISTER MEMBER */}
      <form className="card" onSubmit={create}>
        <h3>Register member (officer)</h3>

        <div style={{ marginBottom: '10px' }}>
          <label style={{
            display: 'block',
            marginBottom: '5px',
            fontSize: '0.9rem',
            color: '#555',
          }}>
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

        <input
          name="fullName"
          placeholder={t('fullName')}
          value={form.fullName}
          onChange={onChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder={t('email')}
          value={form.email}
          onChange={onChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder={t('password')}
          value={form.password}
          onChange={onChange}
          required
        />

        {/* ROLE */}
        <select
          name="role"
          value={form.role}
          onChange={onChange}
        >
          <option value="member">Member (Lowest Rank)</option>

          {user.role !== 'wardOfficer' && (
            <option value="wardOfficer">Ward Officer</option>
          )}

          {['lgaOfficer', 'stateAdmin'].includes(user.role) && (
            <option value="lgaOfficer">LGA Officer</option>
          )}

          {user.role === 'stateAdmin' && (
            <option value="stateAdmin">State Admin</option>
          )}
        </select>

        {/* ORGANIZATIONAL RANK */}
        <input
          name="rank"
          placeholder="Rank / Title (e.g. Secretary)"
          value={form.rank}
          onChange={onChange}
        />

        {msg && (
          <p className={msg.includes('successfully') ? 'ok' : 'error'}>
            {msg}
          </p>
        )}

        <button className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : t('submit')}
        </button>
      </form>

      <hr style={{
        margin: '2rem 0',
        border: 'none',
        borderTop: '1px solid #eee',
      }} />

      {/* SEARCH, FILTER AND EXPORT */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '1', minWidth: '200px', padding: '10px' }}
        />

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ padding: '10px' }}
        >
          <option value="all">All Roles</option>
          <option value="stateAdmin">State Admin</option>
          <option value="lgaOfficer">LGA Officer</option>
          <option value="wardOfficer">Ward Officer</option>
          <option value="member">Member</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '10px' }}
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>

        <button
          type="button"
          onClick={exportToCSV}
          className="btn"
          style={{ backgroundColor: '#10b981' }}
        >
          ⬇️ Export CSV
        </button>
      </div>

      <p style={{
        fontSize: '0.9rem',
        color: '#666',
        marginBottom: '10px',
      }}>
        Showing {filteredUsers.length} of {users.length} members
      </p>

      {/* MEMBERS TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Rank / Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => {
            const isSelf = u._id === user.id;
            const canManage = user.role === 'stateAdmin' && !isSelf;
            const isTopRank = u.role === 'stateAdmin';
            const isBottomRank = u.role === 'member';

            return (
              <tr key={u._id}>
                <td>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    {u.profilePicture ? (
                      <img
                        src={u.profilePicture}
                        alt={u.fullName}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        fontSize: '12px',
                      }}>
                        {(u.fullName || '?').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span>{u.fullName}</span>
                  </div>
                </td>

                <td>{u.email}</td>

                <td>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}>
                    {getRoleBadge(u.role)}
                    <span>{u.rank || 'Member'}</span>

                    {canManage && (
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          type="button"
                          disabled={isTopRank}
                          onClick={() => handleRankChange(u._id, u.role, 'promote')}
                          title="Promote Role"
                        >
                          ⬆️
                        </button>

                        <button
                          type="button"
                          disabled={isBottomRank}
                          onClick={() => handleRankChange(u._id, u.role, 'demote')}
                          title="Demote Role"
                        >
                          ⬇️
                        </button>
                      </div>
                    )}
                  </div>
                </td>

                <td>{u.isApproved ? '✅ Approved' : '⏳ Pending'}</td>

                <td>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}>
                    {!u.isApproved && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => approve(u._id)}
                      >
                        {t('approve')}
                      </button>
                    )}

                    {canManage && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                        }}
                        onClick={() => removeMember(u._id, u.fullName)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {filteredUsers.length === 0 && (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#666',
                }}
              >
                No members found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
