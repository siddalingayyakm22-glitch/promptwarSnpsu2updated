/**
 * Scam Message Analysis Service
 * Detects social engineering, OTP requests, urgent threats, prize frauds, and fake job scams.
 * Combines rule heuristics with TF-IDF + Logistic Regression ML predictions.
 */

const { predictMessage } = require('./aiServiceConnector');
const { calculateOverallRisk, generateRecommendations } = require('./riskScoringEngine');

const SCAM_PATTERNS = [
  {
    id: 'SCAM_OTP_REQUEST',
    title: 'OTP / Verification Code Request',
    regex: /\b(otp|one[- ]time password|verification code|pin|cvv|password)\b/i,
    severity: 'CRITICAL',
    score: 60,
    whyItMatters: 'Legitimate institutions never request your secret OTP or PIN via SMS or chat.'
  },
  {
    id: 'SCAM_URGENT_SUSPENSION',
    title: 'Urgent Threat of Account Suspension or Disconnection',
    regex: /\b(suspended|blocked|disconnected|deactivated|within 24 hours|action required immediately|last chance|overdue|penalty)\b/i,
    severity: 'HIGH',
    score: 40,
    whyItMatters: 'Attackers create panic and artificial deadlines so victims act before thinking.'
  },
  {
    id: 'SCAM_PRIZE_LOTTERY',
    title: 'Prize, Lottery, or Unexpected Refund Claim',
    regex: /\b(congratulations|winner|won|lottery|cash prize|free iphone|gift card|bonus|reward points expiring|tax refund)\b/i,
    severity: 'HIGH',
    score: 45,
    whyItMatters: 'Unsolicited prize notifications almost universally demand upfront processing fees or credentials.'
  },
  {
    id: 'SCAM_FAKE_JOB_INVEST',
    title: 'Guaranteed High Returns / Work-From-Home Task Scam',
    regex: /\b(earn \$\d+|daily salary|rate apps|like videos|telegram @|crypto doubler|guaranteed \d+%)|invest \$\d+\b/i,
    severity: 'HIGH',
    score: 40,
    whyItMatters: 'High-yield task and investment scams trick victims into wiring deposit fees to unlock fake profits.'
  },
  {
    id: 'SCAM_REMOTE_ACCESS',
    title: 'Remote Access / Screen Sharing Solicitation',
    regex: /\b(anydesk|teamviewer|quicksupport|screen share|install apk|download app)\b/i,
    severity: 'CRITICAL',
    score: 65,
    whyItMatters: 'Remote desktop applications give scammers unrestricted control over banking and device screens.'
  },
  {
    id: 'SCAM_FINANCIAL_IMPERSONATION',
    title: 'Bank or Payment Gateway Impersonation',
    regex: /\b(sbi|hdfc|icici|axis|chase|wells fargo|bank of america|paytm|phonepe|gpay|upi|paypal|credit card limit)\b/i,
    severity: 'MEDIUM',
    score: 25,
    whyItMatters: 'Scammers frequently disguise themselves as recognized banking names to build false credibility.'
  }
];

async function analyzeMessage(text) {
  const startTime = Date.now();
  const rawText = (text || '').trim();
  if (!rawText) {
    throw new Error('Message text cannot be empty');
  }

  const indicators = [];
  let heuristicScore = 0;

  // Extract embedded URLs safely
  const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;
  const extractedUrls = rawText.match(urlRegex) || [];

  // Extract phone numbers safely
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[\s-]?\d{10}/g;
  const extractedPhones = rawText.match(phoneRegex) || [];

  if (extractedUrls.length > 0) {
    indicators.push({
      id: 'OBS_EMBEDDED_LINKS',
      title: `Embedded Links Detected (${extractedUrls.length})`,
      description: `Message includes external link(s): ${extractedUrls.slice(0, 2).join(', ')}`,
      severity: 'MEDIUM',
      source: 'OBSERVED_FACT',
      observedValue: `${extractedUrls.length} links`,
      whyItMatters: 'Smishing messages rely on links to funnel victims to credential-harvesting phishing forms.'
    });
    heuristicScore += 20;
  }

  // Rule heuristics matching
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.regex.test(rawText)) {
      indicators.push({
        id: pattern.id,
        title: pattern.title,
        description: `Message contains wording matching: ${pattern.title.toLowerCase()}`,
        severity: pattern.severity,
        source: 'HEURISTIC_RULE',
        observedValue: 'Pattern matched',
        whyItMatters: pattern.whyItMatters
      });
      heuristicScore += pattern.score;
    }
  }

  // ML Prediction
  const mlResult = await predictMessage(rawText);
  let detectionMethod = 'RULE_BASED';

  if (mlResult && mlResult.available) {
    detectionMethod = 'HYBRID';
    indicators.push({
      id: 'ML_MESSAGE_SCAM_PRED',
      title: `AI Natural Language Model: ${mlResult.predicted_label}`,
      description: `TF-IDF + Logistic Regression classified content with ${Math.round((mlResult.probability || 0) * 100)}% scam probability.`,
      severity: (mlResult.probability || 0) > 0.65 ? 'HIGH' : ((mlResult.probability || 0) > 0.35 ? 'MEDIUM' : 'INFO'),
      source: 'ML_PREDICTION',
      observedValue: `P(Scam)=${mlResult.probability}`,
      whyItMatters: 'Classified using linguistic patterns trained across SMS/chat threat datasets.'
    });
  }

  // Final Risk Calculation
  const { riskScore, classification } = calculateOverallRisk({
    ruleScore: heuristicScore,
    mlProbability: mlResult.available ? mlResult.probability : null,
    threatIntelMatched: false,
    indicators
  });

  let threatType = 'BENIGN_MESSAGE';
  if (classification === 'HIGH_RISK') {
    if (/otp|pin|cvv|password/i.test(rawText)) threatType = 'OTP_CREDENTIAL_THEFT';
    else if (/lottery|prize|winner/i.test(rawText)) threatType = 'LOTTERY_PRIZE_SCAM';
    else if (/suspended|blocked|disconnected/i.test(rawText)) threatType = 'COERCIVE_ACCOUNT_SUSPENSION';
    else threatType = 'SOCIAL_ENGINEERING_SCAM';
  } else if (classification === 'SUSPICIOUS') {
    threatType = 'POTENTIAL_SPAM_OR_PHISH';
  }

  const recommendations = generateRecommendations(classification, threatType, indicators);
  const limitations = [
    'Text-based linguistic heuristic and statistical feature extraction.',
    'Sender identity cannot be authenticated solely from message text without carrier routing metadata.'
  ];
  if (!mlResult.available) {
    limitations.push('Python NLP model was offline; evaluated via deterministic rule engine.');
  }

  // Redacted preview for safe display
  const redactedPreview = rawText.length > 120 ? rawText.substring(0, 117) + '...' : rawText;

  return {
    redactedInput: redactedPreview,
    extractedUrls,
    extractedPhones,
    riskScore,
    classification,
    threatType,
    modelProbability: mlResult.available ? mlResult.probability : null,
    confidence: mlResult.available ? mlResult.confidence : null,
    detectionMethod,
    indicators,
    recommendations,
    limitations,
    engineMetadata: {
      modelVersion: mlResult.version || null,
      ruleEngineVersion: '1.2.0',
      analysisDurationMs: Date.now() - startTime
    }
  };
}

module.exports = {
  analyzeMessage
};
