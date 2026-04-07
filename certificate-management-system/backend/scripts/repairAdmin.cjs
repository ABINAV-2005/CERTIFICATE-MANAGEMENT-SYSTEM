const dotenv = require('dotenv');
const mongoose = require('mongoose');
const UserImport = require('../models/User.js');
const User = UserImport.default || UserImport;

dotenv.config();
const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI || 'mongodb://127.0.0.1:27017/certdb';

const repair = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    await User.deleteMany({ email: 'admin@cert.com' });

    const cleanAdmin = new User({
      name: 'System Administrator',
      email: 'admin@cert.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    await cleanAdmin.save();
    console.log('SUCCESS: Admin repaired! Login: admin@cert.com / admin123');
    process.exit();
  } catch (err) {
    console.error('Repair failed:', err);
    process.exit(1);
  }
};

repair();

