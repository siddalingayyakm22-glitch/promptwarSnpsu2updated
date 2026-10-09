import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  badgeText?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = 'var(--color-cyan)',
  badgeText,
  action
}) => {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-hidden="true"
          >
            <Icon size={22} color={iconColor} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.3px' }}>
            {title}
          </h1>
          {badgeText && (
            <span className="badge badge-info" style={{ fontSize: '10px' }}>
              {badgeText}
            </span>
          )}
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '750px', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      {action && (
        <div style={{ alignSelf: 'center' }}>
          {action}
        </div>
      )}
    </header>
  );
};
