import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchScans, fetchScanById, triggerScan, pollScanStatus } from '../api/scans';

export function useScans(projectId: string | undefined) {
  return useQuery({
    queryKey: ['scans', projectId],
    queryFn: () => (projectId ? fetchScans(projectId) : []),
    enabled: Boolean(projectId),
  });
}

export function useScan(projectId: string | undefined, scanId: string | undefined) {
  return useQuery({
    queryKey: ['scan', projectId, scanId],
    queryFn: () => (projectId && scanId ? fetchScanById(projectId, scanId) : null),
    enabled: Boolean(projectId && scanId),
  });
}

export function usePollScan(projectId: string | undefined, scanId: string | undefined) {
  return useQuery({
    queryKey: ['pollScan', projectId, scanId],
    queryFn: () => (projectId && scanId ? pollScanStatus(projectId, scanId) : null),
    enabled: Boolean(projectId && scanId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.isComplete || data?.isFailed) return false;
      return 3000;
    },
  });
}

export function useTriggerScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId }: { projectId: string }) => triggerScan(projectId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scans', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
}
