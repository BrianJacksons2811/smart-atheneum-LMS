const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Debug: Check if .env is loading
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Safety check for MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Mask password in logs for security
const maskedURI = process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@');
console.log('MongoDB Connection:', maskedURI);

// Enhanced MongoDB connection with better error handling
const connectWithRetry = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // Start the server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('🔍 Error details:');
    
    // Specific error handling
    if (error.name === 'MongoNetworkError') {
      console.log('- Network error: Check your internet connection and IP whitelisting');
      console.log('- Your IP in MongoDB Atlas should be: 41.145.197.62/32');
    } else if (error.name === 'MongoServerError') {
      console.log('- Authentication error: Check username and password');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.log('- Server selection error: Cluster might be down or inaccessible');
    }
    
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Start the connection process
connectWithRetry();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Error handlers
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});