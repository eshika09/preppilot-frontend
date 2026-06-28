import { useState, useEffect } from 'react';
import {
  Building2, BookMarked, Brain,
  AlertCircle, TrendingUp, Sparkles
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  APPLIED:      'badge-applied',
  OA_SCHEDULED: 'badge-oa',
  OA_CLEARED:   'badge-cleared',
  INTERVIEW:    'badge-interview',
  SELECTED:     'badge-selected',
  REJECTED:     'badge-rejected',
};

const statusLabels = {
  APPLIED:      'Applied',
  OA_SCHEDULED: 'OA Scheduled',
  OA_CLEARED:   'OA Cleared',
  INTERVIEW:    'Interview',
  SELECTED:     'Selected',
  REJECTED:     'Rejected',
};

// Color for pipeline bar
const barColors = {
  APPLIED:      '#3b82f6',
  OA_SCHEDULED: '#f59e0b',
  OA_CLEARED:   '#10b981',
  INTERVIEW:    '#ec4899',
  SELECTED:     '#059669',
  REJECTED:     '#ef4444',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/api/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPipeline = stats?.companiesByStatus
    ? Object.values(stats.companiesByStatus).reduce((a, b) => a + b, 0)
    : 0;

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--purple-light)',
            borderTop: '3px solid var(--purple-primary)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <p style={{ fontSize: '14px' }}>Loading dashboard…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Welcome back, <strong style={{ color: 'var(--purple-primary)' }}>{user?.name}</strong> 👋
            </p>
          </div>
          {!user?.isPremium && (
            <a href="/premium" className="btn btn-outline" style={{ gap: '6px', fontSize: '13px' }}>
              <Sparkles size={14} />
              Upgrade to Premium
            </a>
          )}
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <Building2 size={22} />
            </div>
            <div className="stat-info">
              <h3>{stats?.totalCompanies ?? 0}</h3>
              <p>Total Companies</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <BookMarked size={22} />
            </div>
            <div className="stat-info">
              <h3>{stats?.totalResources ?? 0}</h3>
              <p>Resources Saved</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <Brain size={22} />
            </div>
            <div className="stat-info">
              <h3>{stats?.analysesUsed ?? 0}</h3>
              <p>
                AI Analyses Used
                {!user?.isPremium && (
                  <span style={{ color: 'var(--warning)', fontSize: '11px', display: 'block', fontWeight: 500 }}>
                    {stats?.analysesRemaining} left this month
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef9c3', color: '#b45309' }}>
              <AlertCircle size={22} />
            </div>
            <div className="stat-info">
              <h3>{stats?.upcomingDeadlines?.length ?? 0}</h3>
              <p>Upcoming Deadlines</p>
            </div>
          </div>
        </div>

        {/* Two-col section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Pipeline Status */}
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={17} color="var(--purple-primary)" />
              Application Pipeline
            </div>

            {stats?.companiesByStatus && Object.keys(stats.companiesByStatus).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {Object.entries(stats.companiesByStatus).map(([status, count]) => (
                  <div key={status} className="pipeline-row">
                    <span className={`badge ${statusColors[status]}`} style={{ minWidth: '110px' }}>
                      {statusLabels[status] || status}
                    </span>
                    <div className="pipeline-bar-wrapper">
                      <div
                        className="pipeline-bar"
                        style={{
                          width: totalPipeline > 0 ? `${(count / totalPipeline) * 100}%` : '0%',
                          background: barColors[status] || 'var(--purple-primary)',
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--gray-800)', fontSize: '14px', minWidth: '20px', textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px 20px' }}>
                <div className="empty-state-icon"><TrendingUp size={24} /></div>
                <h3>No companies yet</h3>
                <p>Add companies to track your application pipeline.</p>
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={17} color="var(--warning)" />
              Upcoming Deadlines
            </div>

            {stats?.upcomingDeadlines?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.upcomingDeadlines.map((d, i) => (
                  <div key={i} className="deadline-item">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{d.companyName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{d.role}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                      <div style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: d.daysLeft <= 1 ? 'var(--danger)' : 'var(--warning)',
                        background: d.daysLeft <= 1 ? 'var(--danger-light)' : 'var(--warning-light)',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        marginBottom: '2px',
                        display: 'inline-block',
                      }}>
                        {d.daysLeft === 0 ? 'Today!' : d.daysLeft === 1 ? 'Tomorrow' : `${d.daysLeft}d left`}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{d.deadline}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px 20px' }}>
                <div className="empty-state-icon"><AlertCircle size={24} /></div>
                <h3>All clear!</h3>
                <p>No deadlines in the next 7 days.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}