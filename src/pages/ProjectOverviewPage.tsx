import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  GitBranch,
  Play,
  FileText,
  Wrench,
  Layers,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
} from 'lucide-react';
import { useProject } from '../hooks/useProjects';
import { useScans, useTriggerScan } from '../hooks/useScans';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDate, truncateSha } from '../utils/formatters';

export const ProjectOverviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const { data: scans = [], isLoading: isScansLoading } = useScans(projectId);
  const triggerMutation = useTriggerScan();

  const [simulateFailure, setSimulateFailure] = useState(false);

  if (isProjectLoading) {
    return (
      <div className="p-8 max-w-7xl w-full mx-auto text-[#64748B] flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
        Loading project metadata...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 max-w-7xl w-full mx-auto space-y-4">
        <div className="bg-white border border-[#E2E8F0] p-8 rounded-lg text-center">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h2 className="text-base font-semibold text-[#0F172A]">Project Not Found</h2>
          <p className="text-xs text-[#64748B] mt-1">
            The requested project repository identifier '{projectId}' could not be located.
          </p>
          <Link
            to="/projects"
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] rounded hover:bg-blue-700"
          >
            Return to Projects
          </Link>
        </div>
      </div>
    );
  }

  const handleTriggerScan = async () => {
    try {
      const response = await triggerMutation.mutateAsync({
        projectId: project.id,
      });
      navigate(`/projects/${project.id}/scans/${response.scanId}`);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
        <Link to="/projects" className="hover:text-[#2563EB] transition-colors">
          projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#0F172A] font-semibold">{project.id}</span>
      </div>

      {/* Project Header Card */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">{project.name}</h1>
            <RiskBadge level={project.health} size="lg" />
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-mono text-[#64748B]">
            <a
              href={`https://${project.repositoryUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2563EB] flex items-center gap-1 transition-colors text-slate-700"
            >
              <span>{project.repositoryUrl}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <span>•</span>
            <div className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span>branch: {project.branch}</span>
            </div>
            <span>•</span>
            <span>commit: {truncateSha(project.latestCommit.sha)}</span>
            <span>•</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {project.buildTool}
            </span>
          </div>
        </div>

        {/* Top Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/projects/${project.id}/remediation`}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            Remediations
          </Link>
          <Link
            to={`/projects/${project.id}/report`}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Health Report
          </Link>
          <button
            onClick={handleTriggerScan}
            disabled={triggerMutation.isPending}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {triggerMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            Trigger Scan
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Dependencies
            </span>
            <Layers className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0F172A]">
              {project.dependencyCount}
            </span>
          </div>
          <div className="mt-1 text-xs text-[#64748B] font-mono">
            {project.directCount} direct · {project.transitiveCount} transitive
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              High Risk
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700">
              {project.highRiskCount}
            </span>
          </div>
          <div className="mt-1 text-xs text-amber-800">
            Elevated CVEs or EOL direct artifacts
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Critical
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-700">
              {project.criticalCount}
            </span>
          </div>
          <div className="mt-1 text-xs text-rose-800">
            CVSS ≥ 9.0 vulnerability detected
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              End of Life
            </span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-700">{project.eolCount}</span>
          </div>
          <div className="mt-1 text-xs text-rose-800">
            Framework/lib unmaintained upstream
          </div>
        </div>
      </div>

      {/* Scans History Section */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">Scan Execution History</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Deterministic AST executions, duration metrics, and vulnerability snapshots
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer select-none bg-slate-50 px-2 py-1 rounded border border-slate-200">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-[11px] font-mono text-slate-700">Simulate Failure State</span>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-mono font-medium">
              <tr>
                <th className="px-6 py-3">Scan ID</th>
                <th className="px-6 py-3">Target Git Commit</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Duration & Worker</th>
                <th className="px-6 py-3">Result Intelligence</th>
                <th className="px-6 py-3">Execution Timestamp</th>
                <th className="px-6 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {isScansLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#64748B]">
                    Loading scan executions...
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#64748B]">
                    No scans have been triggered for this project yet. Click 'Trigger Scan' above.
                  </td>
                </tr>
              ) : (
                scans.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/projects/${project.id}/scans/${s.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3.5 font-mono font-semibold text-[#0F172A]">
                      #{s.scanNumber}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-[#0F172A]">
                        <span className="font-semibold text-slate-700">
                          {truncateSha(s.commitSha)}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-[#64748B]">{s.branch}</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate max-w-[200px] mt-0.5">
                        {s.commitMessage}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-3.5 text-xs font-mono text-[#64748B]">
                      <div>{s.duration}</div>
                      <div className="text-[10px] text-slate-400">{s.workerId || 'worker-us-1'}</div>
                    </td>
                    <td className="px-6 py-3.5 text-xs">
                      {s.status === 'FAILED' ? (
                        <span className="text-rose-700 font-mono text-[11px]">
                          {s.failureReason || 'Process error in Maven AST phase'}
                        </span>
                      ) : (
                        <span className="text-slate-700 font-mono text-[11px]">
                          {s.resultSummary || `${s.dependencyCount || 82} dependencies evaluated`}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-xs font-mono text-[#64748B]">
                      {formatDate(s.startedAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${project.id}/scans/${s.id}`);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
                      >
                        <Terminal className="w-3 h-3 text-slate-400" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
