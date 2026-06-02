import mongoose from 'mongoose';

// Disable buffering so queries fail immediately if MongoDB is offline instead of hanging indefinitely
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-learning-planner';
    console.log(`Connecting to MongoDB at: ${connUri.replace(/:([^@]+)@/, ':****@')}`); // Hide credentials in logs
    
    // Set a short connection timeout of 3 seconds to fail fast
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Running in Offline Mode: Server will log database actions, but data will not be persisted.');
    console.log('💡 TIP: Set up a free cluster on MongoDB Atlas and plug its MONGO_URI in your backend/.env to persist your study planner!');
  }
};

export default connectDB;
