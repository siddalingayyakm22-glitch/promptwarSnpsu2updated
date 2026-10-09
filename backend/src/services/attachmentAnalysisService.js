/**
 * Attachment & File Security Metadata Analyzer
 * Evaluates file extension anomalies, double extensions, macro indicators, and MIME mismatches
 * strictly without executing files.
 */

const crypto = require('crypto');
const { calculateOverallRisk, generateRecommendations } = require('./riskScoringEngine');

const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'scr', 'vbs', 'bat', 'cmd', 'ps1', 'apk', 'jar', 'msi',
  'dll', 'iso', 'dmg', 'pif', 'hta', 'reg', 'wsf', 'com'
]);

const MACRO_EXTENSIONS = new Set([
  'docm', 'xlsm', 'pptm', 'dotm', 'xltm', 'xlam'
]);

function analyzeAttachment({ filename = '', mimeType = '', fileSize = 0, fileHash = null }) {
  const startTime = Date.now();
  const rawName = (filename || '').trim();
  if (!rawName) {
    throw new Error('Attachment filename is required for metadata inspection.');
  }

  const indicators = [];
  let heuristicScore = 0;

  // Split extensions
  const parts = rawName.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  const hasDoubleExt = parts.length > 2;
  const penultimateExt = hasDoubleExt ? parts[parts.length - 2].toLowerCase() : '';

  indicators.push({
    id: 'OBS_FILE_METADATA',
    title: `File Metadata: ${rawName}`,
    description: `Extension: .${ext} | Reported MIME: ${mimeType || 'unknown'} | Size: ${fileSize ? Math.round(fileSize / 1024) + ' KB' : 'unspecified'}`,
    severity: 'INFO',
    source: 'OBSERVED_FACT',
    observedValue: rawName,
    whyItMatters: 'File header and naming conventions are the initial gate for endpoint defense.'
  });

  // Check double extension trick: e.g. Invoice_2026.pdf.exe
  if (hasDoubleExt && DANGEROUS_EXTENSIONS.has(ext)) {
    indicators.push({
      id: 'HEUR_DOUBLE_EXTENSION',
      title: 'Deceptive Double File Extension Detected',
      description: `File disguises an executable (.${ext}) behind an apparent document extension (.${penultimateExt}).`,
      severity: 'CRITICAL',
      source: 'HEURISTIC_RULE',
      observedValue: `${penultimateExt}.${ext}`,
      whyItMatters: 'Classic attack vector designed to fool users whose OS hides known extensions.'
    });
    heuristicScore += 75;
  } else if (DANGEROUS_EXTENSIONS.has(ext)) {
    indicators.push({
      id: 'HEUR_EXECUTABLE_EXT',
      title: `High-Risk Executable Extension (.${ext})`,
      description: `File is an executable binary or scripting format (.${ext}). Email attachments rarely require standalone executables.`,
      severity: 'HIGH',
      source: 'HEURISTIC_RULE',
      observedValue: `.${ext}`,
      whyItMatters: 'Direct execution of untrusted scripts can compromise host systems and install trojans.'
    });
    heuristicScore += 50;
  }

  // Check macro enabled Office docs
  if (MACRO_EXTENSIONS.has(ext)) {
    indicators.push({
      id: 'HEUR_MACRO_ENABLED',
      title: `Macro-Enabled Document Format (.${ext})`,
      description: `Office documents ending in 'm' contain Visual Basic for Applications (VBA) macro capabilities.`,
      severity: 'HIGH',
      source: 'HEURISTIC_RULE',
      observedValue: `.${ext}`,
      whyItMatters: 'Malicious Office macros are frequently used to download second-stage malware upon file opening.'
    });
    heuristicScore += 45;
  }

  // Check MIME vs extension discrepancy
  if (mimeType && ext) {
    if ((mimeType.includes('pdf') && ext !== 'pdf') || (mimeType.includes('image') && !['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext))) {
      indicators.push({
        id: 'HEUR_MIME_MISMATCH',
        title: 'MIME Type and Extension Inconsistency',
        description: `MIME type '${mimeType}' conflicts with declared file extension '.${ext}'.`,
        severity: 'MEDIUM',
        source: 'HEURISTIC_RULE',
        observedValue: `${mimeType} vs .${ext}`,
        whyItMatters: 'Mismatched types can indicate disguised file payloads.'
      });
      heuristicScore += 25;
    }
  }

  const { riskScore, classification } = calculateOverallRisk({
    ruleScore: heuristicScore,
    mlProbability: null,
    threatIntelMatched: false,
    indicators
  });

  const threatType = classification === 'HIGH_RISK' ? (hasDoubleExt ? 'DECEPTIVE_DOUBLE_EXTENSION' : 'SUSPICIOUS_EXECUTABLE') : (classification === 'SUSPICIOUS' ? 'SUSPICIOUS_ATTACHMENT' : 'LOW_RISK_DOCUMENT');
  const recommendations = generateRecommendations(classification, threatType, indicators);
  recommendations.unshift('Never open or run unsolicited email attachments without prior phone or IT verification.');

  return {
    filename: rawName,
    extension: ext,
    fileSize,
    mimeType,
    fileHash,
    riskScore,
    classification,
    threatType,
    detectionMethod: 'RULE_BASED',
    indicators,
    recommendations,
    limitations: [
      'Metadata-only static analysis performed.',
      'File was NOT executed, detonated in sandbox, or decompiled for active signatures.'
    ],
    engineMetadata: {
      ruleEngineVersion: '1.2.0',
      analysisDurationMs: Date.now() - startTime
    }
  };
}

module.exports = {
  analyzeAttachment
};
