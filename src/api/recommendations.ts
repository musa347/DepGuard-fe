import { ProjectRemediationSummary } from '../types';
import { ApiScanRecommendation } from '../types';
import { apiClient } from './client';

export async function fetchRemediations(
  projectId: string,
  scanId: string
): Promise<ProjectRemediationSummary> {
  const data = await apiClient<ApiScanRecommendation[]>(`/api/scans/${scanId}/recommendations`);
  return {
    projectId,
    projectName: '',
    repository: '',
    branch: '',
    commitSha: '',
    scannedTimestamp: '',
    attentionRequiredCount: data.length,
    availableRecommendationsCount: data.length,
    crossMajorCount: data.filter((r) => r.upgradeType === 'MAJOR').length,
    items: data.map((r) => ({
      dependencyId: r.dependencyId,
      groupId: r.dependencyId.split(':')[0] ?? '',
      artifactId: r.dependencyId.split(':')[1] ?? r.dependencyId,
      currentVersion: r.currentVersion,
      type: 'DIRECT' as const,
      risk: 'HIGH' as const,
      eolStatus: '',
      eolBadgeType: 'neutral' as const,
      recommendation: {
        dependencyId: r.dependencyId,
        currentVersion: r.currentVersion,
        recommendedVersion: r.recommendedVersion,
        upgradeType: r.upgradeType === 'MAJOR' ? 'Cross-major' : 'Same-major / compatible',
        compatibility: r.upgradeType === 'MAJOR' ? 'Review required' : 'Compatible',
        compatibilityAssessment: r.breakingChangeSummary,
        reason: r.reason,
      },
    })),
  };
}
