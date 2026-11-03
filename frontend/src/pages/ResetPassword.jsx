import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function ResetPassword() {
  const { token } = useParams(); // Gets the token from the URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');

    if (password !== confirmPassword) {
      return setErr('Passwords do not match');
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setMsg(data.message);
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
    } catch (e) {
      setErr(e.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h2>Reset Password</h2>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
        Enter your new password below.
      </p>
      
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="password" 
          placeholder="New Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          minLength={6}
        />
        <input 
          type="password" 
          placeholder="Confirm New Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
          minLength={6}
        />
        
        {msg && <p className="ok">{msg}</p>}
        {err && <p className="error">{err}</p>}
        
        <button className="btn" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
        <Link to="/login" style={{ color: '#0d9488', fontWeight: 'bold' }}>Back to Login</Link>
      </p>
    </div>
  );
}
