const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const storyRoutes = require('./routes/stories');

dotenv.config();

const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', storyRoutes);

module.exports = app; // Export for Vercel