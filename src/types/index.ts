export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type ScanStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type EolStatus = 'SUPPORTED' | 'MAINTENANCE' | 'EOL' | 'UNKNOWN';
export type DependencyType = 'DIRECT' | 'TRANSITIVE';
export type DependencyScope = 'compile' | 'test' | 'runtime' | 'provided';

// ── Backend API response shapes ───────────────────────────────────────────────

export interface ApiProject {
  id: string;
  name: string;
  repositoryUrl: string;
  defaultBranch: string;
  createdAt: string;
}

export interface ApiScan {
  id: string;
  status: ScanStatus;
  commitSha: string | null;
  branch: string | null;
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  dependencyCount: number;
  riskSummary: {
    overallHealth: RiskLevel;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    eolCount: number;
  } | null;
  dependencies: ApiScanDependency[];
}

export interface ApiScanDependency {
  groupId: string;
  artifactId: string;
  version: string;
  scope: string;
  direct: boolean;
}

export interface ApiAdvisory {
  osvId: string;
  summary: string | null;
  severity: RiskLevel;
  cvssScore: number | null;
}

export interface ApiReportDependency {
  groupId: string;
  artifactId: string;
  version: string;
  direct: boolean;
  scope: string;
  eolStatus: EolStatus;
  eolDate: string | null;
  advisories: ApiAdvisory[];
  riskLevel: RiskLevel;
  heuristicScore: number;
  confidence: ConfidenceLevel;
  riskReasons: string[];
  recommendation: ApiRecommendation | null;
}

export interface ApiRecommendation {
  recommendedVersion: string;
  upgradeType: 'PATCH' | 'MINOR' | 'MAJOR';
  breakingChangeSummary: string;
  reason: string;
  confidence: ConfidenceLevel;
}

export interface ApiReportSummary {
  totalDependencies: number;
  eolCount: number;
  vulnerableCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  unknownEolCount: number;
}

export interface ApiDataSources {
  eolFetchedAt: string | null;
  advisoryFetchedAt: string | null;
}

export interface ApiScanReport {
  scanId: string;
  projectName: string;
  repositoryUrl: string;
  commitSha: string;
  branch: string;
  scannedAt: string;
  overallHealth: RiskLevel;
  dataSources: ApiDataSources;
  summary: ApiReportSummary;
  dependencies: ApiReportDependency[];
}

export interface ApiScanRecommendation {
  dependencyId: string;
  currentVersion: string;
  recommendedVersion: string;
  upgradeType: 'PATCH' | 'MINOR' | 'MAJOR';
  breakingChangeSummary: string;
  reason: string;
  confidence: ConfidenceLevel;
}

// ── Frontend UI shapes ────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  repositoryUrl: string;
  branch: string;
  latestCommit: {
    sha: string;
    message: string;
    date: string;
  };
  lastScanAt: string;
  dependencyCount: number;
  directCount: number;
  transitiveCount: number;
  health: RiskLevel;
  scanStatus: ScanStatus;
  highRiskCount: number;
  criticalCount: number;
  eolCount: number;
  buildTool: string;
  configId: string;
  scanFrequency: string;
}

export interface Scan {
  id: string;
  projectId: string;
  scanNumber: number;
  commitSha: string;
  commitMessage: string;
  branch: string;
  startedAt: string;
  duration: string;
  status: ScanStatus;
  failureReason?: string;
  dependencyCount?: number;
  highRiskCount?: number;
  criticalCount?: number;
  resultSummary?: string;
  workerId?: string;
}

export interface Vulnerability {
  id: string;
  title?: string;
  description: string;
  severity: RiskLevel;
  cvssScore?: number;
  feed: string;
  fixedIn?: string;
}

export interface EolRecord {
  isEol: boolean;
  status: 'ACTIVE' | 'EOL' | 'UNKNOWN';
  eolDate?: string;
  description?: string;
  sourceUrl?: string;
  sourceName?: string;
}

export interface RemediationRecommendation {
  dependencyId: string;
  currentVersion: string;
  recommendedVersion: string | null;
  upgradeType: 'Same-major / compatible' | 'Cross-major' | 'Not available';
  compatibility: 'Compatible' | 'Review required' | 'Unknown' | 'Not available';
  compatibilityAssessment: string;
  reason: string;
  securityAdvisoryNote?: string;
  pomXmlSnippet?: string;
}

export interface Dependency {
  id: string;
  groupId: string;
  artifactId: string;
  version: string;
  type: DependencyType;
  scope: DependencyScope;
  description: string;
  risk: RiskLevel;
  confidence: ConfidenceLevel;
  eol: EolRecord;
  vulnerabilities: Vulnerability[];
  recommendation: RemediationRecommendation | null;
  transitivePath?: string[];
  depth: number;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  confidence: ConfidenceLevel;
  summary: string;
  breakdown: {
    critical: number;
    criticalPercent: number;
    high: number;
    highPercent: number;
    medium: number;
    mediumPercent: number;
    low: number;
    lowPercent: number;
  };
}

export interface AnalysisSources {
  lifecycle: { name: string; status: 'synced' | 'live' | 'verified' | 'unindexed' };
  securityAdvisories: { name: string; status: 'live' | 'synced' | 'verified' };
  packageMetadata: { name: string; status: 'verified' | 'synced' };
  repository: { name: string; status: 'read-only' };
}

export interface ScanProvenance {
  commitSha: string;
  branchTarget: string;
  scanTimestamp: string;
  engineParser: string;
}

export interface ScanReport {
  scanId: string;
  projectId: string;
  repository: string;
  branch: string;
  commitSha: string;
  timestamp: string;
  riskHeuristic: RiskAssessment;
  totalDependencies: number;
  directCount: number;
  transitiveCount: number;
  highRiskCount: number;
  criticalCount: number;
  eolCount: number;
  dependencies: Dependency[];
  analysisSources: AnalysisSources;
  provenance: ScanProvenance;
}

export interface RemediationItem {
  dependencyId: string;
  groupId: string;
  artifactId: string;
  currentVersion: string;
  type: DependencyType;
  risk: RiskLevel;
  eolStatus: string;
  eolBadgeType: 'neutral' | 'warning' | 'danger';
  recommendation: RemediationRecommendation;
}

export interface ProjectRemediationSummary {
  projectId: string;
  projectName: string;
  repository: string;
  branch: string;
  commitSha: string;
  scannedTimestamp: string;
  attentionRequiredCount: number;
  availableRecommendationsCount: number;
  crossMajorCount: number;
  items: RemediationItem[];
}
