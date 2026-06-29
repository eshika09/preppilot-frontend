import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Filter, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const statusColors = {
  APPLIED: 'badge-applied', OA_SCHEDULED: 'badge-oa',
  OA_CLEARED: 'badge-cleared', INTERVIEW: 'badge-interview',
  SELECTED: 'badge-selected', REJECTED: 'badge-rejected',
};
const statusLabels = {
  APPLIED: 'Applied', OA_SCHEDULED: 'OA Scheduled',
  OA_CLEARED: 'OA Cleared', INTERVIEW: 'Interview',
  SELECTED: 'Selected', REJECTED: 'Rejected',
};
const priorityColors = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };

const STATUSES = ['APPLIED','OA_SCHEDULED','OA_CLEARED','INTERVIEW','SELECTED','REJECTED'];
const PRIORITIES = ['HIGH','MEDIUM','LOW'];

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    name: '', role: '', status: 'APPLIED',
    priority: 'MEDIUM', notes: '', deadline: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      if (searchTerm) {
        const res = await api.get(`/api/companies/search?name=${searchTerm}`);
        setCompanies(res.data);
        setTotalPages(1);
      } else if (filterStatus || filterPriority) {
        const params = new URLSearchParams();
        if (filterStatus) params.append('status', filterStatus);
        if (filterPriority) params.append('priority', filterPriority);
        const res = await api.get(`/api/companies/filter?${params}`);
        setCompanies(res.data);
        setTotalPages(1);
      } else {
        const res = await api.get(`/api/companies?page=${page}&size=8`);
        setCompanies(res.data.companies);
        setTotalPages(res.data.totalPages);
      }
    } catch { toast.error('Failed to load companies'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, [page, filterStatus, filterPriority]);

  useEffect(() => {
    const timer = setTimeout(() => { if (searchTerm !== undefined) fetchCompanies(); }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/companies', form);
      toast.success('Company added!');
      setShowModal(false);
      setForm({ name:'', role:'', status:'APPLIED', priority:'MEDIUM', notes:'', deadline:'' });
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add company');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/api/companies/${id}`);
      toast.success('Deleted');
      fetchCompanies();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Companies</h1>
            <p className="page-subtitle">Track your placement applications</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Company
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-24" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={15} color="var(--gray-300)" />
              <input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
              />
            </div>
            <select className="form-control" style={{ width: '160px' }}
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(0); }}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
            </select>
            <select className="form-control" style={{ width: '140px' }}
              value={filterPriority}
              onChange={e => { setFilterPriority(e.target.value); setPage(0); }}>
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {(filterStatus || filterPriority || searchTerm) && (
              <button className="btn btn-ghost btn-sm"
                onClick={() => { setFilterStatus(''); setFilterPriority(''); setSearchTerm(''); }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gray-400)' }}>
                Loading...
              </div>
            ) : companies.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Building2 size={28} /></div>
                <h3>No companies yet</h3>
                <p>Add your first company to start tracking your applications.</p>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <Plus size={15} /> Add Company
                </button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        {c.notes && (
                          <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>
                            {c.notes.slice(0, 40)}{c.notes.length > 40 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--gray-600)' }}>{c.role}</td>
                      <td>
                        <span className={`badge ${statusColors[c.status]}`}>
                          {statusLabels[c.status]}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${priorityColors[c.priority]}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                        {c.deadline || '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => navigate(`/companies/${c.id}`)}>
                            <Eye size={14} /> View
                          </button>
                          <button className="btn btn-sm"
                            style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none' }}
                            onClick={() => handleDelete(c.id, c.name)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '12px', padding: '16px', borderTop: '1px solid var(--gray-100)'
            }}>
              <button className="btn btn-ghost btn-sm"
                disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={15} />
              </button>
              <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button className="btn btn-ghost btn-sm"
                disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Add Company Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">Add Company</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleAdd}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Company Name *</label>
                    <input className="form-control" placeholder="Amazon"
                      value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Role *</label>
                    <input className="form-control" placeholder="SDE Intern"
                      value={form.role} onChange={e => setForm({...form, role: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Status</label>
                    <select className="form-control" value={form.status}
                      onChange={e => setForm({...form, status: e.target.value})}>
                      {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Priority</label>
                    <select className="form-control" value={form.priority}
                      onChange={e => setForm({...form, priority: e.target.value})}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Deadline</label>
                  <input className="form-control" type="date"
                    value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea className="form-control" placeholder="e.g. Amazon likes LP questions"
                    rows={3} value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Company'}
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