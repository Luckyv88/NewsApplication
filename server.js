require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Import routes
const authRoutes = require('./routes/auth.routes');
const newsRoutes = require('./routes/news.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Serve React frontend (make sure frontendd/build exists)
// This must come *before* the catch-all route
app.use(express.static(path.join(__dirname, 'frontendd/build')));

// Catch-all route to serve index.html for React routing
// FIX: Change '/*' to '*' to resolve the PathError.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontendd/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));