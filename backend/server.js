import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import swaggerSpec from './config/swagger.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// ─── Configuration ───
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ───
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Finance Dashboard API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Swagger UI ───
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Finance Dashboard API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
    swaggerOptions: {
      persistAuthorization: true,   // keeps token across page reloads
      displayRequestDuration: true, // shows response time
      filter: true,                 // enables search/filter bar
      tryItOutEnabled: true,        // opens Try-it-out by default
    },
  })
);

// ─── Swagger JSON spec (for external tools like Postman) ───
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── API Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);


// ─── 404 Handler ───
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found. Check the API documentation.',
  });
});

// ─── Global Error Handler ───
app.use(errorHandler);

// ─── Start Server ───
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check:  http://localhost:${PORT}/api/health`);
      console.log(`📚 API Docs (UI): http://localhost:${PORT}/api/docs`);
      console.log(`📄 API Docs (JSON): http://localhost:${PORT}/api/docs.json`);
      console.log(`🌍 Environment:   ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app; // Export for testing