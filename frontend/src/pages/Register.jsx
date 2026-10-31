import { useState } from 'react';
import { api } from '../services/api.js';
import { useLang } from '../services/i18n.jsx';

export default function Register() {
  const { t } = useLang();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', state: '', lga: '', ward: '',
  });
  const [profilePicture, setProfilePicture] = useState(null); // 👈 New state for image
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onFileChange = (e) => setProfilePicture(e.target.files[0]);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      // 1. Create FormData
      const formData = new FormData();
      
      // 2. Append all text fields
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });
      
      // 3. Append the image if one is selected
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      // 4. Send FormData (Axios will automatically set the correct headers)
      const { data } = await api.post('/auth/register', formData);
      
      setMsg(data.message);
      
      // Optional: Reset the form and file input after success
      setForm({ fullName: '', email: '', password: '', phone: '', state: '', lga: '', ward: '' });
      setProfilePicture(null);
      document.getElementById('profilePicInput').value = ''; // Resets the file input UI

    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>{t('register')}</h2>
      
      {/* File Input for Profile Picture */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
          Profile Picture (Optional)
        </label>
        <input 
          id="profilePicInput"
          type="file" 
          accept="image/*" 
          onChange={onFileChange} 
          style={{ padding: '5px' }}
        />
      </div>

      <input name="fullName" placeholder={t('fullName')} value={form.fullName} onChange={onChange} required />
      <input name="email" type="email" placeholder={t('email')} value={form.email} onChange={onChange} required />
      <input name="password" type="password" placeholder={t('password')} value={form.password} onChange={onChange} required />
      <input name="phone" placeholder={t('phone')} value={form.phone} onChange={onChange} />
      <input name="state" placeholder={t('state')} value={form.state} onChange={onChange} />
      <input name="lga" placeholder={t('lga')} value={form.lga} onChange={onChange} />
      <input name="ward" placeholder={t('ward')} value={form.ward} onChange={onChange} />
      
      {msg && <p className="ok">{msg}</p>}
      {err && <p className="error">{err}</p>}
      
      <button className="btn">{t('submit')}</button>
    </form>
  );
}
