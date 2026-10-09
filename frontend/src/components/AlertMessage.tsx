import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon, Info } from 'lucide-react';

interface AlertMessageProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  message: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type = 'error',
  message
}) => {
  if (!message) return null;

  const styles = {
    error: {
      borderColor: 'var(--color-highrisk)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: 'var(--color-highrisk)',
      icon: AlertOctagon
    },
    warning: {
      borderColor: 'var(--color-suspicious)',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      color: 'var(--color-suspicious)',
      icon: AlertTriangle
    },
    success: {
      borderColor: 'var(--color-safe)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      color: 'var(--color-safe)',
      icon: CheckCircle2
    },
    info: {
      borderColor: 'var(--color-cyan)',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      color: 'var(--color-cyan)',
      icon: Info
    }
  }[type];

  const Icon = styles.icon;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${styles.borderColor}`,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontSize: '13px',
        marginTop: '12px'
      }}
    >
      <Icon size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};
