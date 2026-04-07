const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserImport = require('../models/User.js');
const User = UserImport.default || UserImport;

dotenv.config();
const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI || 'mongodb://127.0.0.1:27017/certdb';

const seedAdmin = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    await User.deleteMany({ email: 'admin@cert.com' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@cert.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created! Login: admin@cert.com / admin123');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();

