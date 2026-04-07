import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI;

  if (!mongoUri) {
    throw new Error('Missing MongoDB connection string. Set MONGODB_URI or MONGODB_ATLAS_URI.');
  }

  await mongoose.connect(mongoUri);
  return mongoose.connection;
};
