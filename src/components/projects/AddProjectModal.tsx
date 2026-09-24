import React, { useState } from 'react';
import { X, GitBranch, Github, AlertCircle, Loader2 } from 'lucide-react';
import { useCreateProject } from '../../hooks/useProjects';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateProject();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUrl = repoUrl.trim();
    if (!cleanUrl) {
      setError('Repository URL is required');
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        repositoryUrl: cleanUrl,
        name: projectName.trim() || undefined,
      });
      onSuccess(created.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register project');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl border border-[#E2E8F0] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">Add Maven Repository</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Connect a Java repository to evaluate Maven POM AST and dependencies
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Repository URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Github className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="github.com/acme/payment-service"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-mono"
                required
              />
            </div>
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Public or authorized private GitHub repository containing pom.xml
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Default Branch
              </label>
              <div className="relative">
                <GitBranch className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Payment Service"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-[#64748B] space-y-1">
            <div className="font-semibold text-slate-700">Deterministic Inspection Guarantee:</div>
            <div>
              DepGuard builds a clean Maven POM AST in an isolated sandbox. It never executes arbitrary build plugins or pre-compile scripts.
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Registering...
                </>
              ) : (
                'Create Project & Scan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
