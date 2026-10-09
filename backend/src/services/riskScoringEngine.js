/**
 * Central Risk Scoring Engine
 * Combines ML predictions, heuristic rules, and threat intelligence into a normalized 0-100 score.
 * Enforces explainability and evidence segregation.
 */

const SEVERITY_SCORES = {
  INFO: 0,
  LOW: 10,
  MEDIUM: 25,
  HIGH: 45,
  CRITICAL: 80
};

function calculateOverallRisk({
  ruleScore = 0,
  mlProbability = null,
  threatIntelMatched = false,
  indicators = []
}) {
  let score = 0;

  // 1. External Threat Intelligence Override
  if (threatIntelMatched) {
    score = Math.max(88, ruleScore);
  } else {
    // 2. Base heuristic rule score (weighted sum capped at 100)
    let indicatorTotal = 0;
    for (const ind of indicators) {
      indicatorTotal += SEVERITY_SCORES[ind.severity] || 0;
    }
    // Dampen saturated indicator score
    const heuristicRisk = Math.min(95, Math.round(ruleScore * 0.5 + indicatorTotal * 0.5));

    // 3. Blend with ML model probability if available
    if (mlProbability !== null && !isNaN(mlProbability)) {
      const mlRiskScore = Math.round(mlProbability * 100);
      // Blended risk: 50% Heuristic Evidence + 50% ML Model output
      score = Math.round(heuristicRisk * 0.50 + mlRiskScore * 0.50);
    } else {
      score = heuristicRisk;
    }
  }

  // Bound score strictly 0 to 100
  score = Math.max(0, Math.min(100, score));

  // Determine band
  let classification = 'SAFE';
  if (score >= 61) {
    classification = 'HIGH_RISK';
  } else if (score >= 31) {
    classification = 'SUSPICIOUS';
  } else {
    classification = 'SAFE';
  }

  return {
    riskScore: score,
    classification
  };
}

function generateRecommendations(classification, threatType, indicators = []) {
  const recs = [];

  if (classification === 'HIGH_RISK') {
    recs.push('DO NOT click links, download attachments, or input personal credentials on this target.');
    recs.push('Block and report the sender / domain immediately.');
    if (threatType.includes('BANK') || threatType.includes('FINANCIAL') || threatType.includes('OTP')) {
      recs.push('If you already entered an OTP or PIN, call your bank customer helpline immediately (or dial 1930 in India).');
      recs.push('Change your banking and email passwords immediately from a separate secure device.');
    }
  } else if (classification === 'SUSPICIOUS') {
    recs.push('Exercise caution: Verify the sender or domain via an independent official channel before interacting.');
    recs.push('Do not share passwords, 2FA codes, or financial account numbers.');
    recs.push('Check the full domain spelling carefully for lookalike letters (typosquatting).');
  } else {
    recs.push('No immediate high-risk indicators observed, but always remain vigilant.');
    recs.push('Ensure your multi-factor authentication (MFA) is enabled for sensitive accounts.');
  }

  return recs;
}

module.exports = {
  calculateOverallRisk,
  generateRecommendations,
  SEVERITY_SCORES
};
