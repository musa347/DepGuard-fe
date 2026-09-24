import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Plus,
  Play,
  FileText,
  AlertTriangle,
  GitBranch,
  Trash2,
} from 'lucide-react';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import { useTriggerScan } from '../hooks/useScans';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { AddProjectModal } from '../components/projects/AddProjectModal';
import { formatDate, truncateSha } from '../utils/formatters';
import { RiskLevel } from '../types';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const triggerMutation = useTriggerScan();
  const deleteMutation = useDeleteProject();

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.repositoryUrl.toLowerCase().includes(search.toLowerCase()) ||
        p.configId.toLowerCase().includes(search.toLowerCase());

      const matchesRisk = riskFilter === 'ALL' || p.health === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [projects, search, riskFilter]);

  const handleScan = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      const res = await triggerMutation.mutateAsync({ projectId });
      navigate(`/projects/${projectId}/scans/${res.scanId}`);
    } catch {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirmDeleteId !== projectId) {
      setConfirmDeleteId(projectId);
      return;
    }
    await deleteMutation.mutateAsync(projectId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Projects</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Registered Maven services, continuous audit schedules, and repository configurations
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Repository
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name, GitHub repository, or config ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
          <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Filter Risk:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'].map((level) => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={`px-2.5 py-1.5 rounded text-xs font-mono transition-colors whitespace-nowrap ${
                riskFilter === level
                  ? 'bg-[#2563EB] text-white font-semibold shadow-2xs'
                  : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-slate-100 hover:text-[#0F172A]'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List / Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-mono font-medium">
              <tr>
                <th className="px-6 py-3">Project & Build Target</th>
                <th className="px-6 py-3">Git Reference</th>
                <th className="px-6 py-3">Dependency Footprint</th>
                <th className="px-6 py-3">Heuristic Risk</th>
                <th className="px-6 py-3">Scan Status</th>
                <th className="px-6 py-3">Last Evaluated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                    Loading project inventory...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                    No matching repositories found. Adjust your search or add a new repository.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-[#0F172A] hover:text-[#2563EB]">
                        {p.name}
                      </div>
                      <div className="font-mono text-[11px] text-[#64748B] mt-0.5">
                        {p.repositoryUrl}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                          {p.buildTool}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span>ID: {p.configId}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-[#0F172A]">{p.branch}</span>
                        <span className="text-[#64748B]">@{truncateSha(p.latestCommit.sha)}</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate max-w-[220px] mt-0.5">
                        {p.latestCommit.message}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      <div className="font-bold text-sm text-[#0F172A]">{p.dependencyCount}</div>
                      <div className="text-[11px] text-[#64748B]">
                        {p.directCount} direct · {p.transitiveCount} trans
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <RiskBadge level={p.health as RiskLevel} />
                      {(p.criticalCount > 0 || p.eolCount > 0) && (
                        <div className="text-[11px] text-[#64748B] font-mono mt-1 space-x-1">
                          {p.criticalCount > 0 && (
                            <span className="text-red-700 font-semibold">{p.criticalCount} crit</span>
                          )}
                          {p.eolCount > 0 && (
                            <span className="text-rose-700 font-medium">({p.eolCount} EOL)</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={p.scanStatus} />
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-[#64748B]">
                      <div>{formatDate(p.lastScanAt)}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.scanFrequency}</div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => navigate(`/projects/${p.id}/report`)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-slate-500" />
                          Report
                        </button>
                        <button
                          onClick={(e) => handleScan(e, p.id)}
                          disabled={triggerMutation.isPending}
                          className="px-2.5 py-1 text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Scan
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, p.id)}
                          disabled={deleteMutation.isPending}
                          className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
                            confirmDeleteId === p.id
                              ? 'text-white bg-rose-600 border border-rose-700 hover:bg-rose-700'
                              : 'text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                          {confirmDeleteId === p.id ? 'Confirm' : 'Delete'}
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
