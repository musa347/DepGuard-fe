import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  GitBranch,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  Layers,
  ArrowRight,
  Info,
  Server,
} from 'lucide-react';
import { useRemediations } from '../hooks/useRemediations';
import { RiskBadge } from '../components/common/RiskBadge';
import { truncateSha } from '../utils/formatters';

export const RemediationPage: React.FC = () => {
  const { projectId, scanId } = useParams<{ projectId: string; scanId: string }>();
  const { data: remediationData, isLoading } = useRemediations(projectId, scanId);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (isLoading || !remediationData) {
    return (
      <div className="p-8 max-w-7xl w-full mx-auto text-[#64748B]">
        Loading remediation intelligence...
      </div>
    );
  }

  const handleCopySnippet = (id: string, xml: string) => {
    navigator.clipboard.writeText(xml);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
        <Link to="/projects" className="hover:text-[#2563EB] transition-colors">
          projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/projects/${projectId}`} className="hover:text-[#2563EB] transition-colors">
          {projectId}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#0F172A] font-semibold">remediation</span>
      </div>

      {/* Screen 7 Header */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            {remediationData.projectName} Remediation Recommendations
          </h1>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs font-mono text-[#64748B] mt-2">
            <span>{remediationData.repository}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span>branch: {remediationData.branch}</span>
            </div>
            <span>•</span>
            <span>commit: {truncateSha(remediationData.commitSha)}</span>
            <span>•</span>
            <span>Scanned {remediationData.scannedTimestamp}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/projects/${projectId}/report`}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Return to Report
          </Link>
        </div>
      </div>

      {/* Top 3 Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Attention Required
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-3xl font-bold font-mono text-amber-800">
            {remediationData.attentionRequiredCount}
          </div>
          <div className="mt-1 text-xs text-amber-900 font-medium">
            Unmaintained or vulnerable dependencies
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Recommendations Available
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="mt-2 text-3xl font-bold font-mono text-[#0F172A]">
            {remediationData.availableRecommendationsCount}
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            Automated upgrade targets computed
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
              Cross-Major Upgrades
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-3xl font-bold font-mono text-rose-800">
            {remediationData.crossMajorCount}
          </div>
          <div className="mt-1 text-xs text-rose-900 font-medium">
            API or baseline drift; manual review required
          </div>
        </div>
      </div>

      {/* Upgrade Considerations Guidance Banner */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-semibold text-xs text-blue-900 uppercase tracking-wider">
          <Info className="w-4 h-4 text-[#2563EB]" />
          <span>Upgrade Considerations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded border border-blue-200/80 space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Same-Major Upgrades</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Lower compatibility risk. Represents in-stream patch or minor release movements preserving stable binary interface signatures.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded border border-blue-200/80 space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Cross-Major Upgrades</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              May require engineering adaptation. Often involves JDK baseline shifts (e.g. Java 17+), Jakarta namespace migration, or deprecated API removals.
            </p>
          </div>
        </div>
      </div>

      {/* Remediation Cards List */}
      <div className="space-y-4">
        {remediationData.items.map((item) => {
          const rec = item.recommendation;
          const hasRec = Boolean(rec.recommendedVersion);
          const isTransitive = item.type === 'TRANSITIVE';

          const xmlCode = hasRec
            ? isTransitive
              ? `<dependencyManagement>\n  <dependencies>\n    <dependency>\n      <groupId>${item.groupId}</groupId>\n      <artifactId>${item.artifactId}</artifactId>\n      <version>${rec.recommendedVersion}</version>\n    </dependency>\n  </dependencies>\n</dependencyManagement>`
              : `<dependency>\n  <groupId>${item.groupId}</groupId>\n  <artifactId>${item.artifactId}</artifactId>\n  <version>${rec.recommendedVersion}</version>\n</dependency>`
            : '';

          return (
            <div
              key={item.dependencyId}
              className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-base font-bold text-[#0F172A]">
                      {item.groupId}:{item.artifactId}
                    </span>
                    <RiskBadge level={item.risk} size="sm" />
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        item.eolBadgeType === 'error'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.eolBadgeType === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.eolStatus}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.type}
                    </span>
                  </div>
                  {item.transitiveInfo && (
                    <div className="text-xs font-mono text-[#64748B] flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>{item.transitiveInfo}</span>
                    </div>
                  )}
                </div>

                {/* Target Version Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono text-slate-400">Current</div>
                    <div className="font-mono font-semibold text-xs text-slate-700">
                      {item.currentVersion}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-mono text-slate-400">Target</div>
                    {hasRec ? (
                      <div className="font-mono font-bold text-sm text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {rec.recommendedVersion}
                      </div>
                    ) : (
                      <div className="font-mono text-xs text-slate-500 italic">
                        Not available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Version & Compatibility Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B]">Upgrade Type: </span>
                  <span className="font-semibold text-slate-800">{rec.upgradeType}</span>
                </div>
                <div>
                  <span className="text-[#64748B]">Compatibility: </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${
                      rec.compatibility === 'Compatible'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : rec.compatibility === 'Review required'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {rec.compatibility}
                  </span>
                </div>
              </div>

              {/* Assessment Narrative */}
              <div className="space-y-2 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-800">Compatibility Assessment:</h4>
                  <p className="text-slate-600 leading-relaxed mt-0.5">
                    {rec.compatibilityAssessment}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800">Remediation Rationale:</h4>
                  <p className="text-slate-600 leading-relaxed mt-0.5">{rec.reason}</p>
                </div>

                {rec.securityAdvisoryNote && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{rec.securityAdvisoryNote}</span>
                  </div>
                )}
              </div>

              {/* POM XML Snippet */}
              {hasRec && xmlCode && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 font-mono text-[11px]">
                      pom.xml Snippet:
                    </span>
                    <button
                      onClick={() => handleCopySnippet(item.dependencyId, xmlCode)}
                      className="text-[11px] text-[#2563EB] hover:text-blue-700 font-mono flex items-center gap-1"
                    >
                      {copiedId === item.dependencyId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-[#0F172A] text-slate-200 p-3 rounded text-[11px] font-mono overflow-x-auto leading-relaxed">
                    <code>{xmlCode}</code>
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Screen 7 Provenance Footer Card */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs text-xs font-mono text-[#64748B] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Analysis Provenance:</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Repository: {remediationData.repository}</span>
          <span>•</span>
          <span>Branch: {remediationData.branch}</span>
          <span>•</span>
          <span>Commit SHA: {truncateSha(remediationData.commitSha)}</span>
          <span>•</span>
          <span>Scanned: {remediationData.scannedTimestamp}</span>
        </div>
      </div>
    </div>
  );
};
