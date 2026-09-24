import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Layers,
  AlertTriangle,
  Clock,
  Plus,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTriggerScan } from '../hooks/useScans';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { AddProjectModal } from '../components/projects/AddProjectModal';
import { formatDate, truncateSha } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const triggerMutation = useTriggerScan();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Derived aggregates (purely presentation counts)
  const totalRepos = projects.length;
  const totalDeps = projects.reduce((acc, p) => acc + p.dependencyCount, 0);
  const totalHighRisk = projects.reduce((acc, p) => acc + p.highRiskCount + p.criticalCount, 0);
  const totalEol = projects.reduce((acc, p) => acc + p.eolCount, 0);

  const handleScanNow = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      const res = await triggerMutation.mutateAsync({ projectId });
      navigate(`/projects/${projectId}/scans/${res.scanId}`);
    } catch {
      navigate(`/projects/${projectId}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            Dashboard
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Deterministic Maven POM AST intelligence, CVE heuristics, and lifecycle tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ui-states')}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Inspect approved Screen 8 states"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-500" />
            UI States & Edge Cases
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Repository
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Monitored Repositories
            </span>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A] font-mono">{totalRepos}</span>
            <span className="text-xs text-[#64748B]">active Maven projects</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Dependencies Evaluated
            </span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A] font-mono">{totalDeps}</span>
            <span className="text-xs text-[#64748B]">direct + transitive</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Critical & High Risk
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono">{totalHighRisk}</span>
            <span className="text-xs text-amber-800 font-medium">requiring triage</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              End of Life Artifacts
            </span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700 font-mono">{totalEol}</span>
            <span className="text-xs text-rose-800 font-medium">unsupported upstream</span>
          </div>
        </div>
      </div>

      {/* Primary Services Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">Monitored Services</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Target repositories scanned for lifecycle status, CVE advisories, and pom.xml upgrades
            </p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="text-xs font-medium text-[#2563EB] hover:text-blue-700 flex items-center gap-1"
          >
            All Projects <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-mono font-medium">
              <tr>
                <th className="px-6 py-3">Service & Repository</th>
                <th className="px-6 py-3">Branch & Commit</th>
                <th className="px-6 py-3">Dependencies</th>
                <th className="px-6 py-3">Risk Assessment</th>
                <th className="px-6 py-3">Scan Status</th>
                <th className="px-6 py-3">Last Scanned</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                    Loading monitored repositories...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                    No repositories registered yet. Add a GitHub repository to begin.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr
                    key={proj.id}
                    onClick={() => navigate(`/projects/${proj.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-sm text-[#0F172A] hover:text-[#2563EB]">
                        {proj.name}
                      </div>
                      <div className="font-mono text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                        <FolderKanban className="w-3 h-3 text-slate-400" />
                        {proj.repositoryUrl}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-mono text-xs text-[#0F172A] flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                          {proj.branch}
                        </span>
                        <span className="text-[#64748B]">@{truncateSha(proj.latestCommit.sha)}</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate max-w-[200px] mt-0.5">
                        {proj.latestCommit.message}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono">
                      <div className="font-semibold text-[#0F172A]">{proj.dependencyCount}</div>
                      <div className="text-[11px] text-[#64748B]">
                        {proj.directCount} direct · {proj.transitiveCount} trans
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <RiskBadge level={proj.health} />
                      {(proj.criticalCount > 0 || proj.highRiskCount > 0) && (
                        <div className="text-[11px] text-amber-800 font-mono mt-1">
                          {proj.criticalCount > 0 && `${proj.criticalCount} crit`}
                          {proj.criticalCount > 0 && proj.highRiskCount > 0 && ' · '}
                          {proj.highRiskCount > 0 && `${proj.highRiskCount} high`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={proj.scanStatus} />
                    </td>
                    <td className="px-6 py-3.5 text-xs text-[#64748B] font-mono">
                      {formatDate(proj.lastScanAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/projects/${proj.id}/report`)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded hover:bg-slate-50 transition-colors"
                          title="Open Dependency Health Report"
                        >
                          Report
                        </button>
                        <button
                          onClick={(e) => handleScanNow(e, proj.id)}
                          disabled={triggerMutation.isPending}
                          className="px-2.5 py-1 text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                          title="Trigger immediate scan (HTTP 202 flow)"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Scan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intelligence & Architecture Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex items-start gap-3">
          <div className="p-2 rounded bg-blue-50 text-blue-600 border border-blue-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-[#0F172A]">Deterministic AST Inspection</div>
            <p className="text-[#64748B] mt-0.5">
              Parses Maven `pom.xml` trees including parent POM inheritance and `dependencyManagement` overrides without arbitrary code execution.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex items-start gap-3">
          <div className="p-2 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-[#0F172A]">Authoritative Multi-Source Intel</div>
            <p className="text-[#64748B] mt-0.5">
              Correlates OSV.dev advisories, Maven Central release chronologies, and endoflife.date lifecycle streams.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex items-start gap-3">
          <div className="p-2 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-[#0F172A]">Remediation Confidence</div>
            <p className="text-[#64748B] mt-0.5">
              Differentiates drop-in same-major patch paths from breaking cross-major baseline changes (e.g. Java 17+ or Jakarta EE).
            </p>
          </div>
        </div>
      </div>

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(id) => {
          setIsAddModalOpen(false);
          navigate(`/projects/${id}`);
        }}
      />
    </div>
  );
};
