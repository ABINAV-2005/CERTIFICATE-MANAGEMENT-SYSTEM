import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);

    const user = await User.findOne();
    if (!user) {
      console.log('Register a user in the app first!');
      process.exit();
    }

    await Certificate.deleteMany({});

    const demoCerts = [
      {
        certificateId: 'OSHA-30-2024',
        recipientName: 'Sarah Jenkins',
        courseName: 'OSHA 30-Hour Construction',
        fromDate: new Date('2023-02-03'),
        toDate: new Date('2024-02-03'),
        status: 'approved',
        userId: user._id
      },
      {
        certificateId: 'FA-CPR-2026',
        recipientName: 'Sarah Jenkins',
        courseName: 'First Aid & CPR',
        fromDate: new Date('2024-03-03'),
        toDate: new Date('2026-03-03'),
        status: 'approved',
        userId: user._id
      },
      {
        certificateId: 'AWS-SEC-2027',
        recipientName: 'Michael Chen',
        courseName: 'AWS Security Specialist',
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2027-01-01'),
        status: 'approved',
        userId: user._id
      }
    ];

    await Certificate.insertMany(demoCerts);
    console.log('Successfully added demo data!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
