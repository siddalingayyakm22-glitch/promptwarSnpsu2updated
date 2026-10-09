const mongoose = require('mongoose');
const crypto = require('crypto');
const { isConnected, inMemoryStore } = require('./db');

const scanSchema = new mongoose.Schema({
  scanId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: () => 'scan_' + crypto.randomBytes(8).toString('hex')
  },
  scanType: {
    type: String,
    enum: ['URL', 'MESSAGE', 'EMAIL', 'QR', 'ATTACHMENT'],
    required: true,
    index: true
  },
  inputHash: {
    type: String,
    required: true,
    index: true
  },
  redactedInput: {
    type: String,
    required: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },
  classification: {
    type: String,
    enum: ['SAFE', 'SUSPICIOUS', 'HIGH_RISK'],
    required: true,
    index: true
  },
  threatType: {
    type: String,
    required: true,
    index: true
  },
  modelProbability: {
    type: Number,
    default: null
  },
  confidence: {
    type: Number,
    default: null
  },
  detectionMethod: {
    type: String,
    enum: ['MACHINE_LEARNING', 'RULE_BASED', 'HYBRID', 'THREAT_INTEL'],
    required: true
  },
  indicators: [{
    id: String,
    title: String,
    description: String,
    severity: {
      type: String,
      enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    source: {
      type: String,
      enum: ['OBSERVED_FACT', 'HEURISTIC_RULE', 'ML_PREDICTION', 'EXTERNAL_INTEL']
    },
    observedValue: String,
    whyItMatters: String,
    confidence: String
  }],
  recommendations: [{
    type: String
  }],
  limitations: [{
    type: String
  }],
  engineMetadata: {
    modelVersion: String,
    ruleEngineVersion: { type: String, default: '1.2.0' },
    analysisDurationMs: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const MongooseScan = mongoose.model('Scan', scanSchema);

// Data Access Layer that seamlessly works with MongoDB or InMemoryStore
class ScanRepository {
  static async create(data) {
    const scanId = data.scanId || ('scan_' + crypto.randomBytes(8).toString('hex'));
    const record = {
      ...data,
      scanId,
      createdAt: data.createdAt || new Date()
    };

    if (isConnected) {
      try {
        const doc = new MongooseScan(record);
        return await doc.save();
      } catch (err) {
        console.warn('MongoDB write failed, writing to fallback memory store:', err.message);
      }
    }

    inMemoryStore.scans.unshift(record);
    return record;
  }

  static async find(query = {}, options = {}) {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    if (isConnected) {
      try {
        let q = MongooseScan.find(query).sort({ createdAt: -1 });
        if (skip) q = q.skip(skip);
        if (limit) q = q.limit(limit);
        return await q.exec();
      } catch (err) {
        console.warn('MongoDB query failed, reading fallback store:', err.message);
      }
    }

    let results = [...inMemoryStore.scans];
    if (query.scanType) {
      results = results.filter(s => s.scanType === query.scanType);
    }
    if (query.classification) {
      results = results.filter(s => s.classification === query.classification);
    }
    if (query.threatType) {
      results = results.filter(s => s.threatType === query.threatType);
    }
    return results.slice(skip, skip + limit);
  }

  static async findById(id) {
    if (isConnected) {
      try {
        const found = await MongooseScan.findOne({ scanId: id });
        if (found) return found;
      } catch (err) {
        console.warn('MongoDB findById failed, falling back:', err.message);
      }
    }
    return inMemoryStore.scans.find(s => s.scanId === id) || null;
  }

  static async deleteById(id) {
    if (isConnected) {
      try {
        const res = await MongooseScan.deleteOne({ scanId: id });
        if (res.deletedCount > 0) return true;
      } catch (err) {
        console.warn('MongoDB delete failed:', err.message);
      }
    }
    const idx = inMemoryStore.scans.findIndex(s => s.scanId === id);
    if (idx !== -1) {
      inMemoryStore.scans.splice(idx, 1);
      return true;
    }
    return false;
  }

  static async deleteAll() {
    if (isConnected) {
      try {
        await MongooseScan.deleteMany({});
      } catch (err) {
        console.warn('MongoDB deleteAll failed:', err.message);
      }
    }
    inMemoryStore.scans = [];
    return true;
  }

  static async count(query = {}) {
    if (isConnected) {
      try {
        return await MongooseScan.countDocuments(query);
      } catch (err) {
        console.warn('MongoDB count failed:', err.message);
      }
    }
    return inMemoryStore.scans.length;
  }
}

module.exports = {
  MongooseScan,
  ScanRepository
};
