import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, BookMarked,
  Users, Crown, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/resources', icon: BookMarked, label: 'Resources' },
  { to: '/community', icon: Users, label: 'Community' },
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// SVG Logo Mark — no emoji, clean vector
const LogoMark = () => (
  <div className="sidebar-logo-mark">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
        fill="white" fillOpacity="0.9"/>
      <path d="M9 12l2 2 4-4" stroke="#7c3aed" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/api/auth/logout', { refreshToken });
    } catch {}
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <LogoMark />
        <div className="sidebar-logo-text">
          Prep<span>Pilot</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <div className="sidebar-item-icon"><Icon size={17} /></div>
            {label}
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: '10px' }}>Upgrade</div>
        <NavLink
          to="/premium"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          style={({ isActive }) => isActive ? {} : { color: '#fbbf24' }}
        >
          <div className="sidebar-item-icon"><Crown size={17} /></div>
          Go Premium
        </NavLink>
      </nav>

      {/* User + Logout */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name ?? 'User'}</div>
            <div className={`sidebar-user-plan ${user?.isPremium ? 'premium' : ''}`}>
              {user?.isPremium ? '⭐ Premium' : 'Free Plan'}
            </div>
          </div>
        </div>

        <button className="sidebar-item" onClick={handleLogout}
          style={{ color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
          <div className="sidebar-item-icon"><LogOut size={17} /></div>
          Sign Out
        </button>
      </div>
    </div>
  );
}