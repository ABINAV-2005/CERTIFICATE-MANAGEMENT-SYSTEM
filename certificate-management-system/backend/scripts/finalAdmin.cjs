const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserImport = require('../models/User.js');
const User = UserImport.default || UserImport;

dotenv.config();
const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI || 'mongodb://127.0.0.1:27017/certdb';

const seedRealisticAdmin = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to database...');

    await User.deleteOne({ email: 'master@certify.com' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('master123', salt);

    const masterAdmin = new User({
      name: 'System Director',
      email: 'master@certify.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await masterAdmin.save();
    console.log('NEW ADMIN CREATED: master@certify.com / master123');
    process.exit();
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedRealisticAdmin();

