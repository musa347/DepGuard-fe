import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  ExternalLink,
  GitBranch,
  Search,
  Wrench,
  RotateCw,
  Layers,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Info,
  Server,
  Database,
  ArrowRight,
  GitCommit,
  CheckCircle2,
} from 'lucide-react';
import { useProject } from '../hooks/useProjects';
import { useScanReport } from '../hooks/useReports';
import { RiskBadge } from '../components/common/RiskBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { EolBadge } from '../components/common/EolBadge';
import { ScopeBadge } from '../components/common/ScopeBadge';
import { DependencyDetailDrawer } from '../components/dependencies/DependencyDetailDrawer';
import { Dependency, RiskLevel } from '../types';
import { truncateSha } from '../utils/formatters';

export const DependencyHealthReportPage: React.FC = () => {
  const { projectId, scanId, dependencyId } = useParams<{
    projectId: string;
    scanId: string;
    dependencyId?: string;
  }>();
  const navigate = useNavigate();

  const { data: project } = useProject(projectId);
  const { data: report, isLoading } = useScanReport(projectId, scanId);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DIRECT' | 'TRANSITIVE'>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [selectedDependency, setSelectedDependency] = useState<Dependency | null>(null);

  // If dependencyId is in URL route params, select it
  useEffect(() => {
    if (dependencyId && report?.dependencies) {
      const decoded = decodeURIComponent(dependencyId);
      const matched = report.dependencies.find(
        (d) => d.id === decoded || `${d.groupId}:${d.artifactId}` === decoded
      );
      if (matched) {
        setSelectedDependency(matched);
      }
    }
  }, [dependencyId, report]);

  const filteredDependencies = useMemo(() => {
    if (!report) return [];
    return report.dependencies.filter((d) => {
      const coord = `${d.groupId}:${d.artifactId}:${d.version}`.toLowerCase();
      const matchesSearch =
        !search ||
        coord.includes(search.toLowerCase()) ||
        d.description?.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === 'ALL' || d.type === typeFilter;
      const matchesRisk = riskFilter === 'ALL' || d.risk === riskFilter;

      return matchesSearch && matchesType && matchesRisk;
    });
  }, [report, search, typeFilter, riskFilter]);

  const handleOpenDetail = (dep: Dependency) => {
    setSelectedDependency(dep);
    navigate(`/projects/${projectId}/scans/${scanId}/dependencies/${encodeURIComponent(dep.id)}`, {
      replace: true,
    });
  };

  const handleCloseDetail = () => {
    setSelectedDependency(null);
    navigate(`/projects/${projectId}/scans/${scanId}/report`, { replace: true });
  };

  if (isLoading || !report) {
    return (
      <div className="p-8 max-w-7xl w-full mx-auto text-[#64748B]">
        Loading dependency health report...
      </div>
    );
  }

  const { riskHeuristic } = report;

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
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
        <span className="text-[#0F172A] font-semibold">health-report</span>
      </div>

      {/* Screen 6 Header */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            {project?.name || 'Payment Service'} Dependency Health Report
          </h1>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs font-mono text-[#64748B] mt-2">
            <span>{report.repository}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span>branch: {report.branch}</span>
            </div>
            <span>•</span>
            <span>commit: {truncateSha(report.commitSha)}</span>
            <span>•</span>
            <span>Last scanned Sep 21, 2026 at 14:32 UTC</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/projects/${projectId}/scans/${scanId}/remediation`}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Wrench className="w-3.5 h-3.5" />
            Remediation View
          </Link>
        </div>
      </div>

      {/* Primary Card: Dependency Risk Heuristic (Not Security Score) */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
              <span>Dependency Risk Heuristic</span>
              <span className="text-[11px] font-mono font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                (Not Security Score)
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold font-mono text-[#0F172A]">
                {riskHeuristic.score}
              </span>
              <RiskBadge level={riskHeuristic.level} size="lg" />
            </div>
            <p className="text-xs text-[#64748B]">
              {riskHeuristic.summary}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 max-w-sm text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Heuristic Model Specification</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Synthesizes upstream EOL lifecycle obsolescence, active CVSS advisory severities, and transitive depth into an actionable risk metric.
            </p>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#E2E8F0]">
          <div className="bg-slate-50/70 rounded-md border border-[#E2E8F0] p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Dependencies
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-[#0F172A]">
              {report.totalDependencies}
            </div>
            <div className="text-xs text-[#64748B] font-mono mt-0.5">
              {report.directCount} direct · {report.transitiveCount} transitive
            </div>
          </div>

          <div className="bg-amber-50/40 rounded-md border border-amber-200/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              High Risk
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-amber-800">
              {report.highRiskCount}
            </div>
            <div className="text-xs text-amber-900 mt-0.5">
              Elevated CVEs or EOL direct
            </div>
          </div>

          <div className="bg-rose-50/40 rounded-md border border-rose-200/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-rose-800">
              Critical
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-rose-800">
              {report.criticalCount}
            </div>
            <div className="text-xs text-rose-900 mt-0.5">
              CVSS ≥ 9.0 vulnerability
            </div>
          </div>

          <div className="bg-rose-50/40 rounded-md border border-rose-200/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-rose-800">
              End of Life
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-rose-800">
              {report.eolCount}
            </div>
            <div className="text-xs text-rose-900 mt-0.5">
              Framework/lib unmaintained
            </div>
          </div>
        </div>

        {/* Heuristic Risk Distribution Bar */}
        <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">Heuristic Risk Distribution</span>
            <span className="font-mono text-slate-500 text-[11px]">82 total artifacts</span>
          </div>

          {/* Segmented multi-color bar */}
          <div className="h-3.5 w-full bg-slate-100 rounded overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${riskHeuristic.breakdown.criticalPercent}%` }}
              className="bg-red-600 h-full"
              title={`Critical: ${riskHeuristic.breakdown.critical} (${riskHeuristic.breakdown.criticalPercent}%)`}
            />
            <div
              style={{ width: `${riskHeuristic.breakdown.highPercent}%` }}
              className="bg-amber-500 h-full"
              title={`High: ${riskHeuristic.breakdown.high} (${riskHeuristic.breakdown.highPercent}%)`}
            />
            <div
              style={{ width: `${riskHeuristic.breakdown.mediumPercent}%` }}
              className="bg-yellow-400 h-full"
              title={`Medium: ${riskHeuristic.breakdown.medium} (${riskHeuristic.breakdown.mediumPercent}%)`}
            />
            <div
              style={{ width: `${riskHeuristic.breakdown.lowPercent}%` }}
              className="bg-emerald-500 h-full"
              title={`Low: ${riskHeuristic.breakdown.low} (${riskHeuristic.breakdown.lowPercent}%)`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-600" />
              <span>CRITICAL: {riskHeuristic.breakdown.critical} ({riskHeuristic.breakdown.criticalPercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>HIGH: {riskHeuristic.breakdown.high} ({riskHeuristic.breakdown.highPercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-yellow-400" />
              <span>MEDIUM: {riskHeuristic.breakdown.medium} ({riskHeuristic.breakdown.mediumPercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>LOW: {riskHeuristic.breakdown.low} ({riskHeuristic.breakdown.lowPercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation & Confidence Protocol Callout Card */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Evaluation & Confidence Protocol</span>
          </div>
          <p className="text-xs text-[#64748B]">
            Risk and confidence are evaluated separately. UNKNOWN information does not indicate low risk or healthy status. Missing metadata is flagged neutrally.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-medium">
            HIGH RISK · Conf: HIGH
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-medium">
            EOL: UNKNOWN · Lifecycle unindexed
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coordinates (e.g. spring-core, jackson, 5.3.31)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Type Filter */}
          <div className="flex items-center rounded border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC]">
            {(['ALL', 'DIRECT', 'TRANSITIVE'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1.5 text-xs font-mono transition-colors ${
                  typeFilter === t
                    ? 'bg-[#2563EB] text-white font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Risk Filter */}
          <div className="flex items-center rounded border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC]">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1.5 text-xs font-mono transition-colors ${
                  riskFilter === r
                    ? 'bg-[#2563EB] text-white font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dependencies Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-3 border-b border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
          <span className="font-mono">
            Showing {filteredDependencies.length} of {report.totalDependencies} dependencies
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Sorted by Risk Weight & Inclusion Priority
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-mono font-medium">
              <tr>
                <th className="px-6 py-3">Dependency Coordinates</th>
                <th className="px-6 py-3">Type & Scope</th>
                <th className="px-6 py-3">EOL Status</th>
                <th className="px-6 py-3">Vulnerabilities</th>
                <th className="px-6 py-3">Risk Heuristic</th>
                <th className="px-6 py-3">Confidence</th>
                <th className="px-6 py-3">Recommended</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {filteredDependencies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#64748B]">
                    No dependencies match your current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredDependencies.map((dep) => (
                  <tr
                    key={dep.id}
                    onClick={() => handleOpenDetail(dep)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="font-mono font-semibold text-xs text-[#0F172A] hover:text-[#2563EB]">
                        {dep.groupId}:{dep.artifactId}
                      </div>
                      <div className="font-mono text-[11px] text-[#64748B]">
                        version: <span className="font-semibold text-slate-800">{dep.version}</span>
                      </div>
                      {dep.description && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[240px] mt-0.5">
                          {dep.description}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-3.5">
                      <ScopeBadge type={dep.type} scope={dep.scope} />
                    </td>

                    <td className="px-6 py-3.5">
                      <EolBadge eol={dep.eol} />
                    </td>

                    <td className="px-6 py-3.5 font-mono">
                      {dep.vulnerabilities.length > 0 ? (
                        <div>
                          <span className="font-bold text-rose-700">
                            {dep.vulnerabilities.length} vuln
                          </span>
                          <div className="text-[10px] text-slate-500">
                            {dep.vulnerabilities.map((v) => v.id).join(', ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    <td className="px-6 py-3.5">
                      <RiskBadge level={dep.risk} />
                    </td>

                    <td className="px-6 py-3.5">
                      <ConfidenceBadge level={dep.confidence} />
                    </td>

                    <td className="px-6 py-3.5 font-mono">
                      {dep.recommendation?.recommendedVersion ? (
                        <span className="font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {dep.recommendation.recommendedVersion}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not available</span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(dep);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded hover:bg-slate-50 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Sources and Provenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Analysis Sources */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 uppercase tracking-wider">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Connected Analysis Sources</span>
          </div>

          <div className="divide-y divide-[#E2E8F0] text-xs font-mono">
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Lifecycle Intel:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-800">{report.analysisSources.lifecycle.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                  {report.analysisSources.lifecycle.status}
                </span>
              </div>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Security Advisories:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-800">{report.analysisSources.securityAdvisories.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">
                  {report.analysisSources.securityAdvisories.status}
                </span>
              </div>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Package Metadata:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-800">{report.analysisSources.packageMetadata.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                  {report.analysisSources.packageMetadata.status}
                </span>
              </div>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Repository Connector:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-800">{report.analysisSources.repository.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">
                  {report.analysisSources.repository.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Provenance & Reproducibility */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 uppercase tracking-wider">
            <Server className="w-4 h-4 text-blue-600" />
            <span>Scan Provenance & Reproducibility</span>
          </div>

          <div className="divide-y divide-[#E2E8F0] text-xs font-mono">
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Commit SHA:</span>
              <span className="text-slate-800 text-[11px] font-bold">{report.provenance.commitSha}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Branch Target:</span>
              <span className="text-slate-800">{report.provenance.branchTarget}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Scan Timestamp:</span>
              <span className="text-slate-800">{report.provenance.scanTimestamp}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Engine / Parser:</span>
              <span className="text-slate-800 text-[11px]">{report.provenance.engineParser}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Inspector */}
      <DependencyDetailDrawer
        dependency={selectedDependency}
        isOpen={Boolean(selectedDependency)}
        onClose={handleCloseDetail}
      />
    </div>
  );
};
