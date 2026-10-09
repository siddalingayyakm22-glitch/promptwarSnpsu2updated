import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { RiskClassification } from '../types';

interface RiskBadgeProps {
  classification: RiskClassification;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ classification, showIcon = true }) => {
  if (classification === 'HIGH_RISK') {
    return (
      <span className="badge badge-highrisk" title="High Risk: Strong warning indicators observed">
        {showIcon && <AlertOctagon size={14} />}
        High Risk
      </span>
    );
  }

  if (classification === 'SUSPICIOUS') {
    return (
      <span className="badge badge-suspicious" title="Suspicious: Verify before interacting">
        {showIcon && <AlertTriangle size={14} />}
        Suspicious
      </span>
    );
  }

  return (
    <span className="badge badge-safe" title="Safe / Low observed risk">
      {showIcon && <ShieldCheck size={14} />}
      Safe / Low Risk
    </span>
  );
};
