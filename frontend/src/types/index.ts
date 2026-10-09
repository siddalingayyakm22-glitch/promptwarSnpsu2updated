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
  senderRisk?: number;
  messageRisk?: number;
  linkRisk?: number;
  threatIntel?: {
    matched: boolean;
    provider: string;
    threatCategory: string | null;
    evidence: string;
    status: string;
    attribution: string;
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
  topThreats: { type: string; count: number }[];
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
    database: { connected: boolean; mode: string };
    aiService: { online: boolean; models?: any };
    threatIntelligence: { providers: any[]; cacheEntries: number };
  };
}
