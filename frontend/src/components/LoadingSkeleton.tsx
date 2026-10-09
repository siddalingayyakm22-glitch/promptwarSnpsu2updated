import React from 'react';

interface LoadingSkeletonProps {
  label?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  label = 'Performing security investigation...',
  lines = 2
}) => {
  return (
    <div
      className="cyber-card"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}
    >
      <span className="sr-only">{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>

      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: i === 0 ? '70px' : '90px', width: '100%', borderRadius: 'var(--radius-md)' }}
        />
      ))}
    </div>
  );
};
