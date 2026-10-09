/**
 * URL Phishing Analysis Service
 * Combines SSRF safety checks, lexical inspection, brand impersonation analysis,
 * external threat intel, and FastAPI ML inference.
 */

const { isSafePublicTarget } = require('../utils/ssrfGuard');
const { checkThreatIntel } = require('./threatIntelService');
const { predictURL } = require('./aiServiceConnector');
const { calculateOverallRisk, generateRecommendations } = require('./riskScoringEngine');

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'work', 'buzz', 'click', 'link', 'gq', 'ml', 'cf', 'tk',
  'ga', 'icu', 'cam', 'rest', 'fit', 'sbs', 'cfd', 'monster', 'hair'
]);

const POPULAR_BRANDS = [
  'paypal', 'google', 'apple', 'microsoft', 'amazon', 'netflix', 'facebook',
  'instagram', 'whatsapp', 'chase', 'wellsfargo', 'bankofamerica', 'citibank',
  'sbi', 'hdfc', 'icici', 'axisbank', 'binance', 'coinbase', 'dropbox'
];

const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'verify', 'verification', 'update', 'account', 'banking',
  'secure', 'security', 'wallet', 'confirm', 'password', 'credential', 'auth',
  'support', 'billing', 'invoice', 'payment', 'unlock', 'recover', 'kyc'
];

