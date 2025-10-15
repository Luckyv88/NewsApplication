require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");

const app = express();

// ----------------------------------------------------
// 🔥 CORS FIX: Explicitly allow the service's own domain
// ----------------------------------------------------

// Define the allowed origins. Since your frontend and backend share the 
// same deployed URL, we allow that URL and the local development URL.
const allowedOrigins = [
    'http://localhost:3000', // For local development
    'https://newsapplication-htnr.onrender.com', // The deployed production URL
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like same-origin or curl) or if the origin is in the allowed list
        if (!origin || allowedOrigins.some(ao => origin.startsWith(ao))) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy does not allow access from ${origin}`));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.use(express.json());
app.use(cors());

// ----------------------------------------------------

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
// This must be the last middleware/route defined
app.use((req, res) => {
 res.sendFile(path.join(__dirname, 'frontendd/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));