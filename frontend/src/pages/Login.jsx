
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

      <input
        type="email"
        placeholder={t('email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder={t('password')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* Forgot Password Link */}
      <div style={{ textAlign: 'right', marginTop: '-10px' }}>
        <Link
          to="/forgot-password"
          style={{
            fontSize: '0.85rem',
            color: '#0d9488',
            textDecoration: 'none'
          }}
        >
          Forgot Password?
        </Link>
      </div>

      {err && <p className="error">{err}</p>}

      <button type="submit" className="btn">
        {t('login')}
      </button>
    </form>
  );
}
