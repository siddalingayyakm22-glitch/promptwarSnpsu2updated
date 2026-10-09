require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./models/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Initialize Database (with instant fallback if offline)
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🛡️  CyberShield AI Backend running on port ${PORT}`);
    console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
