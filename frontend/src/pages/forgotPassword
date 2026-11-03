import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setErr(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMsg(data.message + '. Please check your email inbox (and spam folder).');
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h2>Forgot Password</h2>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
        Enter your email address and we will send you a link to reset your password.
      </p>
      
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        
        {msg && <p className="ok">{msg}</p>}
        {err && <p className="error">{err}</p>}
        
        <button className="btn" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
        Remembered your password? <Link to="/login" style={{ color: '#0d9488', fontWeight: 'bold' }}>Log in</Link>
      </p>
    </div>
  );
}
