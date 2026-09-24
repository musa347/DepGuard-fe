import React from 'react';
import { ConfidenceLevel } from '../../types';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level, className = '' }) => {
  const normalized = (level || 'UNKNOWN').toUpperCase() as ConfidenceLevel;

  const config: Record<ConfidenceLevel, { label: string; text: string; bg: string; border: string }> = {
    HIGH: { label: 'Conf: HIGH', text: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
    MEDIUM: { label: 'Conf: MED', text: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
    LOW: { label: 'Conf: LOW', text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
    UNKNOWN: { label: 'Conf: UNK', text: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
  };

  const c = config[normalized] || config.UNKNOWN;

  return (
    <span
      className={`inline-flex items-center text-[11px] font-mono px-1.5 py-0.5 rounded border ${c.bg} ${c.text} ${c.border} ${className}`}
      title={`Confidence Level: ${normalized}`}
    >
      {c.label}
    </span>
  );
};
