const express = require('express');
const router = express.Router();

const {
  analyzeURLHandler,
  analyzeMessageHandler,
  analyzeEmailHandler,
  analyzeQRHandler,
  analyzeAttachmentHandler,
  chatHandler
} = require('../controllers/analysisController');

const {
  getHistoryHandler,
  getHistoryByIdHandler,
  deleteHistoryByIdHandler,
  clearAllHistoryHandler,
  exportReportHandler
} = require('../controllers/historyController');

const {
  getDashboardHandler,
  getAnalyticsHandler
} = require('../controllers/dashboardController');

const {
  getEducationHandler,
  getQuizHandler,
  submitQuizHandler
} = require('../controllers/educationController');

const { checkAIHealth } = require('../services/aiServiceConnector');
const { getThreatFeedOverview } = require('../services/threatIntelService');
const { getDbStatus } = require('../models/db');

// Health & Readiness checks
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'cybershield-backend', timestamp: new Date().toISOString() });
});

router.get('/health/ready', async (req, res) => {
  const dbStatus = getDbStatus();
  const aiStatus = await checkAIHealth();
  res.status(200).json({
    status: 'ready',
    database: dbStatus,
    aiService: aiStatus
  });
});

// Threat Intelligence feed
router.get('/threats', (req, res) => {
  const intel = getThreatFeedOverview();
  res.status(200).json({ success: true, data: intel, error: null });
});

// Models status
router.get('/models/status', async (req, res) => {
  const aiHealth = await checkAIHealth();
  res.status(200).json({ success: true, data: aiHealth, error: null });
});

// Privacy settings info
router.get('/settings/privacy', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      zeroLogPolicy: 'Raw passwords, OTPs, credit cards and private tokens are never stored.',
      inputHashing: 'Inputs are hashed using SHA-256 for duplicate lookup; displayed targets are redacted.',
      guestMode: true,
      retentionPolicy: 'Local in-memory / configured MongoDB retention.',
      dataCollectionDisclosed: 'No third-party trackers or telemetry.'
    },
    error: null
  });
});

// Core Analysis Endpoints
router.post('/analyze/url', analyzeURLHandler);
router.post('/analyze/message', analyzeMessageHandler);
router.post('/analyze/email', analyzeEmailHandler);
router.post('/analyze/qr', analyzeQRHandler);
router.post('/analyze/attachment', analyzeAttachmentHandler);

// AI Copilot
router.post('/chat', chatHandler);

// Scan History & Reports
router.get('/history', getHistoryHandler);
router.get('/history/:id', getHistoryByIdHandler);
router.delete('/history/:id', deleteHistoryByIdHandler);
router.delete('/history', clearAllHistoryHandler);
router.post('/reports/export', exportReportHandler);

// Dashboard & Analytics
router.get('/dashboard', getDashboardHandler);
router.get('/analytics', getAnalyticsHandler);

// Education & Quizzes
router.get('/education', getEducationHandler);
router.get('/education/quiz', getQuizHandler);
router.post('/education/quiz', submitQuizHandler);

module.exports = router;
