import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [status, setStatus] = useState('verifying'); // verifying, success, failed

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      return;
    }

    // Verify the payment with the backend
    api.get(`/donations/verify/${reference}`)
      .then((res) => {
        if (res.data.success) setStatus('success');
        else setStatus('failed');
      })
      .catch(() => setStatus('failed'));
  }, [reference]);

  return (
    <div className="donate-wrapper">
      <div className="donate-card" style={{ textAlign: 'center', padding: '50px 30px' }}>
        {status === 'verifying' && (
          <>
            <h2 style={{ color: '#6b7280' }}>⏳ Verifying your donation...</h2>
            <p>Please do not close this page.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ color: '#059669', marginBottom: '10px' }}>Donation Successful!</h2>
            <p style={{ color: '#4b5563', marginBottom: '30px' }}>
              JazakAllah Khair! Your donation has been received successfully. May Allah bless you abundantly.
            </p>
            <Link to="/" className="btn">Return to Home</Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
            <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Payment Failed</h2>
            <p style={{ color: '#4b5563', marginBottom: '30px' }}>
              We could not verify your donation. If you were debited, please contact the admin.
            </p>
            <Link to="/donate" className="btn">Try Again</Link>
          </>
        )}
      </div>
    </div>
  );
}
