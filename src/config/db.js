import mongoose from 'mongoose';

let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in the .env file.");
  }

  try {
    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    const conn = await connectionPromise;
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    isConnected = false;
    connectionPromise = null;
    return null;
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  host: mongoose.connection.host || null,
});

export default connectDB;