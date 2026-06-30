const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// ============================================
// CORS CONFIGURATION FOR AZURE
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000',
  'https://parkin-web.azurewebsites.net',
  'https://parkin-api.azurewebsites.net'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// MONGODB CONNECTION (Azure Cosmos DB)
// ============================================
mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGODB_URI, {
  retryWrites: false,
  maxIdleTimeMS: 120000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
})
.then(() => console.log('✅ Connected to Azure Cosmos DB (MongoDB API)'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// ============================================
// IMPORT ROUTES
// ============================================
const authRoutes = require('./routes/auth');
const spotRoutes = require('./routes/spots');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// ============================================
// ROOT API ROUTE
// ============================================
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🚗 ParkIn API is running on Azure!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        update: 'PUT /api/auth/update'
      },
      spots: {
        all: 'GET /api/spots',
        byCity: 'GET /api/spots/city/:city',
        free: 'GET /api/spots/free',
        single: 'GET /api/spots/:id',
        create: 'POST /api/spots (Council/Admin)',
        update: 'PUT /api/spots/:id (Council/Admin)',
        availability: 'PATCH /api/spots/:id/availability (Council/Admin)',
        delete: 'DELETE /api/spots/:id (Admin)'
      },
      bookings: {
        all: 'GET /api/bookings',
        single: 'GET /api/bookings/:id',
        create: 'POST /api/bookings',
        status: 'PATCH /api/bookings/:id/status',
        payment: 'PATCH /api/bookings/:id/payment',
        delete: 'DELETE /api/bookings/:id (Admin)'
      },
      users: {
        all: 'GET /api/users (Admin)',
        single: 'GET /api/users/:id (Admin)',
        updateRole: 'PUT /api/users/:id/role (Admin)',
        toggle: 'PUT /api/users/:id/toggle (Admin)'
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard',
        users: 'GET /api/admin/users',
        updateRole: 'PUT /api/admin/users/:id/role',
        toggle: 'PUT /api/admin/users/:id/toggle'
      }
    }
  });
});

// ============================================
// ROOT ROUTE
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚗 ParkIn API is running on Azure! Visit /api for endpoints',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// HEALTH CHECK (for Azure App Service)
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API docs: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});