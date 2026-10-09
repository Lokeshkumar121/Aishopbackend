require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const voiceRoutes = require('./routes/voice.routes');
const udhaarRoutes = require('./routes/udhaar.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

// Uploads folder banao
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ============ CORS CONFIG ============
app.use(
  cors({
    origin: function (origin, callback) {
      // Mobile apps se origin nahi hota — allow
      if (!origin) return callback(null, true);

      // Localhost, LAN IP, Expo sab allow (dev ke liye)
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.startsWith('exp://') ||
        origin.startsWith('exps://')
      ) {
        return callback(null, true);
      }

      console.log('⚠️  Unknown origin:', origin);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

// NOTE: app.options('*', cors()) — Express v5 mein kaam nahi karta
// Upar wala app.use(cors(...)) khud OPTIONS handle kar leta hai

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, {
    origin: req.headers.origin || 'no-origin',
    contentType: req.headers['content-type'] || 'none',
  });
  next();
});

// ============ ROUTES ============
app.use('/api/voice', voiceRoutes);
app.use('/api/udhaar', udhaarRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'Mummy AI Shop Backend chal raha hai 🚀',
    port: process.env.PORT || 5000,
    time: new Date().toISOString(),
  });
});

// 404 handler — Express v5 syntax
app.use((req, res) => {
  res.status(404).json({ error: 'Route nahi mila', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// ============ START ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔓 CORS: localhost, LAN, Expo sab allowed\n`);
});