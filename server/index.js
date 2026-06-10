require('dotenv').config();
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
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spardhapath';

const pyqHubController = require('./features/pyqhub/pyqhub.controller');

mongoose.connect(MONGO_URI)
  .then(() => {
     console.log('Connected to MongoDB: SpardhaPath Database');
     pyqHubController.initRootCategories();
  })
  .catch((err) => console.error('Could not connect to MongoDB:', err));

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

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Configure server timeouts to support large 1GB PDF uploads (10-11 minutes)
server.timeout = 10 * 60 * 1000;
server.keepAliveTimeout = 10 * 60 * 1000;
server.headersTimeout = 11 * 60 * 1000;

