import React, { useState, useEffect } from 'react';
import { History, Trash2, FileText } from 'lucide-react';
import { api } from '../services/api';
import type { ScanResult } from '../types';
import { PageHeader } from '../components/PageHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { AlertMessage } from '../components/AlertMessage';
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
  const [actionError, setActionError] = useState<string | null>(null);

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
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;
    try {
      await api.deleteHistoryById(id);
      setScans(prev => prev.filter(s => s.scanId !== id));
      setActionError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      setActionError(msg);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Permanently wipe all scan logs and telemetry? This cannot be undone.')) return;
    try {
      await api.clearAllHistory();
      setScans([]);
      setActionError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Wipe failed';
      setActionError(msg);
    }
  };

  const handleExport = async (scanId: string) => {
    try {
      const rep = await api.exportReport(scanId);
      setReportMarkdown(rep.markdown);
      setIsReportOpen(true);
      setActionError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Report export failed';
      setActionError('Report generation failed: ' + msg);
    }
  };

  const filteredScans = scans.filter(s => {
    if (!searchTarget) return true;
    const target = (s.redactedInput || s.hostname || '').toLowerCase();
    return target.includes(searchTarget.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Investigation Scan History"
        description="Privacy-preserving audit log. Stores SHA-256 hashes and redacted targets; never logs raw credentials or OTPs."
        icon={History}
        iconColor="var(--color-cyan)"
        action={
          scans.length > 0 ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleClearAll}
              style={{ fontSize: '13px' }}
              aria-label="Clear all scan history"
            >
              <Trash2 size={15} aria-hidden="true" />
              <span>Clear All History</span>
            </button>
          ) : undefined
        }
      />

      {actionError && <AlertMessage type="error" message={actionError} />}

      {/* Filter and Search Bar */}
      <section className="cyber-card" aria-label="History Filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <label htmlFor="history-search" className="sr-only">Search redacted target</label>
          <input
            id="history-search"
            type="search"
            className="cyber-input"
            placeholder="Search redacted target..."
            value={searchTarget}
            onChange={e => setSearchTarget(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="history-filter-type" className="sr-only">Filter by scan type</label>
          <select
            id="history-filter-type"
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
        </div>

        <div>
          <label htmlFor="history-filter-class" className="sr-only">Filter by risk band</label>
          <select
            id="history-filter-class"
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
      </section>

      {/* History Table */}
      <section className="cyber-card" aria-labelledby="history-table-heading">
        <h2 id="history-table-heading" className="sr-only">Scan Audit Records</h2>
        {loading ? (
          <LoadingSkeleton label="Loading scan history logs..." lines={3} />
        ) : filteredScans.length === 0 ? (
          <EmptyState
            title="No Records Found"
            description="No scan records found matching the specified filters or search term."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <caption className="sr-only">Audit log of performed security scans</caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th scope="col" style={{ padding: '12px' }}>SCAN ID</th>
                  <th scope="col" style={{ padding: '12px' }}>TYPE</th>
                  <th scope="col" style={{ padding: '12px' }}>REDACTED TARGET</th>
                  <th scope="col" style={{ padding: '12px' }}>SCORE</th>
                  <th scope="col" style={{ padding: '12px' }}>CLASSIFICATION</th>
                  <th scope="col" style={{ padding: '12px' }}>DATE</th>
                  <th scope="col" style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
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
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Export Redacted Report"
                          onClick={() => handleExport(s.scanId)}
                          aria-label={`Export report for ${s.scanId}`}
                        >
                          <FileText size={13} aria-hidden="true" />
                          <span>Report</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Delete Record"
                          onClick={() => handleDeleteOne(s.scanId)}
                          aria-label={`Delete scan ${s.scanId}`}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportMarkdown={reportMarkdown}
      />
    </div>
  );
};
