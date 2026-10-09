import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Globe, Search, ShieldCheck, AlertTriangle, FileText, Check } from 'lucide-react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { EvidencePanel } from '../components/EvidencePanel';
import { RecommendationsBox } from '../components/RecommendationsBox';
import { ReportExportModal } from '../components/ReportExportModal';

export const URLScannerPage: React.FC = () => {
  const location = useLocation();
  const prefill = location.state?.prefill?.url || '';

  const [urlInput, setUrlInput] = useState(prefill);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');

  const handleScan = async (targetUrl?: string) => {
    const toScan = targetUrl || urlInput;
    if (!toScan.trim()) {
      setError('Please provide a URL to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeUrl(toScan.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to complete URL analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!result) return;
    try {
      const rep = await api.exportReport(result.scanId);
      setReportMarkdown(rep.markdown);
      setIsReportOpen(true);
    } catch (err: any) {
      alert('Could not generate export report: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Globe size={24} color="var(--color-cyan)" />
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Advanced URL Phishing Detector</h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Extracts 25+ lexical and structural features, evaluates brand impersonation, and queries threat feeds without visiting the target.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="cyber-card">
        <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
          Target URL or Domain Name
        </label>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="cyber-input"
            style={{ flex: 1, minWidth: '280px' }}
            placeholder="e.g. http://paypal-verification-account-update.xyz/login.php or google.com"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleScan()}
            disabled={loading}
          >
            {loading ? <span className="skeleton" style={{ width: '60px', height: '16px' }} /> : (
              <>
                <Search size={16} /> Run Analysis
              </>
            )}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '12px', color: 'var(--color-highrisk)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {/* Quick Sample Chips */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quick Presets:</span>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px' }}
            onClick={() => {
              const u = 'https://www.google.com/search?q=cybersecurity+training';
              setUrlInput(u);
              handleScan(u);
            }}
          >
            Safe: Google Search
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            onClick={() => {
              const u = 'http://paypal-verification-account-update.xyz/login.php?session_id=882910';
              setUrlInput(u);
              handleScan(u);
            }}
          >
            High Risk: Fake PayPal Login
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            onClick={() => {
              const u = 'http://192.168.1.105/bank/secure/login.html';
              setUrlInput(u);
              handleScan(u);
            }}
          >
            Suspicious: IP-based Banking Host
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '70px', width: '100%' }} />
          <div className="skeleton" style={{ height: '120px', width: '100%' }} />
        </div>
      )}

      {/* Scan Results Display */}
      {result && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ANALYZED TARGET</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--color-cyan)' }}>
                {result.hostname || result.rawUrl}
              </div>
            </div>

            <button className="btn btn-secondary" onClick={handleExport} style={{ fontSize: '12px' }}>
              <FileText size={14} /> Export Redacted Report
            </button>
          </div>

          <RiskScoreMeter
            score={result.riskScore}
            classification={result.classification}
            modelProbability={result.modelProbability}
            confidence={result.confidence}
            detectionMethod={result.detectionMethod}
          />

          <EvidencePanel
            indicators={result.indicators}
            limitations={result.limitations}
          />

          <RecommendationsBox
            recommendations={result.recommendations}
          />
        </div>
      )}

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportMarkdown={reportMarkdown}
      />
    </div>
  );
};
