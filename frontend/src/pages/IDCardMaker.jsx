import { useSearchParams, Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function IDCardMaker() {
  const [searchParams] = useSearchParams();
  
  // Optional: Get member data if you pass it via URL
  const memberName = searchParams.get('name') || '';
  const memberId = searchParams.get('id') || '';

  // Optional: Listen for messages from the iframe (if the ID card app supports it)
  useEffect(() => {
    const handleMessage = (event) => {
      // 🔒 SECURITY: Only accept messages from the trusted ID card app domain
      if (event.origin !== 'https://codesmartngidcardmaker-frontend.vercel.app') return;
      
      console.log('Message from ID Card App:', event.data);
      // You could handle events like 'card_generated' here
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Build the URL for the iframe (add query params if the app supports them)
  const iframeUrl = `https://codesmartngidcardmaker-frontend.vercel.app/login${
    memberName ? `?name=${encodeURIComponent(memberName)}` : ''
  }${memberId ? `&id=${encodeURIComponent(memberId)}` : ''}`;

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <div style={{
        padding: '1rem 1.5rem',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, color: '#065f46' }}>ID Card Generator</h2>
        <Link to="/members" className="btn" style={{ background: '#6b7280' }}>
          ← Back to Members
        </Link>
      </div>

      {/* Embedded ID Card Maker */}
      <iframe
        src={iframeUrl}
        title="ID Card Maker"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          borderRadius: '0 0 8px 8px'
        }}
        allow="clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
