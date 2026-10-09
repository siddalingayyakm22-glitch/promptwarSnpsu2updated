const { ScanRepository } = require('../models/Scan');

async function getHistoryHandler(req, res, next) {
  try {
    const { scanType, classification, threatType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (scanType) query.scanType = scanType;
    if (classification) query.classification = classification;
    if (threatType) query.threatType = threatType;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const items = await ScanRepository.find(query, { skip, limit: limitNum });
    const totalCount = await ScanRepository.count(query);

    res.status(200).json({
      success: true,
      data: {
        scans: items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum) || 1
        }
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function getHistoryByIdHandler(req, res, next) {
  try {
    const { id } = req.params;
    const item = await ScanRepository.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, data: null, error: 'Scan record not found' });
    }
    res.status(200).json({ success: true, data: item, error: null });
  } catch (err) {
    next(err);
  }
}

async function deleteHistoryByIdHandler(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await ScanRepository.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ success: false, data: null, error: 'Scan record not found or already removed' });
    }
    res.status(200).json({ success: true, data: { message: `Scan ${id} deleted successfully` }, error: null });
  } catch (err) {
    next(err);
  }
}

async function clearAllHistoryHandler(req, res, next) {
  try {
    await ScanRepository.deleteAll();
    res.status(200).json({ success: true, data: { message: 'All scan history and local caches permanently cleared' }, error: null });
  } catch (err) {
    next(err);
  }
}

async function exportReportHandler(req, res, next) {
  try {
    const { scanId } = req.body;
    let scan;
    if (scanId) {
      scan = await ScanRepository.findById(scanId);
    }
    if (!scan) {
      const scans = await ScanRepository.find({}, { limit: 1 });
      scan = scans[0];
    }

    if (!scan) {
      return res.status(400).json({ success: false, data: null, error: 'No scan record available to generate report' });
    }

    const reportMarkdown = `# CYBERSHIELD AI - INCIDENT INVESTIGATION REPORT
**Reference ID:** ${scan.scanId}
**Date:** ${new Date(scan.createdAt).toUTCString()}
**Scan Type:** ${scan.scanType}
**Target (Redacted):** ${scan.redactedInput}
**Overall Risk Assessment:** ${scan.classification} (${scan.riskScore}/100)
**Identified Threat Category:** ${scan.threatType}
**Detection Engine:** ${scan.detectionMethod}

---
### 🔍 Observed Evidence & Indicators:
${(scan.indicators || []).map(ind => `- [${ind.severity}] **${ind.title}**: ${ind.description} (*Why it matters: ${ind.whyItMatters}*)`).join('\n')}

---
### 🛡️ Recommended Mitigation Steps:
${(scan.recommendations || []).map(rec => `- ${rec}`).join('\n')}

---
### ⚠️ Analysis Limitations & Disclaimers:
${(scan.limitations || []).map(lim => `- ${lim}`).join('\n')}
- CyberShield AI is a cybersecurity decision-support tool. Confidential user credentials were not transmitted or logged.
`;

    res.status(200).json({
      success: true,
      data: {
        reportId: `REP-${scan.scanId}`,
        markdown: reportMarkdown,
        exportedAt: new Date().toISOString()
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHistoryHandler,
  getHistoryByIdHandler,
  deleteHistoryByIdHandler,
  clearAllHistoryHandler,
  exportReportHandler
};
