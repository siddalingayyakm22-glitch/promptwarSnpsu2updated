import React from 'react';
import { FileCode2, Cpu, ShieldCheck, Layers, GitBranch, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

export const AboutMethodologyPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Architecture & AI Methodology"
        description="Transparent documentation of data pipelines, machine learning model specifications, feature extraction, and risk calibration algorithms."
        icon={FileCode2}
        badgeText="Whitepaper & Specs"
      />

      {/* End-to-End Pipeline Card */}
      <div className="cyber-card">
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
          CyberShield Detection Pipeline
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          Every investigation progresses through a deterministic, fail-safe 9-step pipeline designed to prevent false positives and zero-day omissions:
        </p>

        <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-cyan)', overflowX: 'auto', lineHeight: 1.8 }}>
          User Input → Validation & SSRF Guard → Lexical Feature Extraction → Machine Learning Inference (FastAPI) → Heuristic Rules Engine → Threat Intelligence Feed (Cached) → Blended Risk Aggregation (0-100) → Explainable Evidence Generation → Privacy-Preserving Logging
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid-2">
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Cpu size={20} color="var(--color-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Model Card: URL Phishing Classifier</h3>
          </div>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Architecture</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>RandomForestClassifier (100 Trees, Max Depth 12)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Features</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>24 Lexical, Hostname, TLD, Punycode & Structural metrics</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Top Predictors</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>Brand Mismatch, Suspicious TLD, IP Host, Keyword Count</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Evaluation Split</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>Stratified 80/20 Train-Test split</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Artifact Format</td>
                <td style={{ padding: '8px 0', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)' }}>url_model.joblib (124 KB)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Cpu size={20} color="var(--color-blue)" />
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Model Card: Message Scam Classifier</h3>
          </div>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Architecture</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>TF-IDF (1-2 N-grams) + LogisticRegression (Balanced)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Vocabulary Size</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>1,500 sublinear TF features</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Attack Coverage</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>OTP Theft, Bank Suspension, Prize, Telegram Task Fraud</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Evaluation Split</td>
                <td style={{ padding: '8px 0', fontWeight: 600 }}>Stratified 80/20 Train-Test split</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Artifact Format</td>
                <td style={{ padding: '8px 0', fontFamily: 'var(--font-mono)', color: 'var(--color-blue)' }}>message_model.joblib (60 KB)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Scoring Weights and Bands */}
      <div className="cyber-card">
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
          Calibrated Risk Scoring Framework
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          Risk scores are strictly bounded from 0 to 100. To ensure defensibility, scores represent product risk bands rather than empirical guarantees:
        </p>

        <div className="grid-3">
          <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontWeight: 800, color: 'var(--color-safe)', fontSize: '14px' }}>0 – 30: SAFE / LOW RISK</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Standard benign traffic patterns; no anomalous lexical signals or malicious threat matches observed.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontWeight: 800, color: 'var(--color-suspicious)', fontSize: '14px' }}>31 – 60: SUSPICIOUS</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Anomalous indicators detected (unusual TLD, urgency wording, shorteners). User should independently verify sender before interacting.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontWeight: 800, color: 'var(--color-highrisk)', fontSize: '14px' }}>61 – 100: HIGH RISK</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Confirmed threat intelligence match, brand impersonation, deceptive double file extension, or overt OTP harvesting solicitation.
            </p>
          </div>
        </div>
      </div>

      {/* Security & SSRF Defense Disclosures */}
      <div className="cyber-card">
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
          Server-Side Request Forgery (SSRF) Defense Architecture
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Under no circumstances does CyberShield AI execute untrusted browser rendering on victim URLs or fetch arbitrary remote content inside server environments. The system defends against SSRF via RFC 1918 private subnet blocking, cloud metadata IP isolation (169.254.169.254), IPv6 loopback filtration, and strict static parser isolation.
        </p>
      </div>
    </div>
  );
};
