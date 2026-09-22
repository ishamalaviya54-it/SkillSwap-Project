import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillswap';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // Quick timeout to prevent server hanging if local Mongo service is not yet started
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB (${error.message}). Running server without active database connection.`);
  }
};

