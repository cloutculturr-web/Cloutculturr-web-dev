// Quick MongoDB connection test
import mongoose from 'mongoose';
import 'dotenv/config';

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI?.replace(/:[^:]*@/, ':****@')); // Hide password

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connected Successfully!');
  await mongoose.connection.close();
  process.exit(0);
} catch (error) {
  console.error('❌ MongoDB Connection Failed:', error.message);
  process.exit(1);
}
