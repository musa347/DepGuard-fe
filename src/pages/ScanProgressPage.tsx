import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileText,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import { useProject } from '../hooks/useProjects';
import { usePollScan, useTriggerScan } from '../hooks/useScans';
import { StatusBadge } from '../components/common/StatusBadge';
import { truncateSha } from '../utils/formatters';

export const ScanProgressPage: React.FC = () => {
  const { projectId, scanId } = useParams<{ projectId: string; scanId: string }>();
  const navigate = useNavigate();

  const { data: project } = useProject(projectId);
  const { data: pollData, isLoading } = usePollScan(projectId, scanId);
  const triggerMutation = useTriggerScan();

  const scan = pollData?.scan;
  const isComplete = pollData?.isComplete ?? scan?.status === 'COMPLETED';
  const isFailed = pollData?.isFailed ?? scan?.status === 'FAILED';

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isComplete && !isFailed) {
      const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isComplete, isFailed]);

  const handleRetry = async () => {
    if (!projectId) return;
    try {
      const res = await triggerMutation.mutateAsync({ projectId });
      navigate(`/projects/${projectId}/scans/${res.scanId}`);
    } catch {
      // handled by mutation error state
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl w-full mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
        <Link to="/projects" className="hover:text-[#2563EB] transition-colors">
          projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/projects/${projectId}`} className="hover:text-[#2563EB] transition-colors">
          {project?.name ?? projectId}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#0F172A] font-semibold">{scanId}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-mono">
              Scan {scanId}
            </h1>
            <StatusBadge status={scan?.status ?? 'RUNNING'} />
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs font-mono text-[#64748B] mt-2">
            {scan?.branch && (
              <>
                <div className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-slate-400" />
                  <span>{scan.branch}</span>
                </div>
                <span>•</span>
              </>
            )}
            {scan?.commitSha && (
              <>
                <span>commit: {truncateSha(scan.commitSha)}</span>
                <span>•</span>
              </>
            )}
            <span>elapsed: {isComplete ? (scan?.duration ?? '—') : `${elapsedSeconds}s`}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isComplete && (
            <Link
              to={`/projects/${projectId}/scans/${scanId}/report`}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              View Report
            </Link>
          )}
          {isFailed && (
            <button
              onClick={handleRetry}
              disabled={triggerMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Retry Scan
            </button>
          )}
        </div>
      </div>

      {/* Status banner */}
      {isComplete && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-900">Scan completed</h3>
              {scan?.dependencyCount != null && (
                <p className="text-xs text-emerald-700 mt-0.5">
                  {scan.dependencyCount} dependencies resolved
                </p>
              )}
            </div>
          </div>
          <Link
            to={`/projects/${projectId}/scans/${scanId}/report`}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded hover:bg-emerald-100 transition-colors shrink-0 flex items-center gap-1"
          >
            View Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {isFailed && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-rose-900">Scan failed</h3>
            <p className="text-xs text-rose-800 mt-1">
              {scan?.failureReason ?? 'An error occurred during the scan. Check the backend logs for details.'}
            </p>
          </div>
        </div>
      )}

      {!isComplete && !isFailed && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Scan in progress</h3>
            <p className="text-xs text-blue-700 mt-0.5">
              Cloning repository, resolving dependencies, and running enrichment…
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
