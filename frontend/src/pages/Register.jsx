import { useState } from 'react';
import { api } from '../services/api.js';
import { useLang } from '../services/i18n.jsx';

export default function Register() {
  const { t } = useLang();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', state: '', lga: '', ward: '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      const { data } = await api.post('/auth/register', form);
      setMsg(data.message);
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>{t('register')}</h2>
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
