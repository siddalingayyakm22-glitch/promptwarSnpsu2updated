export type RiskClassification = 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';

export type IndicatorSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IndicatorSource = 'OBSERVED_FACT' | 'HEURISTIC_RULE' | 'ML_PREDICTION' | 'EXTERNAL_INTEL';

export interface Indicator {
  id: string;
  title: string;
  description: string;
  severity: IndicatorSeverity;
  source: IndicatorSource;
  observedValue?: string;
  whyItMatters: string;
  confidence?: string;
}

export interface ThreatIntelInfo {
  matched: boolean;
  provider: string;
  threatCategory: string | null;
  evidence: string;
  firstSeen?: string;
  status: string;
  attribution: string;
  fromCache?: boolean;
}

export interface ScanResult {
  scanId: string;
  scanType: 'URL' | 'MESSAGE' | 'EMAIL' | 'QR' | 'ATTACHMENT';
  riskScore: number;
  classification: RiskClassification;
  threatType: string;
  modelProbability: number | null;
  confidence: number | null;
  detectionMethod: 'MACHINE_LEARNING' | 'RULE_BASED' | 'HYBRID' | 'THREAT_INTEL';
  indicators: Indicator[];
  recommendations: string[];
  limitations: string[];
  createdAt: string;
  rawUrl?: string;
  hostname?: string;
  redactedInput?: string;
  decodedPayload?: string;
  isUrl?: boolean;
  isUPI?: boolean;
  senderRisk?: number;
  messageRisk?: number;
  linkRisk?: number;
  threatIntel?: ThreatIntelInfo;
  extractedUrls?: string[];
  extractedPhones?: string[];
  engineMetadata?: {
    modelVersion?: string | null;
    ruleEngineVersion?: string;
    analysisDurationMs?: number;
  };
}

export interface DashboardSummary {
  totalScans: number;
  safeCount: number;
  suspiciousCount: number;
  highRiskCount: number;
  averageRiskScore: number;
  threatsDetected: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  topThreats: Array<{ type: string; count: number }>;
  detectionMethods: Record<string, number>;
  recentScans: Array<{
    scanId: string;
    scanType: string;
    target: string;
    riskScore: number;
    classification: RiskClassification;
    threatType: string;
    detectionMethod: string;
    createdAt: string;
  }>;
  systemHealth: {
    database: { connected: boolean; mode: string; recordsCount?: number | null };
    aiService: { online: boolean; models?: Record<string, unknown>; error?: string };
    threatIntelligence: { providers: Array<{ name: string; status: string; localFeed: boolean }>; cacheEntries: number; lastUpdated?: string };
  };
}

export interface AnalyticsData {
  totalRecords: number;
  scansByType: Array<{ type: string; count: number }>;
  riskDistribution: Array<{ band: string; count: number; color: string }>;
  topObservedIndicators: Array<{ indicator: string; count: number }>;
}

export interface ThreatFeedOverview {
  providers: Array<{ name: string; status: string; localFeed: boolean; signaturesCount?: number }>;
  cacheEntries: number;
  lastUpdated: string;
}

export interface EducationModule {
  id: string;
  title: string;
  category: string;
  summary: string;
  signs: string[];
  prevention: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface QuizSubmissionFeedback {
  questionId: string;
  question: string;
  userAnswer?: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  feedback: QuizSubmissionFeedback[];
}

export interface SystemHealthStatus {
  status: string;
  database: { connected: boolean; mode: string };
  aiService: { online: boolean; models?: Record<string, unknown> };
}
