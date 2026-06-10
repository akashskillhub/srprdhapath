const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(express.json({ limit: '1100mb' }));
app.use(express.urlencoded({ limit: '1100mb', extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
  frameguard: false,
}));
app.use('/uploads', express.static('uploads'));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spardhapath';

const pyqHubController = require('./features/pyqhub/pyqhub.controller');

// Cache MongoDB connection for Vercel serverless
let cachedDb = null;
async function connectToMongo() {
  if (cachedDb) return cachedDb;
  const db = await mongoose.connect(MONGO_URI);
  cachedDb = db;
  console.log('Connected to MongoDB: SpardhaPath Database');
  await pyqHubController.initRootCategories();
  return db;
}

// Routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/admin', require('./routes/admin.route'));
app.use('/api/folders', require('./routes/folder.route'));
app.use('/api/pyqhub', require('./features/pyqhub/pyqhub.route'));
app.use('/api/practice-questions', require('./routes/practice.route'));
app.use('/api/questions', require('./routes/questions.route'));
app.use('/api/student', require('./routes/student.route'));
app.use('/api/short-tricks', require('./routes/shortTrick.route'));
app.use('/api/materials', require('./routes/material.route'));
app.use('/api/tests', require('./routes/test.route'));
app.use('/api/contacts', require('./routes/contact.route'));

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Spardhapath Education API is running...');
});

// Only run the server locally — Vercel handles this as a serverless function
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;

  connectToMongo().catch((err) => console.error('Could not connect to MongoDB:', err));

  const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });

  server.timeout = 10 * 60 * 1000;
  server.keepAliveTimeout = 10 * 60 * 1000;
  server.headersTimeout = 11 * 60 * 1000;
}

// Export for Vercel serverless
module.exports = async (req, res) => {
  await connectToMongo();
  return app(req, res);
};

