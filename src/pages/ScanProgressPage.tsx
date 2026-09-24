import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileText,
  Terminal,
  ShieldCheck,
  Server,
  Layers,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { useProject } from '../hooks/useProjects';
import { usePollScan, useTriggerScan } from '../hooks/useScans';
import { StatusBadge } from '../components/common/StatusBadge';
import { truncateSha } from '../utils/formatters';

interface ScanStage {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  duration?: string;
  details?: string[];
}

export const ScanProgressPage: React.FC = () => {
  const { projectId, scanId } = useParams<{ projectId: string; scanId: string }>();
  const navigate = useNavigate();

  const { data: project } = useProject(projectId);
  const { data: pollData, isLoading } = usePollScan(projectId, scanId);
  const triggerMutation = useTriggerScan();

  const scan = pollData?.scan;
  const isComplete = pollData?.isComplete ?? (scan?.status === 'COMPLETED');
  const isFailed = pollData?.isFailed ?? (scan?.status === 'FAILED');

  // Elapsed seconds simulation for active scans
  const [elapsedSeconds, setElapsedSeconds] = useState(6);

  useEffect(() => {
    if (!isComplete && !isFailed) {
      const interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isComplete, isFailed]);

  // Derive stages based on scan progress state
  const stages: ScanStage[] = [
    {
      id: 1,
      title: 'Repository & Workspace Initialization',
      description: 'Cloning repository refs and locating root pom.xml',
      status: 'COMPLETED',
      duration: '2.4s',
      details: [
        'Connected to GitHub API via deployment token',
        `Checked out target commit ${truncateSha(scan?.commitSha || '8f31c2d')} on branch ${scan?.branch || 'main'}`,
        'Discovered root pom.xml (Maven project model v4.0.0)',
      ],
    },
    {
      id: 2,
      title: 'Maven POM AST Parse & Graph Traversal',
      description: 'Resolving parent POM inheritance, BOM imports, and transitive dependencies',
      status: isFailed ? 'FAILED' : isComplete ? 'COMPLETED' : elapsedSeconds > 4 ? 'COMPLETED' : 'IN_PROGRESS',
      duration: isFailed ? '4.1s' : isComplete || elapsedSeconds > 4 ? '4.8s' : 'running...',
      details: [
        'Extracted 24 direct <dependency> nodes from project coordinates',
        'Resolved spring-boot-dependencies-bom BOM import hierarchy',
        'Computed full transitive closure: 58 transitive artifacts (depth max: 3)',
      ],
    },
    {
      id: 3,
      title: 'Vulnerability & Lifecycle Correlation',
      description: 'Evaluating OSV.dev schema advisories, CVE scores, and endoflife.date indexes',
      status: isFailed ? 'FAILED' : isComplete ? 'COMPLETED' : elapsedSeconds > 6 ? 'IN_PROGRESS' : 'PENDING',
      duration: isComplete ? '3.2s' : elapsedSeconds > 6 ? 'running...' : undefined,
      details: [
        'Queried OSV database: 1 critical CVE (CVE-2021-44228), 1 high CVE (CVE-2023-35116)',
        'Correlated endoflife.date: 3 packages past vendor security maintenance baseline',
        'Normalized neutral confidence on 2 unindexed coordinate pairs',
      ],
    },
    {
      id: 4,
      title: 'Compatibility & Remediation Synthesis',
      description: 'Deriving semver upgrade paths, cross-major warnings, and pom.xml changes',
      status: isFailed ? 'FAILED' : isComplete ? 'COMPLETED' : elapsedSeconds > 9 ? 'IN_PROGRESS' : 'PENDING',
      duration: isComplete ? '1.5s' : undefined,
      details: [
        'Calculated 8 target version upgrades across 5 attention items',
        'Flagged 3 cross-major version steps requiring engineering review',
        'Generated deterministic XML snippets for <dependencyManagement>',
      ],
    },
  ];

  const handleRetry = async () => {
    if (!projectId) return;
    try {
      const res = await triggerMutation.mutateAsync({ projectId });
      navigate(`/projects/${projectId}/scans/${res.scanId}`);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
        <Link to="/projects" className="hover:text-[#2563EB] transition-colors">
          projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/projects/${projectId}`} className="hover:text-[#2563EB] transition-colors">
          {projectId}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#0F172A] font-semibold">
          scan-{scan?.scanNumber || scanId?.replace('scan-', '') || '25'}
        </span>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight font-mono">
              Scan #{scan?.scanNumber || '25'} Execution
            </h1>
            <StatusBadge status={scan?.status || 'RUNNING'} />
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs font-mono text-[#64748B] mt-2">
            <span>github.com/acme/{projectId}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <GitBranch className="w-3 h-3 text-slate-400" />
              <span>branch: {scan?.branch || 'main'}</span>
            </div>
            <span>•</span>
            <span>commit: {truncateSha(scan?.commitSha || '8f31c2d')}</span>
            <span>•</span>
            <span>
              elapsed: {isComplete ? scan?.duration || '1m 24s' : `${elapsedSeconds}s`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isComplete && (
            <Link
              to={`/projects/${projectId}/scans/${scanId}/report`}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              View Health Report
            </Link>
          )}
          {isFailed && (
            <button
              onClick={handleRetry}
              disabled={triggerMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Retry Scan
            </button>
          )}
        </div>
      </div>

      {/* Completion or Failure Banner */}
      {isComplete && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-900">
                Scan Completed Successfully (HTTP 200 OK)
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Deterministic Maven POM AST parsed 82 dependencies. Correlated 5 high-risk items, 1 critical vulnerability, and 3 EOL artifacts.
              </p>
            </div>
          </div>
          <Link
            to={`/projects/${projectId}/scans/${scanId}/report`}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded hover:bg-emerald-100 transition-colors shrink-0 flex items-center gap-1"
          >
            Inspect Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {isFailed && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-rose-900">
                Maven AST Resolution Failed
              </h3>
              <p className="text-xs text-rose-800">
                {scan?.failureReason ||
                  'Unable to resolve remote repository pom.xml: Network timeout connecting to Maven Central mirror.'}
              </p>
            </div>
          </div>

          <div className="bg-white/80 p-3 rounded border border-rose-200 text-xs font-mono text-rose-900 space-y-1">
            <div className="font-semibold text-[11px] text-rose-950">Diagnostic Trace:</div>
            <div className="text-[11px]">
              [ERROR] Failed to execute goal on project payment-service: Could not resolve dependencies for project com.acme:payment-service:jar:1.0.0-SNAPSHOT: Failed to collect dependencies at org.springframework.boot:spring-boot-starter-web
            </div>
            <div className="text-[11px] text-rose-700">
              Exit Code: 1 · Deterministic fallback invoked: zero false-positives emitted.
            </div>
          </div>
        </div>
      )}

      {/* Progress Stages Tracker */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-semibold text-[#0F172A]">Deterministic Pipeline Stages</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            DepGuard strictly isolates POM AST parsing from code execution
          </p>
        </div>

        <div className="p-6 space-y-6">
          {stages.map((stage, idx) => {
            const isLast = idx === stages.length - 1;
            return (
              <div key={stage.id} className="relative flex items-start gap-4">
                {!isLast && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-full -ml-[1px] ${
                      stage.status === 'COMPLETED' ? 'bg-emerald-300' : 'bg-slate-200'
                    }`}
                  />
                )}

                <div className="relative z-10 shrink-0">
                  {stage.status === 'COMPLETED' ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-300 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : stage.status === 'FAILED' ? (
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-300 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : stage.status === 'IN_PROGRESS' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-300 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center text-xs font-mono font-medium">
                      {stage.id}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <h4 className="text-sm font-semibold text-[#0F172A]">{stage.title}</h4>
                    {stage.duration && (
                      <span className="text-[11px] font-mono text-slate-500">
                        {stage.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">{stage.description}</p>

                  {stage.details && (stage.status === 'COMPLETED' || stage.status === 'IN_PROGRESS') && (
                    <div className="mt-2.5 p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1 text-[11px] font-mono text-slate-700">
                      {stage.details.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-slate-400">›</span>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Execution Console */}
      <div className="bg-[#0F172A] text-slate-200 rounded-lg border border-slate-800 shadow-sm overflow-hidden font-mono text-xs">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] text-slate-400">depguard-worker :: stdout / audit log</span>
          </div>
          <span className="text-[10px] text-slate-500">worker-maven-us-east-4a</span>
        </div>
        <div className="p-4 space-y-1 max-h-48 overflow-y-auto text-[11px] leading-relaxed">
          <div className="text-slate-500">[INFO] DepGuard Deterministic Maven Engine v1.0.0 started</div>
          <div className="text-slate-400">[INFO] Target: github.com/acme/{projectId} @ {scan?.branch || 'main'}</div>
          <div className="text-slate-400">[INFO] Inspecting pom.xml AST hierarchy...</div>
          <div className="text-blue-400">[INFO] Discovered 24 direct dependencies, 58 transitive dependencies</div>
          <div className="text-emerald-400">[INFO] OSV Database synchronized (snapshot: 2026-09-21)</div>
          <div className="text-amber-400">[WARN] Found CVE-2023-20861 (CRITICAL) in org.springframework:spring-core:5.3.31</div>
          <div className="text-rose-400">[WARN] Spring Framework 5.3.x reached EOL Nov 30, 2023</div>
          {isComplete && (
            <div className="text-emerald-400 font-bold">
              [SUCCESS] Analysis finished with 0 parser anomalies. Output available in Health Report.
            </div>
          )}
          {isFailed && (
            <div className="text-rose-400 font-bold">
              [FATAL] Analysis halted: Unable to resolve parent POM references.
            </div>
          )}
          {!isComplete && !isFailed && (
            <div className="text-blue-400 flex items-center gap-1.5 animate-pulse">
              <span>[RUNNING] Polling status from backend runner...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
