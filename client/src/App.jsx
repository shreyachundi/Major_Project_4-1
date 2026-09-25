import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Connect from './pages/Connect.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Insights from './pages/Insights.jsx';
import ContentIdeas from './pages/ContentIdeas.jsx';
import Competitors from './pages/Competitors.jsx';
import Thumbnails from './pages/Thumbnails.jsx';

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;

  const hasChannel = !!user?.channelId;
  const params = new URLSearchParams(location.search);
  const forceConnect = params.get('change') === '1';

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={hasChannel ? '/dashboard' : '/connect'} replace /> : <Login />} />

      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/connect" element={
        <ProtectedRoute>
          {hasChannel && !forceConnect
            ? <Navigate to="/dashboard" replace />
            : <Connect />}
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          {hasChannel ? <Dashboard /> : <Navigate to="/connect" replace />}
        </ProtectedRoute>
      } />
      <Route path="/insights" element={
        <ProtectedRoute>
          {hasChannel ? <Insights /> : <Navigate to="/connect" replace />}
        </ProtectedRoute>
      } />
      <Route path="/content" element={
        <ProtectedRoute>
          {hasChannel ? <ContentIdeas /> : <Navigate to="/connect" replace />}
        </ProtectedRoute>
      } />
      <Route path="/competitors" element={
        <ProtectedRoute>
          {hasChannel ? <Competitors /> : <Navigate to="/connect" replace />}
        </ProtectedRoute>
      } />
      <Route path="/thumbnails" element={
        <ProtectedRoute>
          {hasChannel ? <Thumbnails /> : <Navigate to="/connect" replace />}
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to={user ? (hasChannel ? '/dashboard' : '/connect') : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}