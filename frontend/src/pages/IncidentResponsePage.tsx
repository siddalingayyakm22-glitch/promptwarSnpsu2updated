import React, { useState } from 'react';
import { LifeBuoy, PhoneCall, ShieldAlert, CheckSquare, Square, ExternalLink, ArrowRight } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'shared-otp',
    title: 'I shared an OTP or PIN',
    urgency: 'CRITICAL',
    steps: [
      'Call your bank fraud helpline immediately (or dial 1930 in India) to block all debit cards and net banking accounts.',
      'Log into your official banking app from a secure device and freeze your debit/credit card.',
      'Check transaction history for any unauthorized debit entries and note down transaction UTR/reference IDs.',
      'Change your net banking and mobile banking login passwords and transaction PINs immediately.',
      'File an official incident report on cybercrime.gov.in.'
    ]
  },
  {
    id: 'sent-money',
    title: 'I transferred money to a scammer (UPI / Wire)',
    urgency: 'CRITICAL',
    steps: [
      'Golden Hour Protocol: Contact your bank immediately within 2 hours to initiate a payment recall / hold request.',
      'In India: Call the National Cybercrime Helpline 1930 immediately to register a financial cyber fraud complaint.',
      'Take screenshots of the payment confirmation, beneficiary UPI ID/account number, and transaction reference (UTR).',
      'Contact the payment app provider (PhonePe, Google Pay, Paytm, etc.) via their in-app dispute resolution center.',
      'File a complaint at the nearest Cyber Police Station or cybercrime.gov.in.'
    ]
  },
  {
    id: 'entered-password',
    title: 'I entered my password on a suspicious site',
    urgency: 'HIGH',
    steps: [
      'Immediately change the password for the affected service using the genuine official app or website.',
      'If you reused that password on other accounts (email, banking), change those passwords right away.',
      'Enable Multi-Factor Authentication (MFA/2FA) using an authenticator app (Google Authenticator, Microsoft Authenticator).',
      'Go to account security settings and choose "Sign out of all other sessions / devices".',
      'Check account recovery email and phone number to ensure the attacker did not alter them.'
    ]
  },
  {
    id: 'clicked-link',
    title: 'I clicked a suspicious link (no password entered)',
    urgency: 'MEDIUM',
    steps: [
      'Close the browser tab immediately.',
      'Check your browser "Downloads" folder: if any file (.apk, .exe, .scr, .zip) downloaded automatically, delete it immediately without opening.',
      'Clear browser cookies, cache, and history for the last 24 hours.',
      'Run a full system malware scan using your antivirus (e.g. Windows Defender).',
      'Keep your device operating system and browser updated.'
    ]
  },
  {
    id: 'installed-app',
    title: 'I installed an APK or Remote Desktop App (AnyDesk/TeamViewer)',
    urgency: 'CRITICAL',
    steps: [
      'Disconnect device from Wi-Fi and Mobile Data (Turn on Airplane Mode immediately).',
      'Uninstall the suspicious application or remote sharing tool from your phone settings.',
      'Revoke Accessibility Services permissions granted to the app.',
      'Restart the device in Safe Mode if the app resists uninstallation.',
      'Using a separate clean device, change passwords for all banking and email accounts logged in on the compromised device.'
    ]
  }
];

export const IncidentResponsePage: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState('shared-otp');
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0];

  const toggleCheck = (idx: number) => {
    const key = `${activeScenarioId}_${idx}`;
    setCheckedSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <LifeBuoy size={24} color="var(--color-highrisk)" />
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Incident Response Assistant</h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Step-by-step emergency mitigation workflows for suspected scams, account takeovers, and fraudulent transactions.
        </p>
      </div>

      {/* Official India Helpline Banner */}
      <div
        className="cyber-card"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
          borderColor: 'rgba(239, 68, 68, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <PhoneCall size={20} color="var(--color-highrisk)" />
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>India National Cybercrime Helpline: 1930</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Call <strong>1930</strong> immediately to freeze defrauded funds during the golden hour (Indian Ministry of Home Affairs).
            </p>
          </div>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '13px', color: 'var(--color-cyan)', borderColor: 'var(--color-cyan)' }}
          >
            cybercrime.gov.in <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Incident Selection Chips */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
          Select What Happened:
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              className={`btn ${activeScenarioId === sc.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '13px' }}
              onClick={() => setActiveScenarioId(sc.id)}
            >
              {sc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Containment Checklist */}
      <div className="cyber-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{activeScenario.title}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Follow these prioritized containment actions in order:
            </span>
          </div>

          <span className={`badge ${activeScenario.urgency === 'CRITICAL' ? 'badge-highrisk' : 'badge-suspicious'}`}>
            {activeScenario.urgency} URGENCY
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeScenario.steps.map((step, idx) => {
            const isChecked = !!checkedSteps[`${activeScenarioId}_${idx}`];
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: isChecked ? '1px solid var(--color-safe)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ marginTop: '2px', color: isChecked ? 'var(--color-safe)' : 'var(--text-muted)' }}>
                  {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-cyan)' }}>
                      STEP {idx + 1}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                    {step}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
