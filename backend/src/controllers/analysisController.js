const crypto = require('crypto');
const { z } = require('zod');
const { LIMITS } = require('../config/constants');
const { analyzeURL } = require('../services/urlAnalysisService');
const { analyzeMessage } = require('../services/messageAnalysisService');
const { analyzeEmail } = require('../services/emailAnalysisService');
const { analyzeQRCode } = require('../services/qrAnalysisService');
const { analyzeAttachment } = require('../services/attachmentAnalysisService');
const { handleChatQuery } = require('../services/copilotService');
const { ScanRepository } = require('../models/Scan');

// Validation schemas with centralized limits
const urlSchema = z.object({
  url: z.string().trim().min(1, 'URL cannot be empty').max(LIMITS.MAX_URL_LENGTH, 'URL exceeds maximum length')
});

const messageSchema = z.object({
  message: z.string().trim().min(1, 'Message content cannot be empty').max(LIMITS.MAX_MESSAGE_LENGTH, 'Message exceeds maximum length')
});

const emailSchema = z.object({
  sender: z.string().trim().max(320).optional().default(''),
  displayName: z.string().trim().max(255).optional().default(''),
  replyTo: z.string().trim().max(320).optional().default(''),
  subject: z.string().trim().max(500).optional().default(''),
  body: z.string().max(LIMITS.MAX_EMAIL_BODY_LENGTH).optional().default(''),
  links: z.array(z.string().max(LIMITS.MAX_URL_LENGTH)).optional().default([]),
  rawHeaders: z.string().max(10000).optional().default('')
}).refine(data => data.sender || data.subject || data.body, {
  message: 'At least sender, subject, or email body must be provided'
});

const qrSchema = z.object({
  rawText: z.string().trim().max(LIMITS.MAX_URL_LENGTH).optional(),
  base64Image: z.string().max(LIMITS.MAX_QR_IMAGE_BYTES * 2).optional()
}).refine(data => data.rawText || data.base64Image, {
  message: 'Either rawText or base64Image must be supplied'
});

const attachmentSchema = z.object({
  filename: z.string().trim().min(1, 'Filename is required').max(LIMITS.MAX_ATTACHMENT_FILENAME_LENGTH),
  mimeType: z.string().trim().max(100).optional().default(''),
  fileSize: z.number().nonnegative().max(LIMITS.MAX_ATTACHMENT_SIZE_BYTES).optional().default(0),
  fileHash: z.string().trim().max(128).optional().nullable()
});

const chatSchema = z.object({
  message: z.string().trim().min(1, 'Chat prompt cannot be empty').max(LIMITS.MAX_CHAT_PROMPT_LENGTH, 'Prompt exceeds maximum length')
});

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function handleValidationError(err, res) {
  const firstError = err.errors && err.errors[0] ? err.errors[0].message : 'Validation failed';
  return res.status(400).json({
    success: false,
    data: null,
    error: {
      code: 'VALIDATION_ERROR',
      message: firstError
    }
  });
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
      return handleValidationError(err, res);
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
      return handleValidationError(err, res);
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
      return handleValidationError(err, res);
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
      return handleValidationError(err, res);
    }
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'QR_DECODING_ERROR', message: err.message }
    });
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
      return handleValidationError(err, res);
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
      return handleValidationError(err, res);
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
