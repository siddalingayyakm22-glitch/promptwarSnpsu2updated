const mongoose = require('mongoose');

let isConnected = false;
let isInMemoryFallback = false;

// Fallback in-memory database store for local dev when MongoDB is not running
const inMemoryStore = {
  scans: [],
  threatCaches: [],
  feedback: []
};

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cybershield';
  
  try {
    mongoose.set('strictQuery', false);
    // Timeout quickly (2.5s) so local development doesn't hang if no Mongo instance is running
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });
    isConnected = true;
    isInMemoryFallback = false;
    console.log(`[Database] Connected successfully to MongoDB: ${mongoUri}`);
  } catch (err) {
    isConnected = false;
    isInMemoryFallback = true;
    console.warn(`[Database] MongoDB not reachable (${err.message}). Activating zero-dependency in-memory persistent store for seamless local execution.`);
  }
}

function getDbStatus() {
  return {
    connected: isConnected,
    mode: isInMemoryFallback ? 'IN_MEMORY_FALLBACK' : (isConnected ? 'MONGODB_CONNECTED' : 'DISCONNECTED'),
    recordsCount: isInMemoryFallback ? inMemoryStore.scans.length : null
  };
}

module.exports = {
  connectDB,
  getDbStatus,
  inMemoryStore,
  get isConnected() { return isConnected; },
  get isInMemoryFallback() { return isInMemoryFallback; }
};
