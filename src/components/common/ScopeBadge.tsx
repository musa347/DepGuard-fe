import React from 'react';
import { DependencyType, DependencyScope } from '../../types';

interface ScopeBadgeProps {
  type?: DependencyType;
  scope?: DependencyScope;
  className?: string;
}

export const ScopeBadge: React.FC<ScopeBadgeProps> = ({ type, scope, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {type && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium border ${
            type === 'DIRECT'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {type === 'TRANSITIVE' ? '└── TRANSITIVE' : 'DIRECT'}
        </span>
      )}
      {scope && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200">
          {scope}
        </span>
      )}
    </div>
  );
};
