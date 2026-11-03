import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useLang } from '../services/i18n.jsx';
import { useAuth } from '../services/auth.jsx';

export default function Home() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  
  const [leaders, setLeaders] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  
  // Admin upload states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState('');

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');

  const fetchLeaders = () => {
    api.get('/leaders').then((res) => setLeaders(res.data)).catch(console.error);
  };

  const fetchAnnouncements = () => {
    api.get('/announcements').then((res) => {
      // Get the latest 6 announcements for the carousel
      setRecentAnnouncements(res.data.slice(0, 6));
    }).catch(console.error);
  };

  useEffect(() => {
    fetchLeaders();
    fetchAnnouncements();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return setMsg('Please select an image.');
    
    setIsUploading(true);
    setMsg('');
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('title', title);
    formData.append('image', image);

    try {
      await api.post('/leaders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg('Leader added successfully!');
      setName(''); setTitle(''); setImage(null);
      document.getElementById('leaderImageInput').value = '';
      fetchLeaders();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteLeader = async (id) => {
    if(!window.confirm("Are you sure you want to remove this leader?")) return;
    await api.delete(`/leaders/${id}`);
    fetchLeaders();
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/leaders/${id}`, { name: editName, title: editTitle });
      setEditingId(null); 
      fetchLeaders();     
    } catch (err) {
      alert('Failed to update leader');
    }
  };

  // Duplicate arrays to make the infinite scroll seamless
  const carouselLeaders = leaders.length > 0 ? [...leaders, ...leaders, ...leaders] : [];
  const carouselAnnouncements = recentAnnouncements.length > 0 ? [...recentAnnouncements, ...recentAnnouncements, ...recentAnnouncements] : [];

  return (
    <div className="home-wrapper">
      {/* HERO SECTION */}
      <div className="hero">
        <h1>{t('appName')}</h1>
        <p>Jama'atu Izalatil Bid'ah Wa'iqamatis Sunnah — Members & Activities Portal</p>
        <div className="hero-actions">
          <Link to="/register" className="btn">{t('register')}</Link>
          <Link to="/announcements" className="btn btn-outline">{t('announcements')}</Link>
        </div>
      </div>

      {/* LEADERS CAROUSEL */}
      <div className="carousel-section">
        <h2>Our Leadership</h2>
        {leaders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No leaders added yet.</p>
        ) : (
          <div className="marquee-container">
            <div className="marquee-content">
              {carouselLeaders.map((leader, index) => (
                <div className="leader-card" key={`${leader._id}-${index}`}>
                  {editingId === leader._id ? (
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                      <h4 style={{ margin: 0 }}>Edit Leader</h4>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" style={{ width: '100%', padding: '8px' }} />
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" style={{ width: '100%', padding: '8px' }} />
                      <div style={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
                        <button className="btn btn-sm" onClick={() => saveEdit(leader._id)} style={{ flex: 1 }}>Save</button>
                        <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)} style={{ flex: 1 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img src={leader.imageUrl} alt={leader.name} />
                      <div className="leader-info">
                        <h3>{leader.name}</h3>
                        <p>{leader.title}</p>
                        {user?.role === 'stateAdmin' && (
                          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'center' }}>
                            <button className="btn btn-sm" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '5px 15px' }} onClick={() => { setEditingId(leader._id); setEditName(leader.name); setEditTitle(leader.title); }}>Edit</button>
                            <button className="btn btn-sm" style={{ backgroundColor: '#ef4444', color: 'white', padding: '5px 15px' }} onClick={() => deleteLeader(leader._id)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 👇 NEW: ANNOUNCEMENTS CAROUSEL */}
      <div className="carousel-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px', maxWidth: '1200px', margin: '0 auto 1.5rem auto', padding: '0 1rem' }}>
          <h2 style={{ margin: 0, color: '#065f46' }}>Latest News & Announcements</h2>
          <Link to="/announcements" style={{ color: '#0d9488', fontWeight: 'bold', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>

        {recentAnnouncements.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No announcements posted yet.</p>
        ) : (
          <div className="marquee-container">
            {/* Add a reverse animation class to make it scroll the opposite way of the leaders */}
            <div className="marquee-content reverse-scroll">
              {carouselAnnouncements.map((ann, index) => (
                <div className="announcement-card" key={`${ann._id}-${index}`}>
                  <div className="announcement-content">
                    <h3>{lang === 'ha' && ann.titleHa ? ann.titleHa : ann.title}</h3>
                    <p>{lang === 'ha' && ann.bodyHa ? ann.bodyHa : ann.body}</p>
                  </div>
                  <div className="announcement-footer">
                    <span>📅 {new Date(ann.createdAt).toLocaleDateString()}</span>
                    <span className="scope-badge">{ann.scope}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADMIN UPLOAD FORM */}
      {user?.role === 'stateAdmin' && (
        <div className="admin-upload-section card" style={{ marginTop: '3rem' }}>
          <h3>Admin: Add Leader Picture</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
            Add pictures to display them in the moving carousel.
          </p>
          <form onSubmit={handleUpload} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Leader Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ flex: 1 }} />
            <input type="text" placeholder="Title (e.g. State Chairman)" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ flex: 1 }} />
            <input id="leaderImageInput" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
            <button type="submit" className="btn" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Add Leader'}</button>
          </form>
          {msg && <p className="ok" style={{ marginTop: '10px' }}>{msg}</p>}
        </div>
      )}
    </div>
  );
}
