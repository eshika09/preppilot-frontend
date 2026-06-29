import { useState, useEffect } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const outcomeColors = {
  SELECTED: 'badge-selected', REJECTED: 'badge-rejected',
  WAITING: 'badge-oa', ONGOING: 'badge-interview'
};

const OUTCOMES = ['SELECTED', 'REJECTED', 'WAITING', 'ONGOING'];

export default function Community() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: '', role: '', round: '',
    questionsAsked: '', tips: '', outcome: 'SELECTED'
  });
  const { user } = useAuth();

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/community');
      setExperiences(res.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExperiences(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/community', form);
      toast.success('Experience shared!');
      setShowModal(false);
      setForm({ companyName:'', role:'', round:'', questionsAsked:'', tips:'', outcome:'SELECTED' });
      fetchExperiences();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const filtered = experiences.filter(e =>
    e.companyName.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Community Experiences</h1>
            <p className="page-subtitle">Real interview experiences shared by peers</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Share Experience
          </button>
        </div>

        {/* Search */}
        <div className="search-bar mb-24" style={{ maxWidth: '400px' }}>
          <Search size={15} color="var(--gray-300)" />
          <input placeholder="Search by company or role..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            Loading experiences...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={28} /></div>
              <h3>No experiences yet</h3>
              <p>Be the first to share your interview experience with the community!</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={15} /> Share Experience
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.map((e, i) => (
              <div key={e.id || i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{e.companyName}</h3>
                      <span className={`badge ${outcomeColors[e.outcome]}`}>{e.outcome}</span>
                      <span style={{
                        background: 'var(--purple-light)', color: 'var(--purple-primary)',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600
                      }}>
                        {e.round}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '4px' }}>
                      {e.role} • Shared by <strong>{e.postedBy}</strong> •{' '}
                      {new Date(e.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{
                    background: 'var(--gray-50)', padding: '14px',
                    borderRadius: '10px', border: '1px solid var(--gray-200)'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Questions Asked
                    </div>
                    <p style={{ fontSize: '13.5px', lineHeight: 1.7, color: 'var(--gray-800)' }}>
                      {e.questionsAsked}
                    </p>
                  </div>
                  {e.tips && (
                    <div style={{
                      background: '#f5f3ff', padding: '14px',
                      borderRadius: '10px', border: '1px solid rgba(124,58,237,0.12)'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--purple-primary)',
                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        💡 Tips
                      </div>
                      <p style={{ fontSize: '13.5px', lineHeight: 1.7, color: 'var(--gray-800)' }}>
                        {e.tips}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal" style={{ maxWidth: '520px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Share Your Experience</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Company *</label>
                    <input className="form-control" placeholder="Amazon"
                      value={form.companyName}
                      onChange={e => setForm({...form, companyName: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Role *</label>
                    <input className="form-control" placeholder="SDE Intern"
                      value={form.role}
                      onChange={e => setForm({...form, role: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Round *</label>
                    <input className="form-control" placeholder="OA / Round 1 / HR"
                      value={form.round}
                      onChange={e => setForm({...form, round: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Outcome *</label>
                    <select className="form-control" value={form.outcome}
                      onChange={e => setForm({...form, outcome: e.target.value})}>
                      {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Questions Asked *</label>
                  <textarea className="form-control" rows={3}
                    placeholder="What questions were asked in this round?"
                    value={form.questionsAsked}
                    onChange={e => setForm({...form, questionsAsked: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Tips (optional)</label>
                  <textarea className="form-control" rows={2}
                    placeholder="Any tips for future candidates?"
                    value={form.tips}
                    onChange={e => setForm({...form, tips: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost"
                    onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Sharing...' : 'Share Experience'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}