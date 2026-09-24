import React from 'react';
import { ScanStatus } from '../../types';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: ScanStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          COMPLETED
        </span>
      );
    case 'RUNNING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
        >
          <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          RUNNING
        </span>
      );
    case 'FAILED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          FAILED
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          UNKNOWN
        </span>
      );
  }
};
