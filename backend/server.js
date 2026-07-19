import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import mockTestRoutes from './routes/mockTestRoutes.js';

// Load environment configurations
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL, // e.g. https://smart-learning-planner-nu.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/gamification', gamificationRoutes);
// app.use('/api/mock-test', mockTestRoutes); // AI-powered mock test generation temporarily disabled
app.use('/api/mock-test', mockTestRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Smart Learning Planner API!',
    version: '1.0.0',
    status: 'Server is active'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
  console.log(`Test endpoint active at http://localhost:${PORT}/`);
});
