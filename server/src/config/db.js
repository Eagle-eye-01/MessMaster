const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = { connectDB };
