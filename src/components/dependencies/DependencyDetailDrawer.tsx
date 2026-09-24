import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldAlert,
  Clock,
  Layers,
  Check,
  Copy,
  AlertTriangle,
  GitCommit,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { Dependency } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { EolBadge } from '../common/EolBadge';
import { ScopeBadge } from '../common/ScopeBadge';

interface DependencyDetailDrawerProps {
  dependency: Dependency | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DependencyDetailDrawer: React.FC<DependencyDetailDrawerProps> = ({
  dependency,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !dependency) return null;

  const rec = dependency.recommendation;
  const isTransitive = dependency.type === 'TRANSITIVE';

  const xmlSnippet = rec?.recommendedVersion
    ? isTransitive
      ? `<!-- Add to <dependencyManagement> in root pom.xml to override transitive version -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>${dependency.groupId}</groupId>
      <artifactId>${dependency.artifactId}</artifactId>
      <version>${rec.recommendedVersion}</version>
    </dependency>
  </dependencies>
</dependencyManagement>`
      : `<!-- Update version in pom.xml -->
<dependency>
  <groupId>${dependency.groupId}</groupId>
  <artifactId>${dependency.artifactId}</artifactId>
  <version>${rec.recommendedVersion}</version>
</dependency>`
    : null;

  const handleCopy = () => {
    if (xmlSnippet) {
      navigator.clipboard.writeText(xmlSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-start justify-between gap-4 bg-[#F8FAFC]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <ScopeBadge type={dependency.type} scope={dependency.scope} />
              <RiskBadge level={dependency.risk} />
              <ConfidenceBadge level={dependency.confidence} />
            </div>
            <h2 className="text-base font-bold font-mono text-[#0F172A] break-all">
              {dependency.groupId}:{dependency.artifactId}
            </h2>
            <div className="text-xs font-mono text-[#64748B] mt-0.5">
              Current version: <span className="font-semibold text-slate-800">{dependency.version}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Description */}
          {dependency.description && (
            <p className="text-slate-600 leading-relaxed">{dependency.description}</p>
          )}

          {/* Inclusion Trace (Breadcrumb path for direct or transitive) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Dependency Inclusion Trace</span>
            </div>
            <div className="font-mono text-[11px] space-y-1 text-slate-600 bg-white p-2.5 rounded border border-slate-200">
              {dependency.transitivePath && dependency.transitivePath.length > 0 ? (
                dependency.transitivePath.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5"
                    style={{ paddingLeft: `${idx * 12}px` }}
                  >
                    <span className="text-slate-400">
                      {idx === dependency.transitivePath!.length - 1 ? '└──' : '├──'}
                    </span>
                    <span
                      className={
                        idx === dependency.transitivePath!.length - 1
                          ? 'font-bold text-[#2563EB]'
                          : 'text-slate-700'
                      }
                    >
                      {step}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-700 font-semibold">
                  └── Direct project dependency in pom.xml
                </div>
              )}
            </div>
          </div>

          {/* EOL Evaluation */}
          <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Lifecycle & End of Life Status</span>
              </div>
              <EolBadge eol={dependency.eol} />
            </div>

            <p className="text-slate-600">
              {dependency.eol.description || 'No lifecycle alerts identified in upstream repository.'}
            </p>

            {dependency.eol.sourceName && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>Source:</span>
                <span className="font-mono text-slate-700">{dependency.eol.sourceName}</span>
                {dependency.eol.sourceUrl && (
                  <a
                    href={dependency.eol.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2563EB] hover:underline inline-flex items-center gap-0.5 ml-1"
                  >
                    inspect <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Vulnerabilities Section */}
          <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <ShieldAlert className="w-4 h-4 text-slate-500" />
                <span>Known Security Advisories ({dependency.vulnerabilities.length})</span>
              </div>
            </div>

            {dependency.vulnerabilities.length === 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero known CVE or GHSA advisories reported for this artifact.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {dependency.vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
                        <span>{vuln.id}</span>
                        {vuln.cvssScore && (
                          <span className="text-[11px] px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                            CVSS {vuln.cvssScore}
                          </span>
                        )}
                      </div>
                      <RiskBadge level={vuln.severity} size="sm" />
                    </div>

                    {vuln.title && (
                      <div className="font-semibold text-slate-800">{vuln.title}</div>
                    )}

                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {vuln.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Feed: {vuln.feed}</span>
                      {vuln.fixedIn && (
                        <span className="text-emerald-700 font-semibold">
                          Fixed in: {vuln.fixedIn}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remediation & Recommendation Section */}
          <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Wrench className="w-4 h-4 text-slate-500" />
                <span>Remediation Recommendation</span>
              </div>
            </div>

            {rec ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-2 p-3 bg-blue-50/70 border border-blue-200 rounded">
                  <div>
                    <div className="text-[11px] text-slate-500 font-mono">Recommended Target:</div>
                    <div className="text-base font-bold font-mono text-[#2563EB]">
                      {rec.recommendedVersion}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium border ${
                        rec.compatibility === 'Compatible'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {rec.compatibility}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">{rec.upgradeType}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-slate-700">
                  <div className="font-semibold text-slate-900">Compatibility Assessment:</div>
                  <p className="leading-relaxed text-slate-600">{rec.compatibilityAssessment}</p>
                </div>

                <div className="space-y-1.5 text-slate-700">
                  <div className="font-semibold text-slate-900">Remediation Rationale:</div>
                  <p className="leading-relaxed text-slate-600">{rec.reason}</p>
                </div>

                {xmlSnippet && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Maven POM Configuration:</span>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[11px] text-[#2563EB] hover:text-blue-700 font-medium"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy XML</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-[#0F172A] text-slate-100 p-3 rounded text-[11px] font-mono overflow-x-auto">
                      <code>{xmlSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1 text-slate-700">
                <div className="font-semibold text-slate-800">
                  No automated recommendation available
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  DepGuard could not calculate an automated upgrade path from verified upstream metadata. Manual maintainer inspection is advised.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>DepGuard Maven Inspector</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
