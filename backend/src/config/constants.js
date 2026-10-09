/**
 * Centralized Application Constants & Configuration
 * Prevents magic numbers and standardizes thresholds across services.
 */

module.exports = {
  // Server Limits
  LIMITS: {
    MAX_URL_LENGTH: 2048,
    MAX_MESSAGE_LENGTH: 10000,
    MAX_EMAIL_BODY_LENGTH: 50000,
    MAX_ATTACHMENT_FILENAME_LENGTH: 255,
    MAX_ATTACHMENT_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
    MAX_QR_IMAGE_BYTES: 5 * 1024 * 1024, // 5MB
    MAX_CHAT_PROMPT_LENGTH: 4000,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
    RATE_LIMIT_MAX_REQUESTS: 150
  },

  // Risk Scoring Framework
  RISK_THRESHOLDS: {
    SAFE_MAX: 30,
    SUSPICIOUS_MAX: 60,
    HIGH_RISK_MIN: 61
  },

  // Scoring Weights
  SEVERITY_WEIGHTS: {
    INFO: 0,
    LOW: 10,
    MEDIUM: 25,
    HIGH: 45,
    CRITICAL: 80
  },

  // Timeouts
  TIMEOUTS: {
    AI_SERVICE_MS: 3000,
    THREAT_INTEL_MS: 2000,
    DB_CONNECT_MS: 2500
  },

  // Cache
  CACHE_TTL: {
    THREAT_INTEL_MS: 60 * 60 * 1000 // 1 hour
  },

  // Threat Classifications
  CLASSIFICATIONS: {
    SAFE: 'SAFE',
    SUSPICIOUS: 'SUSPICIOUS',
    HIGH_RISK: 'HIGH_RISK'
  },

  // Detection Methods
  DETECTION_METHODS: {
    MACHINE_LEARNING: 'MACHINE_LEARNING',
    RULE_BASED: 'RULE_BASED',
    HYBRID: 'HYBRID',
    THREAT_INTEL: 'THREAT_INTEL'
  }
};
