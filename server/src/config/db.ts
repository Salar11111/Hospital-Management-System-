import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};