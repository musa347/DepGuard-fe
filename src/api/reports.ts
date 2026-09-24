import { ScanReport, Dependency, ApiScanReport, ApiReportDependency, EolStatus } from '../types';
import { apiClient } from './client';

function eolStatusToFrontend(status: EolStatus): 'ACTIVE' | 'EOL' | 'UNKNOWN' {
  if (status === 'EOL') return 'EOL';
  if (status === 'SUPPORTED' || status === 'MAINTENANCE') return 'ACTIVE';
  return 'UNKNOWN';
}

function toDependency(d: ApiReportDependency): Dependency {
  return {
    id: `${d.groupId}:${d.artifactId}`,
    groupId: d.groupId,
    artifactId: d.artifactId,
    version: d.version,
    type: d.direct ? 'DIRECT' : 'TRANSITIVE',
    scope: d.scope as Dependency['scope'],
    description: '',
    risk: d.riskLevel,
    confidence: d.confidence,
    depth: d.direct ? 0 : 1,
    eol: {
      isEol: d.eolStatus === 'EOL',
      status: eolStatusToFrontend(d.eolStatus),
      eolDate: d.eolDate ?? undefined,
      description: d.riskReasons.find((r) => r.toLowerCase().includes('eol')),
      sourceName: 'endoflife.date',
    },
    vulnerabilities: d.advisories.map((a) => ({
      id: a.osvId,
      title: a.summary ?? a.osvId,
      description: a.summary ?? '',
      severity: a.severity,
      cvssScore: a.cvssScore ?? undefined,
      feed: 'OSV',
    })),
    recommendation: d.recommendation
      ? {
          dependencyId: `${d.groupId}:${d.artifactId}`,
          currentVersion: d.version,
          recommendedVersion: d.recommendation.recommendedVersion,
          upgradeType:
            d.recommendation.upgradeType === 'MAJOR' ? 'Cross-major' : 'Same-major / compatible',
          compatibility:
            d.recommendation.upgradeType === 'MAJOR' ? 'Review required' : 'Compatible',
          compatibilityAssessment: d.recommendation.breakingChangeSummary,
          reason: d.recommendation.reason,
        }
      : null,
    transitivePath: [],
  };
}

function toScanReport(r: ApiScanReport, projectId: string): ScanReport {
  const s = r.summary;
  return {
    scanId: r.scanId,
    projectId,
    repository: r.repositoryUrl.replace(/^https?:\/\//, ''),
    branch: r.branch,
    commitSha: r.commitSha,
    timestamp: r.scannedAt,
    riskHeuristic: {
      score: 0,
      level: r.overallHealth,
      confidence: 'HIGH',
      summary: `${r.overallHealth} risk · ${s.totalDependencies} dependencies`,
      breakdown: {
        critical: s.criticalCount,
        criticalPercent: s.totalDependencies
          ? Math.round((s.criticalCount / s.totalDependencies) * 100)
          : 0,
        high: s.highCount,
        highPercent: s.totalDependencies
          ? Math.round((s.highCount / s.totalDependencies) * 100)
          : 0,
        medium: s.mediumCount,
        mediumPercent: s.totalDependencies
          ? Math.round((s.mediumCount / s.totalDependencies) * 100)
          : 0,
        low: s.lowCount,
        lowPercent: s.totalDependencies
          ? Math.round((s.lowCount / s.totalDependencies) * 100)
          : 0,
      },
    },
    totalDependencies: s.totalDependencies,
    directCount: r.dependencies.filter((d) => d.direct).length,
    transitiveCount: r.dependencies.filter((d) => !d.direct).length,
    highRiskCount: s.highCount,
    criticalCount: s.criticalCount,
    eolCount: s.eolCount,
    dependencies: r.dependencies.map(toDependency),
    analysisSources: {
      lifecycle: {
        name: 'endoflife.date',
        status: r.dataSources.eolFetchedAt ? 'synced' : 'unindexed',
      },
      securityAdvisories: {
        name: 'OSV',
        status: r.dataSources.advisoryFetchedAt ? 'live' : 'synced',
      },
      packageMetadata: { name: 'Maven Central', status: 'verified' },
      repository: { name: 'GitHub', status: 'read-only' },
    },
    provenance: {
      commitSha: r.commitSha,
      branchTarget: r.branch,
      scanTimestamp: r.scannedAt,
      engineParser: 'DepGuard Maven Resolver',
    },
  };
}

export async function fetchScanReport(projectId: string, scanId: string): Promise<ScanReport> {
  const data = await apiClient<ApiScanReport>(`/api/scans/${scanId}/report`);
  return toScanReport(data, projectId);
}

export async function fetchDependencyDetail(
  projectId: string,
  dependencyId: string,
  scanId: string
): Promise<Dependency | null> {
  const report = await fetchScanReport(projectId, scanId);
  return (
    report.dependencies.find(
      (d) => d.id === dependencyId || `${d.groupId}:${d.artifactId}` === dependencyId
    ) ?? null
  );
}
