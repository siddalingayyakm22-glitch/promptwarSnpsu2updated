import React, { useState } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportMarkdown: string;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ isOpen, onClose, reportMarkdown }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CyberShield_Investigation_Report_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        zIndex: 110,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="cyber-card"
        style={{
          maxWidth: '700px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>📋 Redacted Investigation Audit Report</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Compliant with privacy standards. Sensitive tokens and private data are excluded.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <textarea
          readOnly
          value={reportMarkdown}
          className="cyber-input"
          style={{
            flex: 1,
            minHeight: '300px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            marginBottom: '16px'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleDownload}>
            <Download size={14} /> Download (.md)
          </button>
          <button className="btn btn-primary" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
};
