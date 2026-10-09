import React, { useState } from 'react';
import { Indicator } from '../types';
import { ChevronDown, ChevronRight, Eye, AlertCircle, Cpu, Globe } from 'lucide-react';

interface EvidencePanelProps {
  indicators: Indicator[];
  limitations?: string[];
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ indicators, limitations = [] }) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'OBSERVED_FACT':
        return <Eye size={16} color="var(--color-cyan)" />;
      case 'HEURISTIC_RULE':
        return <AlertCircle size={16} color="var(--color-suspicious)" />;
      case 'ML_PREDICTION':
        return <Cpu size={16} color="var(--color-blue)" />;
      case 'EXTERNAL_INTEL':
        return <Globe size={16} color="var(--color-highrisk)" />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
      case 'HIGH':
        return 'badge-highrisk';
      case 'MEDIUM':
        return 'badge-suspicious';
      default:
        return 'badge-safe';
    }
  };

  // Group indicators by source
  const groups = {
    EXTERNAL_INTEL: indicators.filter(i => i.source === 'EXTERNAL_INTEL'),
    ML_PREDICTION: indicators.filter(i => i.source === 'ML_PREDICTION'),
    HEURISTIC_RULE: indicators.filter(i => i.source === 'HEURISTIC_RULE'),
    OBSERVED_FACT: indicators.filter(i => i.source === 'OBSERVED_FACT')
  };

  return (
    <div className="cyber-card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔍 Explainable Evidence & Threat Indicators
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {indicators.length} signals identified
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {indicators.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No distinct risk indicators recorded.</p>
        ) : (
          indicators.map(ind => {
            const isExpanded = !!expandedIds[ind.id];
            return (
              <div
                key={ind.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  padding: '12px 16px',
                  transition: 'background 0.2s'
                }}
              >
                <div
                  onClick={() => toggleExpand(ind.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {getSourceIcon(ind.source)}
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{ind.title}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${getSeverityBadgeClass(ind.severity)}`} style={{ fontSize: '10px' }}>
                      {ind.severity}
                    </span>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  {ind.description}
                </p>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '12px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--text-muted)' }}>Why It Matters:</strong>
                      <p style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{ind.whyItMatters}</p>
                    </div>

                    {ind.observedValue && (
                      <div>
                        <strong style={{ color: 'var(--text-muted)' }}>Observed Value:</strong>
                        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)', marginTop: '2px' }}>
                          {ind.observedValue}
                        </p>
                      </div>
                    )}

                    <div>
                      <strong style={{ color: 'var(--text-muted)' }}>Source Category:</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{ind.source.replace('_', ' ')}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {limitations.length > 0 && (
        <div style={{ marginTop: '20px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
          <strong style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚠️ Analysis Limitations & Disclaimers
          </strong>
          <ul style={{ marginTop: '6px', paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
