import { Project, ApiProject, ApiScan } from '../types';
import { apiClient } from './client';

function toProject(p: ApiProject, latestScan?: ApiScan): Project {
  return {
    id: p.id,
    name: p.name,
    repositoryUrl: p.repositoryUrl.replace(/^https?:\/\//, ''),
    branch: p.defaultBranch ?? latestScan?.branch ?? '',
    latestCommit: {
      sha: latestScan?.commitSha ?? '',
      message: '',
      date: latestScan?.completedAt ?? latestScan?.startedAt ?? p.createdAt,
    },
    lastScanAt: latestScan?.completedAt ?? latestScan?.startedAt ?? p.createdAt,
    dependencyCount: latestScan?.dependencyCount ?? 0,
    directCount: latestScan?.dependencies?.filter((d) => d.direct).length ?? 0,
    transitiveCount: latestScan?.dependencies?.filter((d) => !d.direct).length ?? 0,
    health: 'UNKNOWN',
    scanStatus: (latestScan?.status as Project['scanStatus']) ?? 'COMPLETED',
    highRiskCount: 0,
    criticalCount: 0,
    eolCount: 0,
    buildTool: 'Maven',
    configId: p.id,
    scanFrequency: '',
  };
}

async function fetchLatestScan(projectId: string): Promise<ApiScan | undefined> {
  try {
    const res = await apiClient<ApiScan>(`/api/projects/${projectId}/scans/latest`);
    return res;
  } catch {
    return undefined;
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const data = await apiClient<ApiProject[]>('/api/projects');
  return Promise.all(
    data.map(async (p) => {
      const latestScan = await fetchLatestScan(p.id);
      return toProject(p, latestScan);
    })
  );
}

export async function fetchProjectById(projectId: string): Promise<Project | null> {
  const [data, latestScan] = await Promise.all([
    apiClient<ApiProject>(`/api/projects/${projectId}`),
    fetchLatestScan(projectId),
  ]);
  return toProject(data, latestScan);
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
