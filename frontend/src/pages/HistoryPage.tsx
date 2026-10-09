import React, { useState, useEffect } from 'react';
import { History, Trash2, FileText, Search, ShieldCheck, AlertTriangle, Eye } from 'lucide-react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ReportExportModal } from '../components/ReportExportModal';

export const HistoryPage: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');

  const loadHistory = () => {
    setLoading(true);
    api.getHistory({
      scanType: filterType || undefined,
      classification: filterClass || undefined,
      limit: 50
    })
      .then(res => setScans(res.scans || []))
      .catch(() => setScans([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, [filterType, filterClass]);

  const handleDeleteOne = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scan record?')) return;
    try {
      await api.deleteHistoryById(id);
      setScans(prev => prev.filter(s => s.scanId !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Permanently wipe all scan logs and telemetry? This cannot be undone.')) return;
    try {
      await api.clearAllHistory();
      setScans([]);
    } catch (err: any) {
      alert('Wipe failed: ' + err.message);
    }
  };

  const handleExport = async (scanId: string) => {
    try {
      const rep = await api.exportReport(scanId);
      setReportMarkdown(rep.markdown);
      setIsReportOpen(true);
    } catch (err: any) {
      alert('Report generation failed: ' + err.message);
    }
  };

  const filteredScans = scans.filter(s => {
    if (!searchTarget) return true;
    const target = (s.redactedInput || s.hostname || '').toLowerCase();
    return target.includes(searchTarget.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <History size={24} color="var(--color-cyan)" />
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Investigation Scan History</h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Privacy-preserving audit log. Stores SHA-256 hashes and redacted targets; never logs raw credentials or OTPs.
          </p>
        </div>

        {scans.length > 0 && (
          <button className="btn btn-danger" onClick={handleClearAll} style={{ fontSize: '13px' }}>
            <Trash2 size={15} /> Clear All History
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="cyber-card" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            type="text"
            className="cyber-input"
            placeholder="Search redacted target..."
            value={searchTarget}
            onChange={e => setSearchTarget(e.target.value)}
          />
        </div>

        <select
          className="cyber-input"
          style={{ width: '160px' }}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">All Scan Types</option>
          <option value="URL">URL Scans</option>
          <option value="MESSAGE">Message Scans</option>
          <option value="EMAIL">Email Scans</option>
          <option value="QR">QR Code Scans</option>
          <option value="ATTACHMENT">Attachments</option>
        </select>

        <select
          className="cyber-input"
          style={{ width: '170px' }}
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
        >
          <option value="">All Risk Bands</option>
          <option value="SAFE">Safe (0-30)</option>
          <option value="SUSPICIOUS">Suspicious (31-60)</option>
          <option value="HIGH_RISK">High Risk (61-100)</option>
        </select>
      </div>

      {/* History Table */}
      <div className="cyber-card">
        {loading ? (
          <div style={{ padding: '20px' }}>
            <div className="skeleton" style={{ height: '40px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '40px', marginBottom: '8px' }} />
          </div>
        ) : filteredScans.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No scan records found matching filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>SCAN ID</th>
                  <th style={{ padding: '12px' }}>TYPE</th>
                  <th style={{ padding: '12px' }}>REDACTED TARGET</th>
                  <th style={{ padding: '12px' }}>SCORE</th>
                  <th style={{ padding: '12px' }}>CLASSIFICATION</th>
                  <th style={{ padding: '12px' }}>DATE</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map(s => (
                  <tr key={s.scanId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {s.scanId.slice(0, 12)}...
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{s.scanType}</td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {s.redactedInput || s.hostname || '—'}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{s.riskScore}/100</td>
                    <td style={{ padding: '12px' }}><RiskBadge classification={s.classification} /></td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Export Redacted Report"
                          onClick={() => handleExport(s.scanId)}
                        >
                          <FileText size={13} /> Report
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Delete Record"
                          onClick={() => handleDeleteOne(s.scanId)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportMarkdown={reportMarkdown}
      />
    </div>
  );
};
