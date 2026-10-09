import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, MessageSquare, Mail, QrCode, Bot, Shield,
  ArrowRight, Activity, AlertTriangle, Play
} from 'lucide-react';
import { DemoCasesModal } from '../components/DemoCasesModal';
import { api } from '../services/api';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [stats, setStats] = useState({ totalScans: 0, threatsDetected: 0, avgRiskScore: 0 });

  useEffect(() => {
    api.getDashboard()
      .then(res => {
        if (res && res.summary) {
          setStats({
            totalScans: res.summary.totalScans,
            threatsDetected: res.summary.threatsDetected,
            avgRiskScore: res.summary.averageRiskScore
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Section */}
      <section
        className="cyber-card"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '9999px', backgroundColor: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', marginBottom: '16px' }}>
            <Shield size={14} color="var(--color-cyan)" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-cyan)', letterSpacing: '0.5px' }}>
              NEXT-GEN AI CYBERSECURITY DECISION SUPPORT
            </span>
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.8px', marginBottom: '14px' }}>
            Stay Ahead of Digital Threats.
          </h1>

          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
            Analyze suspicious links, messages, and emails. Understand the risks and take safer next steps with CyberShield AI. Powered by machine learning, heuristic rules, and live threat intelligence.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => navigate('/scan-url')}>
              <Globe size={16} /> Scan a URL
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/scan-message')}>
              <MessageSquare size={16} /> Analyze a Message
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/scan-email')}>
              <Mail size={16} /> Analyze an Email
            </button>
          </div>

          {/* Secondary Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={() => navigate('/copilot')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-cyan)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <Bot size={15} /> Open Security Copilot <ArrowRight size={14} />
            </button>

            <button
              onClick={() => navigate('/learn')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Explore Cyber Safety <ArrowRight size={14} />
            </button>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'var(--color-suspicious)',
                cursor: 'pointer',
                padding: '4px 12px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <Play size={13} /> Try 10 Preset Demo Scenarios
            </button>
          </div>
        </div>
      </section>

      {/* Live Metrics Row */}
      <section className="grid-3">
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL INVESTIGATIONS</span>
            <Activity size={18} color="var(--color-cyan)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800 }}>{stats.totalScans}</div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Scanned in current database session</span>
        </div>

        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>THREATS INTERCEPTED</span>
            <AlertTriangle size={18} color="var(--color-highrisk)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-highrisk)' }}>
            {stats.threatsDetected}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Suspicious and high-risk detections</span>
        </div>

        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>AVERAGE RISK SCORE</span>
            <Shield size={18} color="var(--color-safe)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: stats.avgRiskScore > 50 ? 'var(--color-highrisk)' : 'var(--color-safe)' }}>
            {stats.avgRiskScore}/100
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Normalized threat index</span>
        </div>
      </section>

      {/* 4 Questions Product Promise */}
      <section className="cyber-card">
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
          Every Investigation Answers 4 Key Questions
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Transparent, explainable cybersecurity decision support rather than opaque black-box verdicts.
        </p>

        <div className="grid-4">
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-cyan)', marginBottom: '6px' }}>
              1. What threat might this be?
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Identifies credential harvesters, smishing, invoice fraud, or quishing redirections.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-suspicious)', marginBottom: '6px' }}>
              2. How serious is the risk?
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Calculates calibrated 0–100 risk bands: Safe (0-30), Suspicious (31-60), High Risk (61-100).
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-blue)', marginBottom: '6px' }}>
              3. What is the evidence?
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Distinguishes observed facts, heuristic flags, ML probability, and threat feed matches.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-safe)', marginBottom: '6px' }}>
              4. What should you do next?
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Provides concrete mitigation steps, official helplines (1930 in India), and password advice.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Navigation Grid */}
      <section>
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
          Threat Inspection Modules
        </h2>

        <div className="grid-3">
          <div className="cyber-card cyber-card-interactive" onClick={() => navigate('/scan-url')}>
            <Globe size={24} color="var(--color-cyan)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>URL Phishing Scanner</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Detects brand spoofing, punycode lookalikes, IP hosts, and anomalous TLDs without visiting risky destinations.
            </p>
          </div>

          <div className="cyber-card cyber-card-interactive" onClick={() => navigate('/scan-message')}>
            <MessageSquare size={24} color="var(--color-suspicious)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Message Scam Detector</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Identifies OTP theft, fake job offers, urgency pressure, lottery lures, and fraudulent UPI payment solicitations.
            </p>
          </div>

          <div className="cyber-card cyber-card-interactive" onClick={() => navigate('/scan-email')}>
            <Mail size={24} color="var(--color-blue)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Email Security Analyzer</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Detects display-name impersonation, reply-to discrepancies, and checks cryptographic SPF/DKIM/DMARC headers.
            </p>
          </div>

          <div className="cyber-card cyber-card-interactive" onClick={() => navigate('/scan-qr')}>
            <QrCode size={24} color="var(--color-safe)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>QR Code Phishing Scanner</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Decodes QR images locally to inspect disguised redirect destinations and UPI payment intents before scanning.
            </p>
          </div>

          <div className="cyber-card cyber-card-interactive" onClick={() => navigate('/copilot')}>
            <Bot size={24} color="var(--color-cyan)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>AI Security Copilot</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Context-aware assistant explaining threats in plain language with built-in prompt-injection defense.
            </p>
          </div>

          <div className="cyber-card cyber-card-interactive" onClick={() => navigate('/incident-response')}>
            <Shield size={24} color="var(--color-highrisk)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Incident Response (1930)</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Emergency interactive step-by-step checklist if you clicked a link, entered a password, or shared an OTP.
            </p>
          </div>
        </div>
      </section>

      <DemoCasesModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};
