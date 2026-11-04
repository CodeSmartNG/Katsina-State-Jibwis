import { useState } from 'react';
import { useAuth } from '../services/auth.jsx';
import { api } from '../services/api.js';

export default function Donate() {
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    donorName: user?.fullName || '',
    email: user?.email || '',
    amount: '',
    purpose: 'General Donation'
  });
  
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDonate = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const { data } = await api.post('/donations/initialize', form);
      
      // Redirect the user to Paystack's secure checkout page
      window.location.href = data.authorization_url;

    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  return (
    <div className="donate-wrapper">
      <div className="donate-card">
        <div className="donate-header">
          <h2>Support JIBWIS Katsina State</h2>
          <p>Your generous donation helps us spread the true message of Islam, build mosques, and support the community.</p>
        </div>

        <form onSubmit={handleDonate} className="donate-form">
          <div className="form-group">
            <label>Full Name</label>
            <input name="donorName" value={form.donorName} onChange={onChange} placeholder="e.g. Kabir Alkasim" required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={onChange} placeholder="For your receipt" required />
          </div>

          <div className="form-group">
            <label>Amount (₦ Naira)</label>
            <input name="amount" type="number" min="100" value={form.amount} onChange={onChange} placeholder="Minimum ₦100" required />
          </div>

          <div className="form-group">
            <label>Purpose</label>
            <select name="purpose" value={form.purpose} onChange={onChange}>
              <option value="General Donation">General Donation</option>
              <option value="Mosque Building">Mosque Building</option>
              <option value="Da'wah (Outreach)">Da'wah (Outreach)</option>
              <option value="Orphans & Widows">Orphans & Widows</option>
              <option value="Zakat / Sadaqah">Zakat / Sadaqah</option>
            </select>
          </div>

          {err && <p className="error">{err}</p>}

          <button type="submit" className="btn-donate" disabled={loading}>
            {loading ? 'Redirecting to Paystack...' : 'Donate Now 🔒'}
          </button>
        </form>
      </div>
    </div>
  );
}
