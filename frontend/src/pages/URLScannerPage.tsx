import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Globe, Search, FileText } from 'lucide-react';
import { api } from '../services/api';
import type { ScanResult } from '../types';
import { PageHeader } from '../components/PageHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { AlertMessage } from '../components/AlertMessage';
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete URL analysis.';
      setError(msg);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Report generation error';
      setError('Could not generate export report: ' + msg);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Advanced URL Phishing Detector"
        description="Extracts 25+ lexical and structural features, evaluates brand impersonation, and queries threat feeds without visiting the target."
        icon={Globe}
        iconColor="var(--color-cyan)"
      />

      {/* Input Form Card */}
      <section className="cyber-card" aria-labelledby="url-form-heading">
        <h2 id="url-form-heading" className="sr-only">URL Analysis Input Form</h2>
        <label htmlFor="url-input" style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
          Target URL or Domain Name
        </label>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            id="url-input"
            type="url"
            className="cyber-input"
            style={{ flex: 1, minWidth: '280px' }}
            placeholder="e.g. http://paypal-verification-account-update.xyz/login.php or google.com"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            aria-describedby="url-hint"
          />
          <button
            className="btn btn-primary"
            onClick={() => handleScan()}
            disabled={loading}
            aria-label="Run URL Security Analysis"
          >
            <Search size={16} aria-hidden="true" />
            <span>{loading ? 'Analyzing...' : 'Run Analysis'}</span>
          </button>
        </div>

        <span id="url-hint" className="sr-only">
          Enter an HTTP or HTTPS web address to inspect for phishing indicators.
        </span>

        {error && <AlertMessage type="error" message={error} />}

        {/* Quick Sample Chips */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quick Presets:</span>
          <button
            type="button"
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
            type="button"
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
            type="button"
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            onClick={() => {
              const u = 'http://192.168.1.105/bank/secure/login.html';
              setUrlInput(u);
              handleScan(u);
            }}
          >
            Suspicious: IP Banking Host
          </button>
        </div>
      </section>

      {/* Loading Skeleton */}
      {loading && <LoadingSkeleton label="Extracting 25+ lexical features & querying threat feeds..." />}

      {/* Scan Results Display */}
      {result && !loading && (
        <section aria-label="Analysis Results" aria-live="polite">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ANALYZED TARGET</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--color-cyan)' }}>
                {result.hostname || result.rawUrl}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExport}
              style={{ fontSize: '12px' }}
              aria-label="Export Redacted Investigation Report"
            >
              <FileText size={14} aria-hidden="true" />
              <span>Export Redacted Report</span>
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
        </section>
      )}

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportMarkdown={reportMarkdown}
      />
    </div>
  );
};
