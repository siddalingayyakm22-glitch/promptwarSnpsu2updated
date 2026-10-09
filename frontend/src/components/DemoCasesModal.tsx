import React from 'react';
import { SAMPLE_DEMO_CASES, DemoCase } from '../services/sampleDemos';
import { useNavigate } from 'react-router-dom';
import { X, PlayCircle, Shield, AlertTriangle, MessageSquare, Mail, QrCode } from 'lucide-react';

interface DemoCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (demo: DemoCase) => void;
}

export const DemoCasesModal: React.FC<DemoCasesModalProps> = ({ isOpen, onClose, onSelectCase }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRunDemo = (demo: DemoCase) => {
    if (onSelectCase) {
      onSelectCase(demo);
    } else {
      navigate(demo.route, { state: { prefill: demo.payload } });
    }
    onClose();
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'URL': return <Shield size={16} color="var(--color-cyan)" />;
      case 'MESSAGE': return <MessageSquare size={16} color="var(--color-suspicious)" />;
      case 'EMAIL': return <Mail size={16} color="var(--color-blue)" />;
      case 'QR': return <QrCode size={16} color="var(--color-safe)" />;
      default: return <AlertTriangle size={16} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="cyber-card"
        style={{
          maxWidth: '750px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>⚡ 10 Ready-to-Test Security Scenarios</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Click any verified benchmark scenario to auto-fill and run through the actual detection pipeline.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {SAMPLE_DEMO_CASES.map(demo => (
            <div
              key={demo.id}
              className="cyber-card cyber-card-interactive"
              style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={() => handleRunDemo(demo)}
            >
              <div style={{ maxWidth: '80%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {getCategoryIcon(demo.category)}
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{demo.title}</span>
                  <span className="badge badge-info" style={{ fontSize: '10px' }}>{demo.category}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{demo.description}</p>
              </div>

              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                <PlayCircle size={14} /> Test
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
