import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    password: '', // Empty by default
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onFileChange = (e) => setProfilePicture(e.target.files[0]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('phone', form.phone);
      if (form.password) formData.append('password', form.password); // Only send if typed
      if (profilePicture) formData.append('profilePicture', profilePicture);

      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(data.user); // Update global state (updates Navbar instantly)
      setMsg('Profile updated successfully!');
      setForm({ ...form, password: '' }); // Clear password field
      setProfilePicture(null);
      
      // Optional: Navigate back to dashboard after 1.5 seconds
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Edit Profile</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Update your personal information or change your password.
      </p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Current Image Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>Change Picture</label>
            <input type="file" accept="image/*" onChange={onFileChange} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={onChange} required style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Phone Number</label>
          <input name="phone" value={form.phone} onChange={onChange} style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>New Password</label>
          <input name="password" type="password" placeholder="Leave blank to keep current password" value={form.password} onChange={onChange} style={{ width: '100%' }} />
        </div>

        {msg && <p className="ok">{msg}</p>}
        {err && <p className="error">{err}</p>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" className="btn" disabled={isSubmitting} style={{ flex: 1 }}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
