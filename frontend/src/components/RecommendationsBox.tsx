import React from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface RecommendationsBoxProps {
  recommendations: string[];
}

export const RecommendationsBox: React.FC<RecommendationsBoxProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="cyber-card" style={{ marginTop: '20px', borderLeft: '4px solid var(--color-cyan)' }}>
      <h4 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <ShieldAlert size={18} color="var(--color-cyan)" />
        Recommended Safety Next Steps
      </h4>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recommendations.map((rec, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
            <CheckCircle2 size={16} color="var(--color-safe)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ color: 'var(--text-primary)' }}>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
