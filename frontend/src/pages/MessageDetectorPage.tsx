import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Search, AlertTriangle, FileText } from 'lucide-react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { EvidencePanel } from '../components/EvidencePanel';
import { RecommendationsBox } from '../components/RecommendationsBox';
import { ReportExportModal } from '../components/ReportExportModal';

export const MessageDetectorPage: React.FC = () => {
  const location = useLocation();
  const prefill = location.state?.prefill?.message || '';

  const [messageInput, setMessageInput] = useState(prefill);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');

  const handleScan = async (msgToScan?: string) => {
    const toScan = msgToScan || messageInput;
    if (!toScan.trim()) {
      setError('Please paste or enter message text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeMessage(toScan.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to complete message analysis.');
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
          <MessageSquare size={24} color="var(--color-suspicious)" />
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Message Scam & Smishing Detector</h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Evaluates SMS, WhatsApp, and social media messages for coercive urgency, OTP harvesting, fake job scams, and prize lures using NLP classifiers and cybersecurity heuristics.
        </p>
      </div>

      <div className="cyber-card">
        <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
          Paste Message Body
        </label>

        <textarea
          className="cyber-input cyber-textarea"
          placeholder="Paste SMS text, WhatsApp forward, or suspicious message here..."
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {messageInput.length} characters
          </div>

          <button
            className="btn btn-primary"
            onClick={() => handleScan()}
            disabled={loading}
          >
            {loading ? <span className="skeleton" style={{ width: '60px', height: '16px' }} /> : (
              <>
                <Search size={16} /> Analyze Content
              </>
            )}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '12px', color: 'var(--color-highrisk)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {/* Quick Presets */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quick Presets:</span>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            onClick={() => {
              const m = 'URGENT: Your SBI Bank account has been SUSPENDED due to incomplete KYC! Click here immediately to update PAN or your account will be blocked within 24 hours: http://sbi-kyc-pan-update.top';
              setMessageInput(m);
              handleScan(m);
            }}
          >
            Bank KYC Suspension (High Risk)
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            onClick={() => {
              const m = 'CONGRATULATIONS! You have won $1,000,000 in the International Coca Cola Lottery! To claim your cash prize, share your full name, bank details and pay $50 processing fee.';
              setMessageInput(m);
              handleScan(m);
            }}
          >
            Lottery Prize (High Risk)
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            onClick={() => {
              const m = 'Work from home and earn $300-$800 daily by simply rating apps and liking videos! Immediate payout on Telegram @VIPEarnDaily.';
              setMessageInput(m);
              handleScan(m);
            }}
          >
            Telegram Task Scam (Suspicious)
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px' }}
            onClick={() => {
              const m = 'Hi! Your appointment with Dr. Sharma is confirmed for tomorrow at 10:30 AM at Central Clinic.';
              setMessageInput(m);
              handleScan(m);
            }}
          >
            Clinic Reminder (Safe)
          </button>
        </div>
      </div>

      {loading && (
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '70px', width: '100%' }} />
          <div className="skeleton" style={{ height: '120px', width: '100%' }} />
        </div>
      )}

      {result && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>REDACTED INVESTIGATION TARGET</span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                "{result.redactedInput}"
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
