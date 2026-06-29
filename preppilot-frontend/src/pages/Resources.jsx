import { useState, useEffect } from 'react';
import { BookMarked, Plus, Trash2, Link, FileText, ExternalLink, Upload } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const typeIcons = {
  PDF: '📄', LINK: '🔗', NOTE: '📝',
  IMAGE: '🖼️', CODE: '💻', ZIP: '📁'
};

const typeBg = {
  PDF: '#fce7f3', LINK: '#dbeafe', NOTE: '#fef3c7',
  IMAGE: '#f3e8ff', CODE: '#f0fdf4', ZIP: 'var(--gray-100)'
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(null);
  const [bookmarkCompanyId, setBookmarkCompanyId] = useState('');
  const [mode, setMode] = useState('text');
  const [form, setForm] = useState({ title: '', type: 'LINK', url: '' });
  const [file, setFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileType, setFileType] = useState('PDF');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([
        api.get('/api/resources'),
        api.get('/api/companies?page=0&size=50'),
      ]);
      setResources(rRes.data);
      setCompanies(cRes.data.companies || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddText = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/resources/text', form);
      toast.success('Resource added!');
      setShowModal(false);
      setForm({ title: '', type: 'LINK', url: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleAddFile = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('title', fileTitle);
    fd.append('type', fileType);
    fd.append('file', file);
    try {
      await api.post('/api/resources/file', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('File uploaded!');
      setShowModal(false);
      setFileTitle(''); setFile(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await api.delete(`/api/resources/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleBookmark = async () => {
    if (!bookmarkCompanyId) { toast.error('Select a company'); return; }
    try {
      await api.post(`/api/resources/${showBookmarkModal}/bookmark/${bookmarkCompanyId}`);
      toast.success('Bookmarked!');
      setShowBookmarkModal(null);
      setBookmarkCompanyId('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Resources</h1>
            <p className="page-subtitle">Your study materials and links</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Resource
          </button>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><BookMarked size={28} /></div>
              <h3>No resources yet</h3>
              <p>Add PDFs, links, notes, and more. Then bookmark them to company workspaces.</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={15} /> Add Resource
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {resources.map(r => (
              <div key={r.id} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 11,
                    background: typeBg[r.type] || 'var(--gray-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0
                  }}>
                    {typeIcons[r.type] || '📁'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                      {r.title}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className={`badge badge-${r.type.toLowerCase()}`}>{r.type}</span>
                      <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.type === 'NOTE' && r.url && (
                      <p style={{
                        fontSize: '12.5px', color: 'var(--gray-600)', marginTop: '8px',
                        background: 'var(--gray-50)', padding: '8px', borderRadius: '6px',
                        lineHeight: 1.6
                      }}>
                        {r.url.slice(0, 100)}{r.url.length > 100 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  {r.type === 'LINK' && (
                    <a href={r.url} target="_blank" rel="noreferrer"
                      className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      <ExternalLink size={13} /> Open
                    </a>
                  )}
                  <button className="btn btn-outline btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setShowBookmarkModal(r.id)}>
                    <BookMarked size={13} /> Bookmark
                  </button>
                  <button className="btn btn-sm"
                    style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none' }}
                    onClick={() => handleDelete(r.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Resource Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">Add Resource</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              {/* Mode Toggle */}
              <div style={{
                display: 'flex', background: 'var(--gray-100)',
                borderRadius: '10px', padding: '4px', marginBottom: '20px'
              }}>
                {['text', 'file'].map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    style={{
                      flex: 1, padding: '8px', border: 'none', cursor: 'pointer',
                      borderRadius: '8px', fontSize: '13.5px', fontWeight: 500,
                      background: mode === m ? 'white' : 'transparent',
                      color: mode === m ? 'var(--purple-primary)' : 'var(--gray-400)',
                      boxShadow: mode === m ? 'var(--card-shadow)' : 'none',
                      transition: 'all 0.17s'
                    }}>
                    {m === 'text' ? '🔗 Link / Note' : '📁 File Upload'}
                  </button>
                ))}
              </div>

              {mode === 'text' ? (
                <form onSubmit={handleAddText}>
                  <div className="form-group">
                    <label>Title *</label>
                    <input className="form-control" placeholder="Striver's SDE Sheet"
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select className="form-control" value={form.type}
                      onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="LINK">🔗 Link</option>
                      <option value="NOTE">📝 Note</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{form.type === 'LINK' ? 'URL *' : 'Note Content *'}</label>
                    {form.type === 'LINK' ? (
                      <input className="form-control" type="url"
                        placeholder="https://..."
                        value={form.url}
                        onChange={e => setForm({...form, url: e.target.value})} required />
                    ) : (
                      <textarea className="form-control" rows={4}
                        placeholder="Write your note here..."
                        value={form.url}
                        onChange={e => setForm({...form, url: e.target.value})} required />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Adding...' : 'Add Resource'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddFile}>
                  <div className="form-group">
                    <label>Title *</label>
                    <input className="form-control" placeholder="Amazon OA Paper Nov 2024"
                      value={fileTitle}
                      onChange={e => setFileTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select className="form-control" value={fileType}
                      onChange={e => setFileType(e.target.value)}>
                      <option value="PDF">📄 PDF</option>
                      <option value="IMAGE">🖼️ Image</option>
                      <option value="CODE">💻 Code File</option>
                      <option value="ZIP">📁 ZIP</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>File *</label>
                    <input className="form-control" type="file"
                      onChange={e => setFile(e.target.files[0])} required />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Uploading...' : <><Upload size={14}/> Upload</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Bookmark Modal */}
        {showBookmarkModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowBookmarkModal(null)}>
            <div className="modal" style={{ maxWidth: '380px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Bookmark to Company</h2>
                <button className="modal-close" onClick={() => setShowBookmarkModal(null)}>✕</button>
              </div>
              <div className="form-group">
                <label>Select Company</label>
                <select className="form-control" value={bookmarkCompanyId}
                  onChange={e => setBookmarkCompanyId(e.target.value)}>
                  <option value="">Choose a company...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowBookmarkModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleBookmark}>
                  <BookMarked size={14} /> Bookmark
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}