import { useState } from 'react';
import { api } from '../services/api.js';
import { useLang } from '../services/i18n.jsx';

export default function Register() {
  const { t } = useLang();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    state: '',
    lga: '',
    ward: '',
    rank: '', // 👈 Added rank
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (e) =>
    setProfilePicture(e.target.files[0]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const { data } = await api.post('/auth/register', formData);

      setMsg(data.message);

      // Reset form
      setForm({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        state: '',
        lga: '',
        ward: '',
        rank: '',
      });

      setProfilePicture(null);
      document.getElementById('profilePicInput').value = '';
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>{t('register')}</h2>

      {/* Profile Picture */}
      <div style={{ marginBottom: '10px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '5px',
            fontSize: '0.9rem',
            color: '#555',
          }}
        >
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

      <input
        name="phone"
        placeholder={t('phone')}
        value={form.phone}
        onChange={onChange}
      />

      <input
        name="state"
        placeholder={t('state')}
        value={form.state}
        onChange={onChange}
      />

      <input
        name="lga"
        placeholder={t('lga')}
        value={form.lga}
        onChange={onChange}
      />

      <input
        name="ward"
        placeholder={t('ward')}
        value={form.ward}
        onChange={onChange}
      />

      {/* 👇 New Rank Field */}
      <input
        name="rank"
        placeholder="Organizational Rank (e.g. Chairman, Member)"
        value={form.rank}
        onChange={onChange}
      />

      {msg && <p className="ok">{msg}</p>}
      {err && <p className="error">{err}</p>}

      <button className="btn">{t('submit')}</button>
    </form>
  );
}
