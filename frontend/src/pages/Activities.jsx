import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';
import { useLang } from '../services/i18n.jsx';

export default function Activities() {
  const { isOfficer } = useAuth();
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', titleHa: '', description: '', descriptionHa: '', date: '', location: '', scope: 'national' });

  const load = () => api.get('/activities').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    await api.post('/activities', form);
    setForm({ title: '', titleHa: '', description: '', descriptionHa: '', date: '', location: '', scope: 'national' });
    load();
  };

  return (
    <div>
      <h2>{t('activities')}</h2>
      {isOfficer && (
        <form className="card" onSubmit={submit}>
          <h3>{t('createActivity')}</h3>
          <input name="title" placeholder={`${t('title')} (EN)`} value={form.title} onChange={onChange} required />
          <input name="titleHa" placeholder={`${t('title')} (HA)`} value={form.titleHa} onChange={onChange} />
          <textarea name="description" placeholder="Description (EN)" value={form.description} onChange={onChange} />
          <textarea name="descriptionHa" placeholder="Description (HA)" value={form.descriptionHa} onChange={onChange} />
          <input name="date" type="datetime-local" value={form.date} onChange={onChange} required />
          <input name="location" placeholder={t('location')} value={form.location} onChange={onChange} />
          <select name="scope" value={form.scope} onChange={onChange}>
            <option value="national">National</option>
            <option value="state">State</option>
            <option value="lga">LGA</option>
            <option value="ward">Ward</option>
          </select>
          <button className="btn">{t('submit')}</button>
        </form>
      )}
      <div className="grid">
        {items.map((a) => (
          <article key={a._id} className="card">
            <h3>{lang === 'ha' && a.titleHa ? a.titleHa : a.title}</h3>
            <p>{lang === 'ha' && a.descriptionHa ? a.descriptionHa : a.description}</p>
            <small>{new Date(a.date).toLocaleString()} · {a.location} · {a.scope}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
