const crypto = require('crypto');
const { z } = require('zod');
const { analyzeURL } = require('../services/urlAnalysisService');
const { analyzeMessage } = require('../services/messageAnalysisService');
const { analyzeEmail } = require('../services/emailAnalysisService');
const { analyzeQRCode } = require('../services/qrAnalysisService');
const { analyzeAttachment } = require('../services/attachmentAnalysisService');
const { handleChatQuery } = require('../services/copilotService');
const { ScanRepository } = require('../models/Scan');

// Validation schemas
const urlSchema = z.object({
  url: z.string().min(1, 'URL is required').max(2048, 'URL exceeds maximum length')
});

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(10000, 'Message exceeds maximum length')
});

const emailSchema = z.object({
  sender: z.string().optional().default(''),
  displayName: z.string().optional().default(''),
  replyTo: z.string().optional().default(''),
  subject: z.string().optional().default(''),
  body: z.string().optional().default(''),
  links: z.array(z.string()).optional().default([]),
  rawHeaders: z.string().optional().default('')
});

const qrSchema = z.object({
  rawText: z.string().optional(),
  base64Image: z.string().optional()
}).refine(data => data.rawText || data.base64Image, {
  message: 'Either rawText or base64Image must be supplied'
});

const attachmentSchema = z.object({
  filename: z.string().min(1, 'Filename is required').max(255),
  mimeType: z.string().optional().default(''),
  fileSize: z.number().optional().default(0),
  fileHash: z.string().optional().nullable()
});

const chatSchema = z.object({
  message: z.string().min(1, 'Chat prompt is required').max(4000)
});

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

async function analyzeURLHandler(req, res, next) {
  try {
    const validated = urlSchema.parse(req.body);
    const result = await analyzeURL(validated.url);

    // Save privacy-safe scan record
    const scanRecord = await ScanRepository.create({
      scanType: 'URL',
      inputHash: sha256(validated.url),
      redactedInput: result.hostname || validated.url.substring(0, 50),
      riskScore: result.riskScore,
      classification: result.classification,
      threatType: result.threatType,
      modelProbability: result.modelProbability,
      confidence: result.confidence,
      detectionMethod: result.detectionMethod,
      indicators: result.indicators,
      recommendations: result.recommendations,
      limitations: result.limitations,
      engineMetadata: result.engineMetadata
    });

    res.status(200).json({
      success: true,
      data: {
        scanId: scanRecord.scanId,
        ...result,
        createdAt: scanRecord.createdAt
      },
      error: null
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: err.errors[0].message });
    }
    next(err);
  }
}

async function analyzeMessageHandler(req, res, next) {
  try {
    const validated = messageSchema.parse(req.body);
    const result = await analyzeMessage(validated.message);

    const scanRecord = await ScanRepository.create({
      scanType: 'MESSAGE',
      inputHash: sha256(validated.message),
      redactedInput: result.redactedInput,
      riskScore: result.riskScore,
      classification: result.classification,
      threatType: result.threatType,
      modelProbability: result.modelProbability,
      confidence: result.confidence,
      detectionMethod: result.detectionMethod,
      indicators: result.indicators,
      recommendations: result.recommendations,
      limitations: result.limitations,
      engineMetadata: result.engineMetadata
    });

    res.status(200).json({
      success: true,
      data: {
        scanId: scanRecord.scanId,
        ...result,
        createdAt: scanRecord.createdAt
      },
      error: null
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: err.errors[0].message });
    }
    next(err);
  }
}

async function analyzeEmailHandler(req, res, next) {
  try {
    const validated = emailSchema.parse(req.body);
    const result = analyzeEmail(validated);

    const redactedDisplay = validated.subject || validated.sender || 'Email Investigation';
    const scanRecord = await ScanRepository.create({
      scanType: 'EMAIL',
      inputHash: sha256(`${validated.sender}:${validated.subject}:${validated.body}`),
      redactedInput: redactedDisplay.substring(0, 80),
      riskScore: result.riskScore,
      classification: result.classification,
      threatType: result.threatType,
      modelProbability: null,
      confidence: null,
      detectionMethod: result.detectionMethod,
      indicators: result.indicators,
      recommendations: result.recommendations,
      limitations: result.limitations,
      engineMetadata: result.engineMetadata
    });

    res.status(200).json({
      success: true,
      data: {
        scanId: scanRecord.scanId,
        ...result,
        createdAt: scanRecord.createdAt
      },
      error: null
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: err.errors[0].message });
    }
    next(err);
  }
}

async function analyzeQRHandler(req, res, next) {
  try {
    const validated = qrSchema.parse(req.body);
    const result = await analyzeQRCode(validated);

    const scanRecord = await ScanRepository.create({
      scanType: 'QR',
      inputHash: sha256(result.decodedPayload),
      redactedInput: result.decodedPayload.substring(0, 60),
      riskScore: result.riskScore,
      classification: result.classification,
      threatType: result.threatType,
      modelProbability: result.urlAnalysis ? result.urlAnalysis.modelProbability : null,
      confidence: result.urlAnalysis ? result.urlAnalysis.confidence : null,
      detectionMethod: result.urlAnalysis ? result.urlAnalysis.detectionMethod : 'RULE_BASED',
      indicators: result.indicators,
      recommendations: result.recommendations,
      limitations: result.limitations,
      engineMetadata: result.engineMetadata
    });

    res.status(200).json({
      success: true,
      data: {
        scanId: scanRecord.scanId,
        ...result,
        createdAt: scanRecord.createdAt
      },
      error: null
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: err.errors[0].message });
    }
    res.status(400).json({ success: false, data: null, error: err.message });
  }
}

async function analyzeAttachmentHandler(req, res, next) {
  try {
    const validated = attachmentSchema.parse(req.body);
    const result = analyzeAttachment(validated);

    const scanRecord = await ScanRepository.create({
      scanType: 'ATTACHMENT',
      inputHash: sha256(validated.filename + (validated.fileHash || '')),
      redactedInput: validated.filename,
      riskScore: result.riskScore,
      classification: result.classification,
      threatType: result.threatType,
      modelProbability: null,
      confidence: null,
      detectionMethod: result.detectionMethod,
      indicators: result.indicators,
      recommendations: result.recommendations,
      limitations: result.limitations,
      engineMetadata: result.engineMetadata
    });

    res.status(200).json({
      success: true,
      data: {
        scanId: scanRecord.scanId,
        ...result,
        createdAt: scanRecord.createdAt
      },
      error: null
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: err.errors[0].message });
    }
    next(err);
  }
}

async function chatHandler(req, res, next) {
  try {
    const validated = chatSchema.parse(req.body);
    const result = await handleChatQuery({ message: validated.message });

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        source: result.source,
        timestamp: new Date().toISOString()
      },
      error: null
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, data: null, error: err.errors[0].message });
    }
    next(err);
  }
}

module.exports = {
  analyzeURLHandler,
  analyzeMessageHandler,
  analyzeEmailHandler,
  analyzeQRHandler,
  analyzeAttachmentHandler,
  chatHandler
};
