import React from 'react';
import { EolRecord } from '../../types';

interface EolBadgeProps {
  eol: EolRecord;
  className?: string;
}

export const EolBadge: React.FC<EolBadgeProps> = ({ eol, className = '' }) => {
  if (eol.isEol) {
    const text = eol.eolDate ? `EOL (${eol.eolDate})` : 'EOL';
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
        title={eol.description || 'End of Life'}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
        {text}
      </span>
    );
  }

  if (eol.status === 'UNKNOWN') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        title={eol.description || 'Lifecycle unindexed / Unknown'}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        UNKNOWN (No data)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
      title={eol.description || 'Active upstream support'}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      Active
    </span>
  );
};
