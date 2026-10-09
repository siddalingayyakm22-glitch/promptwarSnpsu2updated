import React from 'react';
import { RiskClassification } from '../types';
import { RiskBadge } from './RiskBadge';

interface RiskScoreMeterProps {
  score: number;
  classification: RiskClassification;
  modelProbability?: number | null;
  confidence?: number | null;
  detectionMethod?: string;
}

export const RiskScoreMeter: React.FC<RiskScoreMeterProps> = ({
  score,
  classification,
  modelProbability,
  confidence,
  detectionMethod
}) => {
  const modeClass = classification.toLowerCase().replace('_', '');

  return (
    <div className="meter-gauge-container">
      <div
        className={`meter-circle ${modeClass}`}
        style={{ '--percentage': score } as React.CSSProperties}
      >
        <div className="meter-inner">
          <span style={{ fontSize: '20px', fontWeight: 800 }}>{score}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/100</span>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <RiskBadge classification={classification} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Method: <strong>{detectionMethod || 'RULE_BASED'}</strong>
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {classification === 'HIGH_RISK' && 'Critical warning signals identified. Interacting poses severe security or financial risks.'}
          {classification === 'SUSPICIOUS' && 'Anomalous patterns detected. Exercise caution and verify identity independently.'}
          {classification === 'SAFE' && 'No immediate malicious patterns observed. Target appears consistent with standard benign traffic.'}
        </p>

        {(modelProbability !== null && modelProbability !== undefined) && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>ML Probability: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(modelProbability * 100)}%</strong></span>
            {(confidence !== null && confidence !== undefined) && (
              <span>Confidence: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(confidence * 100)}%</strong></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
