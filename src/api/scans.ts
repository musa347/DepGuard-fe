import { Scan, ApiScan } from '../types';
import { apiClient } from './client';

function toScan(s: ApiScan, projectId: string): Scan {
  return {
    id: s.id,
    projectId,
    scanNumber: 0,
    commitSha: s.commitSha ?? '',
    commitMessage: '',
    branch: s.branch ?? '',
    startedAt: s.startedAt,
    duration: s.completedAt
      ? `${Math.round((new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()) / 1000)}s`
      : '',
    status: s.status === 'PENDING' ? 'RUNNING' : s.status,
    failureReason: s.errorMessage ?? undefined,
    dependencyCount: s.dependencyCount,
  };
}

export async function fetchScans(_projectId: string): Promise<Scan[]> {
  // Backend does not expose GET /api/projects/{id}/scans — return empty list
  return [];
}

export async function fetchScanById(projectId: string, scanId: string): Promise<Scan | null> {
  const data = await apiClient<ApiScan>(`/api/scans/${scanId}`);
  return toScan(data, projectId);
}

export interface TriggerScanResponse {
  scanId: string;
  status: 'ACCEPTED';
  statusCode: 202;
  pollUri: string;
}

export async function triggerScan(projectId: string): Promise<TriggerScanResponse> {
  const data = await apiClient<{ scanId: string }>(`/api/projects/${projectId}/scans`, {
    method: 'POST',
  });
  return {
    scanId: data.scanId,
    status: 'ACCEPTED',
    statusCode: 202,
    pollUri: `/api/scans/${data.scanId}`,
  };
}

export async function pollScanStatus(
  projectId: string,
  scanId: string
): Promise<{ scan: Scan; isComplete: boolean; isFailed: boolean }> {
  const data = await apiClient<ApiScan>(`/api/scans/${scanId}`);
  const scan = toScan(data, projectId);
  return {
    scan,
    isComplete: scan.status === 'COMPLETED',
    isFailed: scan.status === 'FAILED',
  };
}
