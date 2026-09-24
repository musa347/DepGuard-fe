import { useQuery } from '@tanstack/react-query';
import { fetchScanReport, fetchDependencyDetail } from '../api/reports';

export function useScanReport(projectId: string | undefined, scanId: string | undefined) {
  return useQuery({
    queryKey: ['report', projectId, scanId],
    queryFn: () => fetchScanReport(projectId!, scanId!),
    enabled: Boolean(projectId && scanId),
  });
}

export function useDependencyDetail(
  projectId: string | undefined,
  dependencyId: string | undefined,
  scanId: string | undefined
) {
  return useQuery({
    queryKey: ['dependency', projectId, dependencyId, scanId],
    queryFn: () => fetchDependencyDetail(projectId!, dependencyId!, scanId!),
    enabled: Boolean(projectId && dependencyId && scanId),
  });
}
