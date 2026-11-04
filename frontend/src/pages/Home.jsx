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

  const carouselLeaders = leaders.length > 0 ? [...leaders, ...leaders, ...leaders] : [];
  const carouselAnnouncements = recentAnnouncements.length > 0 ? [...recentAnnouncements, ...recentAnnouncements, ...recentAnnouncements] : [];

  return (
    <div className="home-wrapper fade-in">
      
      {/* 🌟 FANTASTIC HERO SECTION */}
      <section className="hero-fantastic">
        <div className="hero-content">
          <span className="hero-badge">Official Portal</span>
          <h1>{t('appName')}</h1>
          <p className="hero-subtitle">
            Jama'atu Izalatil Bid'ah Wa'iqamatis Sunnah <br/>
            <span style={{ fontSize: '0.9em', opacity: 0.9 }}>Katsina State Members & Activities Portal</span>
          </p>
          
          <div className="hero-actions">
            {!user ? (
              <>
                <Link to="/register" className="btn-hero-primary">Join Us Today</Link>
                <Link to="/announcements" className="btn-hero-outline">Read Announcements</Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-hero-primary">Go to Dashboard</Link>
            )}
          </div>
        </div>
      </section>

      {/* 👥 LEADERS CAROUSEL */}
      <section className="carousel-section">
        <div className="section-header">
          <h2>Our Leadership</h2>
          <p>Meet the dedicated individuals guiding our community.</p>
        </div>
        
        {leaders.length === 0 ? (
          <p className="empty-state">No leaders added yet.</p>
        ) : (
          <div className="marquee-container">
            <div className="marquee-content">
              {carouselLeaders.map((leader, index) => (
                <div className="leader-card" key={`${leader._id}-${index}`}>
                  {editingId === leader._id ? (
                    <div className="edit-mode-box">
                      <h4>Edit Leader</h4>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
                      <div className="edit-actions">
                        <button className="btn-sm btn-solid" onClick={() => saveEdit(leader._id)}>Save</button>
                        <button className="btn-sm btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="leader-img-wrapper">
                        <img src={leader.imageUrl} alt={leader.name} />
                      </div>
                      <div className="leader-info">
                        <h3>{leader.name}</h3>
                        <p>{leader.title}</p>
                        {user?.role === 'stateAdmin' && (
                          <div className="admin-actions-inline">
                            <button className="btn-edit" onClick={() => { setEditingId(leader._id); setEditName(leader.name); setEditTitle(leader.title); }}>✏️ Edit</button>
                            <button className="btn-delete" onClick={() => deleteLeader(leader._id)}>🗑️ Delete</button>
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
      </section>

      {/* 📢 ANNOUNCEMENTS CAROUSEL */}
      <section className="carousel-section bg-alt">
        <div className="section-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2>Latest News</h2>
              <p>Stay updated with the most recent announcements.</p>
            </div>
            <Link to="/announcements" className="view-all-link">View All →</Link>
          </div>
        </div>

        {recentAnnouncements.length === 0 ? (
          <p className="empty-state">No announcements posted yet.</p>
        ) : (
          <div className="marquee-container">
            <div className="marquee-content reverse-scroll">
              {carouselAnnouncements.map((ann, index) => (
                <div className="announcement-card" key={`${ann._id}-${index}`}>
                  <div className="announcement-content">
                    <h3>{lang === 'ha' && ann.titleHa ? ann.titleHa : ann.title}</h3>
                    <p>{lang === 'ha' && ann.bodyHa ? ann.bodyHa : ann.body}</p>
                  </div>
                  <div className="announcement-footer">
                    <span>📅 {new Date(ann.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="scope-badge">{ann.scope}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 🛠️ ADMIN UPLOAD PANEL */}
      {user?.role === 'stateAdmin' && (
        <section className="admin-panel-wrapper">
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h3>🛠️ Admin Dashboard</h3>
              <p>Manage the leadership carousel on the home page.</p>
            </div>
            
            <form onSubmit={handleUpload} className="admin-upload-form">
              <div className="form-group">
                <label>Leader Name</label>
                <input type="text" placeholder="e.g. Sheikh Ahmad" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Title / Rank</label>
                <input type="text" placeholder="e.g. State Chairman" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Profile Picture</label>
                <input id="leaderImageInput" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
              </div>
              <button type="submit" className="btn-admin-submit" disabled={isUploading}>
                {isUploading ? 'Uploading...' : '➕ Add Leader'}
              </button>
            </form>
            {msg && <p className="admin-msg">{msg}</p>}
          </div>
        </section>
      )}
    </div>
  );
}
