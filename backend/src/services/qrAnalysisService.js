/**
 * QR Code Phishing (Quishing) Analyzer Service
 * Decodes QR code images safely using jsQR and evaluates embedded URLs or payloads.
 */

const jsQR = require('jsqr');
const { PNG } = require('pngjs');
const { analyzeURL } = require('./urlAnalysisService');
const { calculateOverallRisk, generateRecommendations } = require('./riskScoringEngine');

async function decodeQRFromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    new PNG({ filterType: 4 }).parse(buffer, (error, data) => {
      if (error) {
        return reject(new Error('Failed to parse PNG image format. Please ensure image is a valid PNG or use QR text payload mode.'));
      }
      const code = jsQR(new Uint8ClampedArray(data.data), data.width, data.height);
      if (code) {
        resolve(code.data);
      } else {
        reject(new Error('No QR code could be detected in this image. Please ensure the QR code is centered and legible.'));
      }
    });
  });
}

async function analyzeQRCode({ rawText = null, imageBuffer = null, base64Image = null }) {
  const startTime = Date.now();
  let decodedPayload = rawText;

  if (!decodedPayload && base64Image) {
    try {
      const cleanB64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(cleanB64, 'base64');
      decodedPayload = await decodeQRFromBuffer(buf);
    } catch (err) {
      throw new Error(`QR image decoding failed: ${err.message}`);
    }
  } else if (!decodedPayload && imageBuffer) {
    try {
      decodedPayload = await decodeQRFromBuffer(imageBuffer);
    } catch (err) {
      throw new Error(`QR image decoding failed: ${err.message}`);
    }
  }

  if (!decodedPayload || !decodedPayload.trim()) {
    throw new Error('No QR code payload could be extracted or provided.');
  }

  decodedPayload = decodedPayload.trim();

  // Determine payload type
  const isUrl = /^https?:\/\//i.test(decodedPayload) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(decodedPayload);
  const isWifi = decodedPayload.startsWith('WIFI:');
  const isVCard = decodedPayload.includes('BEGIN:VCARD');
  const isUPI = decodedPayload.startsWith('upi://pay');

  let urlAnalysisResult = null;
  const indicators = [];
  let heuristicScore = 0;

  indicators.push({
    id: 'QR_PAYLOAD_EXTRACTED',
    title: `Decoded QR Payload (${isUrl ? 'Web URL' : (isUPI ? 'UPI Payment Intent' : 'Text / Data')})`,
    description: `Decoded string extracted without opening the target: "${decodedPayload.slice(0, 80)}${decodedPayload.length > 80 ? '...' : ''}"`,
    severity: 'INFO',
    source: 'OBSERVED_FACT',
    observedValue: decodedPayload.slice(0, 100),
    whyItMatters: 'QR codes obscure destination URLs until scanned, making visual inspection before scanning impossible.'
  });

  if (isUPI) {
    indicators.push({
      id: 'QR_UPI_PAYMENT',
      title: 'UPI Direct Payment Request Detected',
      description: 'This QR code triggers a direct digital payment request. Scammers place fake QR stickers on store counters or parking meters.',
      severity: 'HIGH',
      source: 'HEURISTIC_RULE',
      observedValue: 'upi://pay',
      whyItMatters: 'Scanning payment QR codes under false pretenses (e.g. "Scan to receive lottery money") will DEBIT your account.'
    });
    heuristicScore += 45;
  }

  if (isUrl) {
    urlAnalysisResult = await analyzeURL(decodedPayload);
    // Inherit URL indicators
    indicators.push(...urlAnalysisResult.indicators);
    heuristicScore = Math.max(heuristicScore, urlAnalysisResult.riskScore);
  }

  const { riskScore, classification } = calculateOverallRisk({
    ruleScore: heuristicScore,
    mlProbability: urlAnalysisResult ? urlAnalysisResult.modelProbability : null,
    threatIntelMatched: urlAnalysisResult ? (urlAnalysisResult.threatIntel && urlAnalysisResult.threatIntel.matched) : false,
    indicators
  });

  const threatType = urlAnalysisResult ? (urlAnalysisResult.classification === 'HIGH_RISK' ? 'QUISHING_MALICIOUS_REDIRECT' : 'QR_CODE_URL') : (isUPI ? 'UPI_PAYMENT_QR' : 'QR_DATA_PAYLOAD');
  const recommendations = generateRecommendations(classification, threatType, indicators);
  recommendations.unshift('Never scan QR codes in public places without verifying physical tampering on the label.');

  return {
    decodedPayload,
    isUrl,
    isUPI,
    riskScore,
    classification,
    threatType,
    urlAnalysis: urlAnalysisResult,
    indicators,
    recommendations,
    limitations: [
      'Image was parsed purely for encoded ASCII / binary strings.',
      'The destination has NOT been visited or loaded in your browser.'
    ],
    engineMetadata: {
      ruleEngineVersion: '1.2.0',
      analysisDurationMs: Date.now() - startTime
    }
  };
}

module.exports = {
  analyzeQRCode
};
