/**
 * AI Service Connector
 * Communicates with the FastAPI Machine Learning microservice.
 * Implements strict timeouts and zero-downtime graceful fallback when offline.
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const TIMEOUT_MS = 3000;

async function checkAIHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const res = await fetch(`${AI_SERVICE_URL}/health/ready`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (res.ok) {
      const data = await res.json();
      return { online: true, ...data };
    }
    return { online: false, error: `HTTP ${res.status}` };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

async function predictURL(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${AI_SERVICE_URL}/api/predict/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      return json;
    }
    return {
      available: false,
      probability: null,
      confidence: null,
      note: `AI Service responded with HTTP ${res.status}`
    };
  } catch (err) {
    return {
      available: false,
      probability: null,
      confidence: null,
      note: 'Rule-based analysis is active. Machine-learning predictions are currently unavailable.'
    };
  }
}

async function predictMessage(message) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${AI_SERVICE_URL}/api/predict/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      return json;
    }
    return {
      available: false,
      probability: null,
      confidence: null,
      note: `AI Service responded with HTTP ${res.status}`
    };
  } catch (err) {
    return {
      available: false,
      probability: null,
      confidence: null,
      note: 'Rule-based analysis is active. Machine-learning predictions are currently unavailable.'
    };
  }
}

module.exports = {
  checkAIHealth,
  predictURL,
  predictMessage
};
