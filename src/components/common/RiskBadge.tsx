import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const normalized = (level || 'UNKNOWN').toUpperCase() as RiskLevel;

  const config: Record<
    RiskLevel,
    { bg: string; text: string; border: string; label: string; iconDot: string }
  > = {
    CRITICAL: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'CRITICAL',
      iconDot: 'bg-red-600',
    },
    HIGH: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      label: 'HIGH',
      iconDot: 'bg-amber-600',
    },
    MEDIUM: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      label: 'MEDIUM',
      iconDot: 'bg-yellow-600',
    },
    LOW: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'LOW',
      iconDot: 'bg-emerald-600',
    },
    UNKNOWN: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      label: 'UNKNOWN',
      iconDot: 'bg-slate-400',
    },
  };

  const current = config[normalized] || config.UNKNOWN;

  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 leading-none font-medium',
    md: 'text-xs px-2 py-0.5 font-semibold',
    lg: 'text-sm px-2.5 py-1 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]} tracking-wide ${className}`}
      title={`Risk Assessment: ${current.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.iconDot} shrink-0`} />
      {showLabel && <span>{current.label}</span>}
    </span>
  );
};
