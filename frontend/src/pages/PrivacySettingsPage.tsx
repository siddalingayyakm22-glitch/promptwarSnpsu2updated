import React, { useState } from 'react';
import { Settings, Lock, Trash2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { api } from '../services/api';

export const PrivacySettingsPage: React.FC = () => {
  const [retentionDays, setRetentionDays] = useState('7');
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [wipeStatus, setWipeStatus] = useState<string | null>(null);

  const handleWipeData = async () => {
    if (!confirm('This will permanently delete all scan records, cached threat intelligence, and local preferences. Proceed?')) {
      return;
    }
    try {
      await api.clearAllHistory();
      localStorage.clear();
      setWipeStatus('All local database records, cache, and session settings have been permanently deleted.');
    } catch (err: any) {
      alert('Wipe operation failed: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Privacy & Application Settings"
        description="Review privacy disclosures, zero-log data governance, and manage your local data footprint."
        icon={Settings}
        badgeText="Zero-Log Governance"
      />

      {/* Privacy Architecture Statement */}
      <div className="cyber-card" style={{ borderLeft: '4px solid var(--color-safe)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Lock size={18} color="var(--color-safe)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Privacy-by-Design Architecture</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
          CyberShield AI strictly adheres to zero-log security principles for user investigations:
        </p>
        <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><strong>No Credential Logging:</strong> Passwords, OTPs, PINs, CVVs, and credit card numbers are never stored in databases or log files.</li>
          <li><strong>Cryptographic Hashing:</strong> Scan targets are hashed via SHA-256 for de-duplication; previews displayed in reports are redacted.</li>
          <li><strong>Zero Client Third-Party Telemetry:</strong> No external trackers, user session replays, or advertising beacons are embedded.</li>
          <li><strong>Guest Mode:</strong> Full platform functionality is accessible without creating an account or providing an email address.</li>
        </ul>
      </div>

      {/* Data Retention Configuration */}
      <div className="cyber-card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
          Local Scan Data Retention
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              History Retention Period
            </label>
            <select
              className="cyber-input"
              style={{ maxWidth: '280px' }}
              value={retentionDays}
              onChange={e => setRetentionDays(e.target.value)}
            >
              <option value="1">1 Day (Aggressive Wipe)</option>
              <option value="7">7 Days (Default)</option>
              <option value="30">30 Days</option>
              <option value="never">Manual Deletion Only</option>
            </select>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Scans older than this threshold will be pruned during maintenance cycles.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="analytics-toggle"
              checked={analyticsConsent}
              onChange={e => setAnalyticsConsent(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="analytics-toggle" style={{ fontSize: '13px', cursor: 'pointer' }}>
              Allow non-identifying aggregate telemetry to improve local detection heuristics
            </label>
          </div>
        </div>
      </div>

      {/* Permanent Wipe Card */}
      <div className="cyber-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-highrisk)', marginBottom: '8px' }}>
          Permanent Data Wipeout
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Immediately purge all recorded scan investigations, cached reputation responses, and reset local configuration preferences.
        </p>

        <button className="btn btn-danger" onClick={handleWipeData}>
          <Trash2 size={15} /> Wipe All Records Permanently
        </button>

        {wipeStatus && (
          <div style={{ marginTop: '12px', color: 'var(--color-safe)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> {wipeStatus}
          </div>
        )}
      </div>
    </div>
  );
};
