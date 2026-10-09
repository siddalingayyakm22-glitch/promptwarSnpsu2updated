import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <ShieldAlert size={64} color="var(--color-suspicious)" />
      <h1 style={{ fontSize: '32px', fontWeight: 800 }}>404 — Route Not Found</h1>
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '450px' }}>
        The security analysis console could not locate the requested resource or page path.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '12px' }}>
        <Home size={16} /> Return to Home Console
      </button>
    </div>
  );
};
