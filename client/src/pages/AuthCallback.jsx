import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { setToken, api } from '../api/client.js';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setError('No token received from server');
      return;
    }

    setToken(token);

    // Fetch user details from backend
    api.me()
      .then(({ user }) => {
        updateUser(user);
        navigate('/connect', { replace: true });
      })
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--bg)', color: 'var(--text)',
    }}>
      {error ? (
        <div style={{ color: 'var(--accent)', fontSize: 14 }}>
          Error: {error}
        </div>
      ) : (
        <div style={{ fontSize: 14 }}>Completing sign in…</div>
      )}
    </div>
  );
}