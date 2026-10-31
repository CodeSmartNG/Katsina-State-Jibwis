import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Announcements() {
  const { isOfficer } = useAuth();
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', titleHa: '', body: '', bodyHa: '', scope: 'national' });

  const load = () => api.get('/announcements').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    await api.post('/announcements', form);
    setForm({ title: '', titleHa: '', body: '', bodyHa: '', scope: 'national' });
    load();
  };

  return (
    <div>
      <h2>{t('announcements')}</h2>
      {isOfficer && (
        <form className="card" onSubmit={submit}>
          <h3>{t('createAnnouncement')}</h3>
          <input name="title" placeholder={`${t('title')} (EN)`} value={form.title} onChange={onChange} required />
          <input name="titleHa" placeholder={`${t('title')} (HA)`} value={form.titleHa} onChange={onChange} />
          <textarea name="body" placeholder={`${t('body')} (EN)`} value={form.body} onChange={onChange} required />
          <textarea name="bodyHa" placeholder={`${t('body')} (HA)`} value={form.bodyHa} onChange={onChange} />
          <select name="scope" value={form.scope} onChange={onChange}>
            <option value="national">National</option>
            <option value="state">State</option>
            <option value="lga">LGA</option>
            <option value="ward">Ward</option>
          </select>
          <button className="btn">{t('publish')}</button>
        </form>
      )}
      <div className="grid">
        {items.map((a) => (
          <article key={a._id} className="card">
            <h3>{lang === 'ha' && a.titleHa ? a.titleHa : a.title}</h3>
            <p>{lang === 'ha' && a.bodyHa ? a.bodyHa : a.body}</p>
            <small>{a.scope} · {new Date(a.createdAt).toLocaleString()}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
