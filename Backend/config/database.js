const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, 
      maxPoolSize: 10
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;