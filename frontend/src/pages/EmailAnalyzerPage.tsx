import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Search, AlertTriangle, FileText, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { EvidencePanel } from '../components/EvidencePanel';
import { RecommendationsBox } from '../components/RecommendationsBox';
import { ReportExportModal } from '../components/ReportExportModal';

export const EmailAnalyzerPage: React.FC = () => {
  const location = useLocation();
  const prefill = location.state?.prefill || {};

  const [sender, setSender] = useState(prefill.sender || '');
  const [displayName, setDisplayName] = useState(prefill.displayName || '');
  const [replyTo, setReplyTo] = useState(prefill.replyTo || '');
  const [subject, setSubject] = useState(prefill.subject || '');
  const [body, setBody] = useState(prefill.body || '');
  const [rawHeaders, setRawHeaders] = useState(prefill.rawHeaders || '');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');

  const handleScan = async () => {
    if (!sender && !body && !subject) {
      setError('Please provide at least a sender address, subject, or email body to evaluate.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeEmail({
        sender,
        displayName,
        replyTo,
        subject,
        body,
        rawHeaders
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to complete email security analysis.');
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
          <Mail size={24} color="var(--color-blue)" />
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Email Security & BEC Analyzer</h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Inspects display name spoofing, reply-to routing deception, wire fraud/BEC phrases, and evaluates SPF, DKIM, and DMARC authentication headers.
        </p>
      </div>

      <div className="cyber-card">
        <div className="grid-2" style={{ marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              From Display Name
            </label>
            <input
              type="text"
              className="cyber-input"
              placeholder="e.g. PayPal Security Center or CEO John Doe"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              From Sender Address
            </label>
            <input
              type="text"
              className="cyber-input"
              placeholder="e.g. security-notice99@random-mail.xyz"
              value={sender}
              onChange={e => setSender(e.target.value)}
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Reply-To Address (Optional)
            </label>
            <input
              type="text"
              className="cyber-input"
              placeholder="e.g. attacker-collector@gmail.com"
              value={replyTo}
              onChange={e => setReplyTo(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Email Subject Line
            </label>
            <input
              type="text"
              className="cyber-input"
              placeholder="e.g. Urgent: Wire Transfer or Password Expiration Notice"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Email Body Content
          </label>
          <textarea
            className="cyber-input"
            style={{ minHeight: '90px' }}
            placeholder="Paste the email message body here..."
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-muted)' }}>
            Optional Raw Email Headers (Received-SPF, DKIM-Signature, Authentication-Results)
          </label>
          <textarea
            className="cyber-input"
            style={{ minHeight: '60px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
            placeholder="Paste raw email header snippet (e.g. Received-SPF: pass / fail; dkim=pass / fail)..."
            value={rawHeaders}
            onChange={e => setRawHeaders(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
              onClick={() => {
                setDisplayName('PayPal Customer Service');
                setSender('notice@fake-paypa1-update.xyz');
                setReplyTo('hacker-inbox@gmail.com');
                setSubject('Account Limited: Verify Identity');
                setBody('Your PayPal account has been restricted due to suspicious activities. Click to verify identity immediately.');
                setRawHeaders('Received-SPF: fail (google.com: domain does not designate sender IP)');
              }}
            >
              Preset: Spoofed PayPal
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
              onClick={() => {
                setDisplayName('CEO Office');
                setSender('ceo@corp-company.com');
                setReplyTo('ceo-personal@outlook.com');
                setSubject('URGENT: Wire Transfer for Vendor');
                setBody('Please execute a direct wire transfer of $25,000 to the attached invoice today. I am currently in a board meeting and cannot take calls.');
                setRawHeaders('');
              }}
            >
              Preset: BEC Wire Fraud
            </button>
          </div>

          <button className="btn btn-primary" onClick={handleScan} disabled={loading}>
            <Search size={16} /> Run Email Analysis
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '12px', color: 'var(--color-highrisk)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}
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
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>INVESTIGATION SUBJECT</span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-cyan)' }}>
                {subject || sender || 'Email Security Report'}
              </div>
            </div>

            <button className="btn btn-secondary" onClick={handleExport} style={{ fontSize: '12px' }}>
              <FileText size={14} /> Export Redacted Report
            </button>
          </div>

          {/* Sub-Risk Score Breakdown */}
          <div className="grid-3" style={{ marginBottom: '16px' }}>
            <div className="cyber-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>SENDER & SPOOFING RISK</span>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: (result.senderRisk || 0) > 40 ? 'var(--color-highrisk)' : 'var(--color-safe)' }}>
                {result.senderRisk || 0}/100
              </div>
            </div>

            <div className="cyber-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>MESSAGE & BEC LURE RISK</span>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: (result.messageRisk || 0) > 40 ? 'var(--color-highrisk)' : 'var(--color-safe)' }}>
                {result.messageRisk || 0}/100
              </div>
            </div>

            <div className="cyber-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>EMBEDDED LINK RISK</span>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: (result.linkRisk || 0) > 40 ? 'var(--color-highrisk)' : 'var(--color-safe)' }}>
                {result.linkRisk || 0}/100
              </div>
            </div>
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
