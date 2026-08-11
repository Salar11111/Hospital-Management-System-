import mongoose from 'mongoose';
import { env } from './env.js';
const connectDB = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
};
const disconnectDB = async () => {
  await mongoose.disconnect();
};
export { connectDB, disconnectDB };
