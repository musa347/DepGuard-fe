import { Project, ApiProject } from '../types';
import { apiClient } from './client';

function toProject(p: ApiProject): Project {
  return {
    id: p.id,
    name: p.name,
    repositoryUrl: p.repositoryUrl.replace(/^https?:\/\//, ''),
    branch: p.defaultBranch,
    latestCommit: { sha: '', message: '', date: p.createdAt },
    lastScanAt: p.createdAt,
    dependencyCount: 0,
    directCount: 0,
    transitiveCount: 0,
    health: 'UNKNOWN',
    scanStatus: 'COMPLETED',
    highRiskCount: 0,
    criticalCount: 0,
    eolCount: 0,
    buildTool: 'Maven',
    configId: p.id,
    scanFrequency: '',
  };
}

export async function fetchProjects(): Promise<Project[]> {
  const data = await apiClient<ApiProject[]>('/api/projects');
  return data.map(toProject);
}

export async function fetchProjectById(projectId: string): Promise<Project | null> {
  const data = await apiClient<ApiProject>(`/api/projects/${projectId}`);
  return toProject(data);
}

export async function createProject(data: {
  repositoryUrl: string;
  name?: string;
}): Promise<Project> {
  const payload = {
    name: data.name ?? data.repositoryUrl.split('/').pop()?.replace(/-/g, ' ') ?? 'New Project',
    repositoryUrl: data.repositoryUrl,
  };
  const created = await apiClient<ApiProject>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return toProject(created);
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient(`/api/projects/${projectId}`, { method: 'DELETE' });
}
