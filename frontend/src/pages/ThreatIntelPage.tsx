import React, { useState, useEffect } from 'react';
import { Database, ShieldAlert, Search, Globe, CheckCircle2, AlertOctagon } from 'lucide-react';
import { api } from '../services/api';

export const ThreatIntelPage: React.FC = () => {
  const [intelData, setIntelData] = useState<any>(null);
  const [testHost, setTestHost] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getThreats()
      .then(res => setIntelData(res))
      .catch(() => {});
  }, []);

  const handleLookup = async () => {
    if (!testHost.trim()) return;
    setLoading(true);
    try {
      // Query through URL scanner endpoint to fetch threat intel check
      const res = await api.analyzeUrl(testHost.trim());
      setLookupResult(res.threatIntel || null);
    } catch (err: any) {
      alert('Lookup error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Database size={24} color="var(--color-cyan)" />
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Threat Intelligence Explorer</h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Transparent overview of integrated reputation providers, community threat feeds, and active domain blocklists.
        </p>
      </div>

      {/* Provider Status Cards */}
      <div className="grid-3">
        <div className="cyber-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>CyberShield Curated Feed</h4>
            <span className="badge badge-safe" style={{ fontSize: '10px' }}>Active</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Indexed high-confidence credential harvesters, smishing landing portals, and lookalike domains.
          </p>
        </div>

        <div className="cyber-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>URLhaus (abuse.ch)</h4>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>Connector Ready</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Open malware and malicious payload tracking API. Operates with backend key abstraction.
          </p>
        </div>

        <div className="cyber-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Safe Browsing Abstraction</h4>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>Integrated</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Google Safe Browsing reputation lookup client with local TTL cache and quota protection.
          </p>
        </div>
      </div>

      {/* Manual Host Lookup */}
      <div className="cyber-card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
          Query Domain Reputation Directly
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Check whether a specific domain is currently flagged in our reputation index.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="cyber-input"
            style={{ flex: 1, minWidth: '260px' }}
            placeholder="e.g. sbi-kyc-pan-update.top or google.com"
            value={testHost}
            onChange={e => setTestHost(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleLookup} disabled={loading}>
            <Search size={15} /> Check Feed
          </button>
        </div>

        {lookupResult && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-input)',
              border: `1px solid ${lookupResult.matched ? 'var(--color-highrisk)' : 'var(--color-safe)'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {lookupResult.matched ? (
                <>
                  <AlertOctagon size={18} color="var(--color-highrisk)" />
                  <strong style={{ color: 'var(--color-highrisk)' }}>FLAGGED ON THREAT INTEL: {lookupResult.threatCategory}</strong>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} color="var(--color-safe)" />
                  <strong style={{ color: 'var(--color-safe)' }}>NOT LISTED IN ACTIVE BLOCKLISTS</strong>
                </>
              )}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{lookupResult.evidence}</p>
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Provider: {lookupResult.provider} • Attribution: {lookupResult.attribution}
            </div>
          </div>
        )}
      </div>

      {/* Educational Notice */}
      <div className="cyber-card" style={{ borderLeft: '4px solid var(--color-suspicious)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
          ⚠️ Understanding Threat Intelligence Coverage
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Threat intelligence databases rely on reported and confirmed incidents. A result of "Not Listed" does <strong>NOT</strong> prove that a domain is safe. New phishing websites are registered every few seconds (zero-day phishing) and may not be indexed for hours or days. CyberShield AI always combines external reputation with local heuristic rules and machine learning.
        </p>
      </div>
    </div>
  );
};
