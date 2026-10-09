import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, Globe, MessageSquare, Mail, QrCode, Bot,
  LayoutDashboard, History, Database, BookOpen,
  LifeBuoy, ShieldAlert, Settings, FileCode2
} from 'lucide-react';

const navItems = [
  { section: 'CORE SCANNERS' },
  { path: '/', label: 'Home / Overview', icon: Home },
  { path: '/scan-url', label: 'URL Phishing Scanner', icon: Globe },
  { path: '/scan-message', label: 'Message Scam Detector', icon: MessageSquare },
  { path: '/scan-email', label: 'Email Security Analyzer', icon: Mail },
  { path: '/scan-qr', label: 'QR Code Quishing', icon: QrCode },
  { path: '/copilot', label: 'AI Security Copilot', icon: Bot },

  { section: 'ANALYTICS & INTEL' },
  { path: '/dashboard', label: 'Security Dashboard', icon: LayoutDashboard },
  { path: '/history', label: 'Scan History & Reports', icon: History },
  { path: '/threats', label: 'Threat Intel Explorer', icon: Database },

  { section: 'SAFETY & EMERGENCY' },
  { path: '/learn', label: 'Learn Cyber Safety', icon: BookOpen },
  { path: '/incident-response', label: 'Incident Response (1930)', icon: LifeBuoy },

  { section: 'SYSTEM & ABOUT' },
  { path: '/privacy', label: 'Privacy & Settings', icon: Settings },
  { path: '/about', label: 'About & Methodology', icon: FileCode2 },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-cyan)', letterSpacing: '1px' }}>
          NAVIGATION CONSOLE
        </span>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item, idx) => {
          if ('section' in item) {
            return (
              <div
                key={idx}
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.8px',
                  padding: '14px 12px 6px 12px'
                }}
              >
                {item.section}
              </div>
            );
          }

          const Icon = item.icon!;
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--color-cyan)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                borderLeft: isActive ? '3px solid var(--color-cyan)' : '3px solid transparent'
              })}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <ShieldAlert size={14} color="var(--color-safe)" />
          <span>India Cybercrime: <strong>1930</strong></span>
        </div>
      </div>
    </aside>
  );
};
