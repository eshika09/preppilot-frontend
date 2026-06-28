import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyWorkspace from './pages/CompanyWorkspace';
import Resources from './pages/Resources';
import Community from './pages/Community';
import Premium from './pages/Premium';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/companies" element={
            <ProtectedRoute><Companies /></ProtectedRoute>
          } />
          <Route path="/companies/:id" element={
            <ProtectedRoute><CompanyWorkspace /></ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute><Resources /></ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute><Community /></ProtectedRoute>
          } />
          <Route path="/premium" element={
            <ProtectedRoute><Premium /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;