import mongoose from 'mongoose';
import colors from 'colors';
// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(colors.cyan(`✅ MongoDB Connected: ${conn.connection.host}`));
  } catch (error) {
    console.error('❌ Database connection error!');
    console.error(`${error.name}: ${error.message}`);
    process.exit(1);
  }
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB Disconnected!');
  });
};

export default connectDB;
