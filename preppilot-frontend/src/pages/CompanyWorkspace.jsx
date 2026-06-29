import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Brain, FileText,
  Zap, BookMarked, Edit2, Save, X, Upload, Loader
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const statusLabels = {
  APPLIED: 'Applied', OA_SCHEDULED: 'OA Scheduled',
  OA_CLEARED: 'OA Cleared', INTERVIEW: 'Interview',
  SELECTED: 'Selected', REJECTED: 'Rejected',
};
const statusColors = {
  APPLIED: 'badge-applied', OA_SCHEDULED: 'badge-oa',
  OA_CLEARED: 'badge-cleared', INTERVIEW: 'badge-interview',
  SELECTED: 'badge-selected', REJECTED: 'badge-rejected',
};
const STATUSES = ['APPLIED','OA_SCHEDULED','OA_CLEARED','INTERVIEW','SELECTED','REJECTED'];
const PRIORITIES = ['HIGH','MEDIUM','LOW'];

export default function CompanyWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [resources, setResources] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState('PREP_PLAN');
  const [aiFile, setAiFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [companyRes, resourcesRes, analysesRes] = await Promise.all([
        api.get(`/api/companies/${id}`),
        api.get(`/api/companies/${id}/resources`),
        api.get(`/api/analysis/company/${id}`),
      ]);
      setCompany(companyRes.data);
      setEditForm(companyRes.data);
      setResources(resourcesRes.data);
      setAnalyses(analysesRes.data);
    } catch { toast.error('Failed to load workspace'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleSave = async () => {
    try {
      await api.put(`/api/companies/${id}`, editForm);
      toast.success('Updated!');
      setEditing(false);
      fetchAll();
    } catch { toast.error('Update failed'); }
  };

  const handleAiAnalysis = async () => {
    setAiLoading(true);
    try {
      if (aiMode === 'PREP_PLAN') {
        const res = await api.post(`/api/analysis/prep-plan/${id}`);
        toast.success('Prep plan generated!');
        setAnalyses(prev => [res.data, ...prev]);
        setActiveTab('ai');
      } else {
        if (!aiFile) { toast.error('Please select a PDF'); setAiLoading(false); return; }
        const fd = new FormData();
        fd.append('file', aiFile);
        const endpoint = aiMode === 'OA_PAPER'
          ? `/api/analysis/oa-paper/${id}`
          : `/api/analysis/job-description/${id}`;
        const res = await api.post(endpoint, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Analysis complete!');
        setAnalyses(prev => [res.data, ...prev]);
        setActiveTab('ai');
        setAiFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally { setAiLoading(false); }
  };

  const handleRemoveBookmark = async (resourceId) => {
    try {
      await api.delete(`/api/resources/${resourceId}/bookmark/${id}`);
      toast.success('Bookmark removed');
      fetchAll();
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p className="text-muted">Loading workspace...</p>
      </div>
    </div>
  );

  if (!company) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'ai', label: `AI Analysis (${analyses.length})`, icon: Brain },
    { id: 'resources', label: `Resources (${resources.length})`, icon: BookMarked },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Back + Header */}
        <div style={{ marginBottom: '24px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/companies')}
            style={{ marginBottom: '16px' }}>
            <ArrowLeft size={15} /> Back to Companies
          </button>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, var(--purple-light), #ddd6fe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: 'var(--purple-primary)'
              }}>
                {company.name[0]}
              </div>
              <div>
                <h1 className="page-title">{company.name}</h1>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{company.role}</span>
                  <span className={`badge ${statusColors[company.status]}`}>
                    {statusLabels[company.status]}
                  </span>
                  {company.deadline && (
                    <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                      📅 {company.deadline}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!editing ? (
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                  <X size={14} /> Cancel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSave}>
                  <Save size={14} /> Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', background: 'white',
          padding: '6px', borderRadius: '12px', marginBottom: '20px',
          border: '1px solid var(--gray-200)', width: 'fit-content',
          boxShadow: 'var(--card-shadow)'
        }}>
          {tabs.map(({ id: tabId, label, icon: Icon }) => (
            <button key={tabId} onClick={() => setActiveTab(tabId)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '13.5px', fontWeight: 500,
                transition: 'all 0.17s',
                background: activeTab === tabId ? 'var(--purple-primary)' : 'transparent',
                color: activeTab === tabId ? 'white' : 'var(--gray-400)',
              }}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="card">
              <div className="card-title">Application Details</div>
              {editing ? (
                <>
                  <div className="form-group">
                    <label>Company Name</label>
                    <input className="form-control" value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <input className="form-control" value={editForm.role}
                      onChange={e => setEditForm({...editForm, role: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={editForm.status}
                      onChange={e => setEditForm({...editForm, status: e.target.value})}>
                      {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select className="form-control" value={editForm.priority}
                      onChange={e => setEditForm({...editForm, priority: e.target.value})}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Deadline</label>
                    <input className="form-control" type="date" value={editForm.deadline || ''}
                      onChange={e => setEditForm({...editForm, deadline: e.target.value})} />
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    ['Company', company.name],
                    ['Role', company.role],
                    ['Status', <span className={`badge ${statusColors[company.status]}`}>{statusLabels[company.status]}</span>],
                    ['Priority', company.priority],
                    ['Deadline', company.deadline || 'Not set'],
                    ['Added', new Date(company.createdAt).toLocaleDateString()],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: 500 }}>{label}</span>
                      <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-title">Notes</div>
              {editing ? (
                <textarea className="form-control" rows={8}
                  placeholder="e.g. Amazon likes LP questions in every round..."
                  value={editForm.notes || ''}
                  onChange={e => setEditForm({...editForm, notes: e.target.value})} />
              ) : (
                <p style={{
                  fontSize: '14px', color: company.notes ? 'var(--gray-800)' : 'var(--gray-300)',
                  lineHeight: 1.7, whiteSpace: 'pre-wrap'
                }}>
                  {company.notes || 'No notes yet. Click Edit to add notes about this company.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── AI ANALYSIS TAB ── */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* AI Trigger Card */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
              border: '1px solid rgba(124,58,237,0.15)'
            }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={18} color="var(--purple-primary)" />
                Run AI Analysis
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                  <label>Analysis Mode</label>
                  <select className="form-control" value={aiMode}
                    onChange={e => { setAiMode(e.target.value); setAiFile(null); }}>
                    <option value="PREP_PLAN">📋 Prep Plan (from community)</option>
                    <option value="OA_PAPER">📄 OA Paper Analysis (PDF)</option>
                    <option value="JOB_DESCRIPTION">💼 Job Description Analysis (PDF)</option>
                  </select>
                </div>
                {aiMode !== 'PREP_PLAN' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Upload PDF</label>
                    <input type="file" accept=".pdf" className="form-control"
                      onChange={e => setAiFile(e.target.files[0])} />
                  </div>
                )}
                <button className="btn btn-primary" onClick={handleAiAnalysis} disabled={aiLoading}>
                  {aiLoading
                    ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
                    : <><Zap size={15} /> Run Analysis</>}
                </button>
              </div>
            </div>

            {/* Past Analyses */}
            {analyses.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon"><Brain size={26} /></div>
                  <h3>No analyses yet</h3>
                  <p>Run an AI analysis above to get personalized prep plans and insights.</p>
                </div>
              </div>
            ) : (
              analyses.map((a, i) => (
                <div key={a.id || i} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: 'var(--purple-light)', color: 'var(--purple-primary)',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600
                      }}>
                        {a.mode === 'PREP_PLAN' ? '📋 Prep Plan'
                          : a.mode === 'OA_PAPER' ? '📄 OA Paper'
                          : '💼 Job Description'}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '13.5px', lineHeight: 1.8, color: 'var(--gray-800)',
                    whiteSpace: 'pre-wrap',
                    background: 'var(--gray-50)', padding: '16px',
                    borderRadius: '10px', border: '1px solid var(--gray-200)'
                  }}>
                    {a.result}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── RESOURCES TAB ── */}
        {activeTab === 'resources' && (
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookMarked size={17} color="var(--purple-primary)" />
              Bookmarked Resources
            </div>
            {resources.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><BookMarked size={26} /></div>
                <h3>No resources bookmarked</h3>
                <p>Go to Resources page and bookmark items to this company workspace.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {resources.map(r => (
                  <div key={r.bookmarkId} className="resource-card">
                    <div className="resource-card-icon" style={{
                      background: r.type === 'PDF' ? '#fce7f3'
                        : r.type === 'LINK' ? '#dbeafe'
                        : r.type === 'NOTE' ? '#fef3c7'
                        : 'var(--gray-100)'
                    }}>
                      {r.type === 'PDF' ? '📄'
                        : r.type === 'LINK' ? '🔗'
                        : r.type === 'NOTE' ? '📝'
                        : r.type === 'IMAGE' ? '🖼️'
                        : r.type === 'CODE' ? '💻'
                        : '📁'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>
                        {r.type} • Bookmarked {new Date(r.bookmarkedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {r.type === 'LINK' && (
                      <a href={r.url} target="_blank" rel="noreferrer"
                        className="btn btn-ghost btn-sm">Open ↗</a>
                    )}
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none' }}
                      onClick={() => handleRemoveBookmark(r.resourceId)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}