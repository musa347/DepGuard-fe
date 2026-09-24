import { useQuery } from '@tanstack/react-query';
import { fetchRemediations } from '../api/recommendations';

export function useRemediations(projectId: string | undefined, scanId: string | undefined) {
  return useQuery({
    queryKey: ['remediations', projectId, scanId],
    queryFn: () => fetchRemediations(projectId!, scanId!),
    enabled: Boolean(projectId && scanId),
  });
}
