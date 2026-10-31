import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>{t('login')}</h2>
      <input placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} required />
      {err && <p className="error">{err}</p>}
      <button className="btn">{t('login')}</button>
    </form>
  );
}
