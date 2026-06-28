import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', height: '100vh',
    color: '#7c3aed', fontSize: '16px'
  }}>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};
export default ProtectedRoute