/**
 * Email Security Analyzer Service
 * Detects Business Email Compromise (BEC), display-name spoofing, reply-to divergence,
 * fake invoice lures, and parses SPF/DKIM/DMARC headers when provided.
 */

const { calculateOverallRisk, generateRecommendations } = require('./riskScoringEngine');

function analyzeEmail({
  sender = '',
  displayName = '',
  replyTo = '',
  subject = '',
  body = '',
  links = [],
  rawHeaders = ''
}) {
  const startTime = Date.now();
  const indicators = [];
  let senderScore = 0;
  let messageScore = 0;
  let linkScore = 0;

  const senderEmail = (sender || '').toLowerCase().trim();
  const senderDomain = senderEmail.split('@')[1] || '';
  const replyToEmail = (replyTo || '').toLowerCase().trim();
  const replyToDomain = replyToEmail.split('@')[1] || '';
  const dispName = (displayName || '').trim();

  // 1. Sender & Display Name Analysis
  if (dispName && senderDomain) {
    const popularBrands = ['paypal', 'microsoft', 'google', 'apple', 'amazon', 'netflix', 'chase', 'bank of america'];
    const lowerDisp = dispName.toLowerCase();
    for (const brand of popularBrands) {
      if (lowerDisp.includes(brand) && !senderDomain.includes(brand.replace(/\s+/g, ''))) {
        indicators.push({
          id: 'EMAIL_DISPLAY_SPOOF',
          title: `Display Name Impersonation Detected`,
          description: `Display name claims to be '${dispName}', but sending address is '${senderEmail}' (${senderDomain}).`,
          severity: 'CRITICAL',
          source: 'HEURISTIC_RULE',
          observedValue: `${dispName} vs ${senderEmail}`,
          whyItMatters: 'Display-name deception is the #1 tactic in mobile email phishing.'
        });
        senderScore += 55;
        break;
      }
    }
  }

  // 2. Reply-To Mismatch
  if (replyToDomain && senderDomain && replyToDomain !== senderDomain) {
    indicators.push({
      id: 'EMAIL_REPLYTO_MISMATCH',
      title: 'Reply-To Domain Mismatch',
      description: `Replies are routed to a different domain (${replyToDomain}) than the sender (${senderDomain}).`,
      severity: 'HIGH',
      source: 'HEURISTIC_RULE',
      observedValue: `Sender: ${senderDomain} | Reply-To: ${replyToDomain}`,
      whyItMatters: 'Attackers route victim responses to their personal mailbox while spoofing legitimate senders.'
    });
    senderScore += 35;
  }

  // 3. Subject & Body BEC / Urgent Phishing Signals
  const combinedText = `${subject} ${body}`.toLowerCase();
  
  if (/\b(urgent payment|wire transfer|direct deposit update|gift cards|overdue invoice|remittance advice|ach payment)\b/i.test(combinedText)) {
    indicators.push({
      id: 'EMAIL_BEC_INVOICE',
      title: 'Business Email Compromise (BEC) / Wire Fraud Trigger',
      description: 'Email requests urgent wire transfer, payroll account alteration, or invoice redirection.',
      severity: 'HIGH',
      source: 'HEURISTIC_RULE',
      observedValue: 'Financial manipulation patterns',
      whyItMatters: 'BEC scams cost organizations billions each year via fraudulent payment redirection.'
    });
    messageScore += 45;
  }

  if (/\b(password expire|reset credential|mailbox storage full|verify your account|security notification)\b/i.test(combinedText)) {
    indicators.push({
      id: 'EMAIL_CREDENTIAL_LURE',
      title: 'Credential Harvesting Lure in Email Body',
      description: 'Message attempts to panic user into resetting credentials or re-authenticating.',
      severity: 'HIGH',
      source: 'HEURISTIC_RULE',
      observedValue: 'Authentication terms in body',
      whyItMatters: 'Standard tactic for stealing Microsoft 365, Google Workspace, or banking credentials.'
    });
    messageScore += 35;
  }

  // 4. Header Authentication (SPF, DKIM, DMARC) - Truthful reporting!
  const limitations = [];
  if (rawHeaders && rawHeaders.trim().length > 0) {
    const headersLower = rawHeaders.toLowerCase();
    
    // Check SPF
    if (headersLower.includes('spf=pass') || headersLower.includes('received-spf: pass')) {
      indicators.push({
        id: 'AUTH_SPF_PASS',
        title: 'SPF Authentication: PASS',
        description: 'Sending IP is authorized by domain SPF record.',
        severity: 'INFO',
        source: 'OBSERVED_FACT',
        observedValue: 'spf=pass',
        whyItMatters: 'Indicates sending server is authorized by the domain owner.'
      });
    } else if (headersLower.includes('spf=fail') || headersLower.includes('spf=softfail')) {
      indicators.push({
        id: 'AUTH_SPF_FAIL',
        title: 'SPF Authentication: FAIL / SOFTFAIL',
        description: 'Sending IP failed the domain SPF authorization check.',
        severity: 'HIGH',
        source: 'OBSERVED_FACT',
        observedValue: 'spf=fail',
        whyItMatters: 'Strong signal of server spoofing or unauthorized forwarding.'
      });
      senderScore += 30;
    }

    // Check DKIM
    if (headersLower.includes('dkim=pass')) {
      indicators.push({
        id: 'AUTH_DKIM_PASS',
        title: 'DKIM Signature: PASS',
        description: 'Cryptographic DKIM signature matches transmitting domain.',
        severity: 'INFO',
        source: 'OBSERVED_FACT',
        observedValue: 'dkim=pass',
        whyItMatters: 'Verifies email contents were not tampered with in transit.'
      });
    } else if (headersLower.includes('dkim=fail')) {
      indicators.push({
        id: 'AUTH_DKIM_FAIL',
        title: 'DKIM Signature: FAIL',
        description: 'Cryptographic signature verification failed or body was modified.',
        severity: 'HIGH',
        source: 'OBSERVED_FACT',
        observedValue: 'dkim=fail',
        whyItMatters: 'Signature mismatch suggests tampering or forged header identity.'
      });
      senderScore += 30;
    }

    // Check DMARC
    if (headersLower.includes('dmarc=pass')) {
      indicators.push({
        id: 'AUTH_DMARC_PASS',
        title: 'DMARC Alignment: PASS',
        description: 'Email passes domain owner policy alignment.',
        severity: 'INFO',
        source: 'OBSERVED_FACT',
        observedValue: 'dmarc=pass',
        whyItMatters: 'Confirms both SPF/DKIM and From-header alignment.'
      });
    } else if (headersLower.includes('dmarc=fail')) {
      indicators.push({
        id: 'AUTH_DMARC_FAIL',
        title: 'DMARC Alignment: FAIL',
        description: 'Email failed domain alignment policy.',
        severity: 'CRITICAL',
        source: 'OBSERVED_FACT',
        observedValue: 'dmarc=fail',
        whyItMatters: 'Domain owner policy actively rejected or quarantined this email.'
      });
      senderScore += 45;
    }
  } else {
    limitations.push('Raw email headers were not provided: SPF, DKIM, and DMARC cryptographic authentication could not be validated.');
  }

  // 5. Link Risk
  if (Array.isArray(links) && links.length > 0) {
    for (const link of links) {
      if (/xyz|top|click|club|link|\.exe|\.scr|login|verify/i.test(link)) {
        linkScore += 30;
        indicators.push({
          id: 'EMAIL_SUSPICIOUS_LINK',
          title: 'Suspicious Hyperlink in Email Body',
          description: `Embedded link points to questionable destination: ${link}`,
          severity: 'HIGH',
          source: 'HEURISTIC_RULE',
          observedValue: link,
          whyItMatters: 'Phishing emails lure recipients to fake landing pages.'
        });
        break;
      }
    }
  }

  // Aggregate overall score
  const totalRuleScore = Math.min(100, senderScore * 0.45 + messageScore * 0.35 + linkScore * 0.20);
  const { riskScore, classification } = calculateOverallRisk({
    ruleScore: totalRuleScore,
    mlProbability: null,
    threatIntelMatched: false,
    indicators
  });

  const threatType = classification === 'HIGH_RISK' ? (senderScore > messageScore ? 'DISPLAY_NAME_SPOOF' : 'BUSINESS_EMAIL_COMPROMISE') : (classification === 'SUSPICIOUS' ? 'SUSPICIOUS_EMAIL' : 'BENIGN_EMAIL');
  const recommendations = generateRecommendations(classification, threatType, indicators);

  return {
    senderRisk: Math.min(100, Math.round(senderScore)),
    messageRisk: Math.min(100, Math.round(messageScore)),
    linkRisk: Math.min(100, Math.round(linkScore)),
    riskScore,
    classification,
    threatType,
    detectionMethod: 'RULE_BASED',
    indicators,
    recommendations,
    limitations,
    engineMetadata: {
      ruleEngineVersion: '1.2.0',
      analysisDurationMs: Date.now() - startTime
    }
  };
}

module.exports = {
  analyzeEmail
};
