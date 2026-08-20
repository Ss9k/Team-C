require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/database/db'); // Ensures DB initializes
const { seedAdmin } = require('./src/database/seed');

const authRoutes = require('./src/routes/auth');
const aiRoutes = require('./src/routes/ai');
const ticketRoutes = require('./src/routes/tickets');
const adminUserRoutes = require('./src/routes/adminUsers');
const adminManagementRoutes = require('./src/routes/adminManagement');

const app = express();

// Middleware
// Allow any localhost origin (handles port 3000, 5173, etc.)
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Seed admin user on startup
seedAdmin();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/admins', adminManagementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SAMS API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