async function analyzeURL(inputUrl) {
  const startTime = Date.now();
  let rawUrl = (inputUrl || '').trim();
  if (!/^https?:\/\//i.test(rawUrl)) {
    rawUrl = 'http://' + rawUrl;
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (e) {
    throw new Error('Invalid URL format provided');
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;
  const search = parsed.search;

  // 1. SSRF Safety Assessment
  const ssrfCheck = isSafePublicTarget(hostname);

  const indicators = [];
  let heuristicScore = 0;

  // Observed fact: Protocol & Hostname
  indicators.push({
    id: 'OBS_PROTO',
    title: `Protocol: ${parsed.protocol.replace(':', '').toUpperCase()}`,
    description: parsed.protocol === 'https:' ? 'URL uses TLS encryption.' : 'URL does not use HTTPS encryption; communication is in plain text.',
    severity: parsed.protocol === 'https:' ? 'INFO' : 'MEDIUM',
    source: 'OBSERVED_FACT',
    observedValue: parsed.protocol,
    whyItMatters: 'Unencrypted HTTP connections can be intercepted and modified in transit.'
  });

  if (parsed.protocol === 'http:') {
    heuristicScore += 15;
  }

  // Check IP address hostname
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIp) {
    indicators.push({
      id: 'HEUR_IP_HOST',
      title: 'Direct IP Address Hostname',
      description: `Hostname is a raw IP address (${hostname}) instead of a registered domain name.`,
      severity: 'HIGH',
      source: 'HEURISTIC_RULE',
      observedValue: hostname,
      whyItMatters: 'Legitimate consumer websites virtually never serve authentication portals directly over raw IP addresses.'
    });
    heuristicScore += 35;
  }

  // Punycode check
  if (hostname.includes('xn--')) {
    indicators.push({
      id: 'HEUR_PUNYCODE',
      title: 'Punycode / IDN Homograph Detected',
      description: `Host contains internationalized punycode ('xn--'), which can mimic characters from other alphabets.`,
      severity: 'CRITICAL',
      source: 'HEURISTIC_RULE',
      observedValue: hostname,
      whyItMatters: 'Homograph attacks use visual duplicates (e.g. Cyrillic "a" vs Latin "a") to deceive victims.'
    });
    heuristicScore += 45;
  }

  // High-risk TLD check
  const hostParts = hostname.split('.');
  const tld = hostParts[hostParts.length - 1];
  if (SUSPICIOUS_TLDS.has(tld)) {
    indicators.push({
      id: 'HEUR_SUSP_TLD',
      title: `Uncommon or High-Abuse TLD (.${tld})`,
      description: `Top-level domain (.${tld}) is frequently leveraged in automated disposable phishing setups.`,
      severity: 'MEDIUM',
      source: 'HEURISTIC_RULE',
      observedValue: `.${tld}`,
      whyItMatters: 'Disposable and ultra-low-cost TLDs have statistically higher rates of malicious disposable registrations.'
    });
    heuristicScore += 20;
  }

  // Brand impersonation check
  const brandHits = [];
  const registeredDomain = hostParts.slice(-2).join('.');
  for (const brand of POPULAR_BRANDS) {
    if (hostname.includes(brand) || pathname.includes(brand)) {
      if (!registeredDomain.startsWith(brand + '.')) {
        brandHits.push(brand);
      }
    }
  }

  if (brandHits.length > 0) {
    indicators.push({
      id: 'HEUR_BRAND_IMPERSONATION',
      title: `Brand Name Mismatch Detected (${brandHits.join(', ')})`,
      description: `The URL references known brand(s) '${brandHits.join(', ')}' but is hosted on an unrelated domain (${registeredDomain}).`,
      severity: 'CRITICAL',
      source: 'HEURISTIC_RULE',
      observedValue: brandHits.join(', '),
      whyItMatters: 'Phishers routinely embed legitimate corporate names into subdomains or paths to trick users.'
    });
    heuristicScore += 50;
  }

  // Keyword hits
  const fullUrlLower = rawUrl.toLowerCase();
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter(kw => fullUrlLower.includes(kw));
  if (foundKeywords.length > 0) {
    indicators.push({
      id: 'HEUR_CRED_KEYWORDS',
      title: `Security & Authentication Terms (${foundKeywords.slice(0, 4).join(', ')})`,
      description: `URL contains sensitive account action terms: ${foundKeywords.join(', ')}.`,
      severity: foundKeywords.length >= 2 ? 'HIGH' : 'LOW',
      source: 'HEURISTIC_RULE',
      observedValue: foundKeywords.join(', '),
      whyItMatters: 'Credential harvesters lure users to fake login and verification gateways.'
    });
    heuristicScore += foundKeywords.length * 10;
  }

  // Excessive length or subdomains
  if (hostParts.length >= 4) {
    indicators.push({
      id: 'HEUR_DEEP_SUBDOMAINS',
      title: `Excessive Subdomain Stacking (${hostParts.length} levels)`,
      description: `Domain structure has ${hostParts.length} levels, often used to conceal real domain owner.`,
      severity: 'MEDIUM',
      source: 'HEURISTIC_RULE',
      observedValue: hostname,
      whyItMatters: 'Phishing kits often use nested subdomains like login.bank.com.attacker.xyz to deceive mobile users.'
    });
    heuristicScore += 15;
  }

  // 2. Threat Intel Lookup
  const intelResult = await checkThreatIntel(rawUrl, hostname);
  if (intelResult.matched) {
    indicators.push({
      id: 'INTEL_KNOWN_THREAT',
      title: `Threat Feed Match: ${intelResult.threatCategory}`,
      description: intelResult.evidence,
      severity: 'CRITICAL',
      source: 'EXTERNAL_INTEL',
      observedValue: intelResult.status,
      whyItMatters: 'The destination is currently actively indexed on cyber intelligence threat feeds.'
    });
  }

  // 3. AI ML Prediction
  const mlResult = await predictURL(rawUrl);
  let detectionMethod = 'RULE_BASED';

  if (mlResult && mlResult.available) {
    detectionMethod = 'HYBRID';
    indicators.push({
      id: 'ML_PHISHING_PRED',
      title: `Machine Learning Assessment: ${mlResult.predicted_label}`,
      description: `Evaluated using ${mlResult.model_name || 'Random Forest'} with ${Math.round((mlResult.probability || 0) * 100)}% phishing probability.`,
      severity: (mlResult.probability || 0) > 0.65 ? 'HIGH' : ((mlResult.probability || 0) > 0.35 ? 'MEDIUM' : 'INFO'),
      source: 'ML_PREDICTION',
      observedValue: `P(Phish)=${mlResult.probability}`,
      whyItMatters: 'Learned lexical and structural features across legitimate vs attack benchmarks.'
    });
  }

  // 4. Calculate Final Risk
  const { riskScore, classification } = calculateOverallRisk({
    ruleScore: heuristicScore,
    mlProbability: mlResult.available ? mlResult.probability : null,
    threatIntelMatched: intelResult.matched,
    indicators
  });

  const threatType = intelResult.matched ? 'CONFIRMED_PHISHING' : (classification === 'HIGH_RISK' ? 'PHISHING_CREDENTIAL_HARVESTER' : (classification === 'SUSPICIOUS' ? 'SUSPICIOUS_LINK' : 'BENIGN_URL'));
  const recommendations = generateRecommendations(classification, threatType, indicators);

  const limitations = [
    'Static lexical, structural, and reputation analysis performed.',
    'Destination page was not actively fetched or rendered to eliminate SSRF and client malware risks.'
  ];
  if (!mlResult.available) {
    limitations.push('Python ML prediction service was unreachable; evaluated using ruleset fallback.');
  }

  return {
    rawUrl,
    hostname,
    riskScore,
    classification,
    threatType,
    modelProbability: mlResult.available ? mlResult.probability : null,
    confidence: mlResult.available ? mlResult.confidence : null,
    detectionMethod: intelResult.matched ? 'THREAT_INTEL' : detectionMethod,
    indicators,
    recommendations,
    limitations,
    threatIntel: intelResult,
    ssrfCheck,
    engineMetadata: {
      modelVersion: mlResult.version || null,
      ruleEngineVersion: '1.2.0',
      analysisDurationMs: Date.now() - startTime
    }
  };
}

module.exports = {
  analyzeURL
};
