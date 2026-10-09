import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Sun, Moon, Lock, Play } from 'lucide-react';
import { DemoCasesModal } from './DemoCasesModal';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem('cybershield_theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Check backend health
    api.getHealth()
      .then(res => setAiStatus(res.aiService && res.aiService.online))
      .catch(() => setAiStatus(false));
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('cybershield_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.3px' }}>CyberShield AI</span>
              <span className="badge badge-info" style={{ fontSize: '9px', padding: '2px 6px' }}>v1.2</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
              Detect the Threat. Understand the Risk. Stay Safe.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Health indicator badge */}
          <div
            title={aiStatus ? 'FastAPI ML Engine connected' : 'Rule-based analysis engine active'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: aiStatus ? 'var(--color-safe)' : 'var(--color-suspicious)',
                boxShadow: aiStatus ? 'var(--glow-safe)' : 'none'
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {aiStatus ? 'AI Engine Online' : 'Rule Engine Fallback'}
            </span>
          </div>

          {/* Privacy badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--color-safe)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
            title="Zero-log architecture: Raw passwords, OTPs and private credentials are never stored."
          >
            <Lock size={12} />
            <span>Zero-Log Privacy</span>
          </div>

          {/* 10 Test Demos button */}
          <button
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={() => setIsDemoModalOpen(true)}
          >
            <Play size={13} fill="currentColor" /> Test 10 Demos
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <DemoCasesModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </>
  );
};
