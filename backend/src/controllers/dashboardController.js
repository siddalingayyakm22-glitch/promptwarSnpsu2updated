const { ScanRepository } = require('../models/Scan');
const { checkAIHealth } = require('../services/aiServiceConnector');
const { getThreatFeedOverview } = require('../services/threatIntelService');
const { getDbStatus } = require('../models/db');

async function getDashboardHandler(req, res, next) {
  try {
    const scans = await ScanRepository.find({}, { limit: 500 });
    const aiStatus = await checkAIHealth();
    const threatFeed = getThreatFeedOverview();
    const dbStatus = getDbStatus();

    const totalScans = scans.length;
    let safeCount = 0;
    let suspiciousCount = 0;
    let highRiskCount = 0;
    let totalRiskSum = 0;
    const threatCounts = {};
    const methodCounts = {};

    for (const s of scans) {
      if (s.classification === 'SAFE') safeCount++;
      else if (s.classification === 'SUSPICIOUS') suspiciousCount++;
      else if (s.classification === 'HIGH_RISK') highRiskCount++;

      totalRiskSum += (s.riskScore || 0);

      const tt = s.threatType || 'UNKNOWN';
      threatCounts[tt] = (threatCounts[tt] || 0) + 1;

      const dm = s.detectionMethod || 'RULE_BASED';
      methodCounts[dm] = (methodCounts[dm] || 0) + 1;
    }

    const averageRiskScore = totalScans > 0 ? Math.round(totalRiskSum / totalScans) : 0;

    // Top threat categories
    const topThreats = Object.entries(threatCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent 5 scans
    const recentScans = scans.slice(0, 5).map(s => ({
      scanId: s.scanId,
      scanType: s.scanType,
      target: s.redactedInput,
      riskScore: s.riskScore,
      classification: s.classification,
      threatType: s.threatType,
      detectionMethod: s.detectionMethod,
      createdAt: s.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalScans,
          safeCount,
          suspiciousCount,
          highRiskCount,
          averageRiskScore,
          threatsDetected: suspiciousCount + highRiskCount
        },
        topThreats,
        detectionMethods: methodCounts,
        recentScans,
        systemHealth: {
          database: dbStatus,
          aiService: aiStatus,
          threatIntelligence: threatFeed
        }
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function getAnalyticsHandler(req, res, next) {
  try {
    const scans = await ScanRepository.find({}, { limit: 500 });

    // Group by scan type
    const byType = { URL: 0, MESSAGE: 0, EMAIL: 0, QR: 0, ATTACHMENT: 0 };
    // Risk score buckets
    const riskBuckets = [
      { band: '0-30 (Safe)', count: 0, color: '#10b981' },
      { band: '31-60 (Suspicious)', count: 0, color: '#f59e0b' },
      { band: '61-100 (High Risk)', count: 0, color: '#ef4444' }
    ];

    // Indicator frequency map
    const indicatorFrequency = {};

    for (const s of scans) {
      if (byType[s.scanType] !== undefined) {
        byType[s.scanType]++;
      }
      if (s.riskScore <= 30) riskBuckets[0].count++;
      else if (s.riskScore <= 60) riskBuckets[1].count++;
      else riskBuckets[2].count++;

      for (const ind of (s.indicators || [])) {
        indicatorFrequency[ind.title] = (indicatorFrequency[ind.title] || 0) + 1;
      }
    }

    const topIndicators = Object.entries(indicatorFrequency)
      .map(([indicator, count]) => ({ indicator, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.status(200).json({
      success: true,
      data: {
        totalRecords: scans.length,
        scansByType: Object.entries(byType).map(([type, count]) => ({ type, count })),
        riskDistribution: riskBuckets,
        topObservedIndicators: topIndicators
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardHandler,
  getAnalyticsHandler
};
