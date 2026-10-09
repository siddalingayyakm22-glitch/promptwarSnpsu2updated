import React, { useState, useEffect } from 'react';
import { Database, Search, CheckCircle2, AlertOctagon } from 'lucide-react';
import { api } from '../services/api';
import type { ThreatFeedOverview, ThreatIntelInfo } from '../types';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';

export const ThreatIntelPage: React.FC = () => {
  const [intelData, setIntelData] = useState<ThreatFeedOverview | null>(null);
  const [testHost, setTestHost] = useState('');
  const [lookupResult, setLookupResult] = useState<ThreatIntelInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getThreats()
      .then(res => setIntelData(res))
      .catch(() => {});
  }, []);

  const handleLookup = async () => {
    if (!testHost.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeUrl(testHost.trim());
      setLookupResult(res.threatIntel || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lookup failed';
      setError('Lookup error: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Threat Intelligence Explorer"
        description="Transparent overview of integrated reputation providers, community threat feeds, and active domain blocklists."
        icon={Database}
        iconColor="var(--color-cyan)"
      />

      {/* Provider Status Cards */}
      <section className="grid-3" aria-label="Threat Providers Status">
        <div className="cyber-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700 }}>CyberShield Curated Feed</h2>
            <span className="badge badge-safe" style={{ fontSize: '10px' }}>Active</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Indexed high-confidence credential harvesters, smishing landing portals, and lookalike domains.
          </p>
          {intelData && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Cached entries: {intelData.cacheEntries}
            </div>
          )}
        </div>

        <div className="cyber-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700 }}>URLhaus (abuse.ch)</h2>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>Connector Ready</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Open malware and malicious payload tracking API. Operates with backend key abstraction.
          </p>
        </div>

        <div className="cyber-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700 }}>Safe Browsing Abstraction</h2>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>Integrated</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Google Safe Browsing reputation lookup client with local TTL cache and quota protection.
          </p>
        </div>
      </section>

      {/* Manual Host Lookup */}
      <section className="cyber-card" aria-labelledby="query-reputation-heading">
        <h2 id="query-reputation-heading" style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
          Query Domain Reputation Directly
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Check whether a specific domain is currently flagged in our reputation index.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <label htmlFor="threat-domain-input" className="sr-only">Domain to query</label>
          <input
            id="threat-domain-input"
            type="text"
            className="cyber-input"
            style={{ flex: 1, minWidth: '260px' }}
            placeholder="e.g. sbi-kyc-pan-update.top or google.com"
            value={testHost}
            onChange={e => setTestHost(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleLookup}
            disabled={loading}
            aria-label="Check Threat Feed"
          >
            <Search size={15} aria-hidden="true" />
            <span>{loading ? 'Checking...' : 'Check Feed'}</span>
          </button>
        </div>

        {error && <AlertMessage type="error" message={error} />}

        {lookupResult && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-input)',
              border: `1px solid ${lookupResult.matched ? 'var(--color-highrisk)' : 'var(--color-safe)'}`
            }}
            role="status"
            aria-live="polite"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {lookupResult.matched ? (
                <>
                  <AlertOctagon size={18} color="var(--color-highrisk)" aria-hidden="true" />
                  <strong style={{ color: 'var(--color-highrisk)' }}>FLAGGED ON THREAT INTEL: {lookupResult.threatCategory}</strong>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} color="var(--color-safe)" aria-hidden="true" />
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
      </section>

      {/* Educational Notice */}
      <section className="cyber-card" style={{ borderLeft: '4px solid var(--color-suspicious)' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
          ⚠️ Understanding Threat Intelligence Coverage
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Threat intelligence databases rely on reported and confirmed incidents. A result of "Not Listed" does <strong>NOT</strong> prove that a domain is safe. New phishing websites are registered every few seconds (zero-day phishing) and may not be indexed for hours or days. CyberShield AI always combines external reputation with local heuristic rules and machine learning.
        </p>
      </section>
    </div>
  );
};
