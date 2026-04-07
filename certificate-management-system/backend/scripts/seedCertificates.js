import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI);
    console.log('Connected to MongoDB for seeding...');

    const user = await User.findOne();

    if (!user) {
      console.error('No users found. Please register an account first.');
      process.exit(1);
    }

    await Certificate.deleteMany({});

    const certificates = [
      {
        certificateId: 'CERT-2026-001',
        recipientName: 'John Doe',
        courseName: 'Full Stack Development',
        fromDate: new Date('2026-01-01'),
        toDate: new Date('2026-06-01'),
        status: 'pending',
        userId: user._id
      },
      {
        certificateId: 'CERT-2026-002',
        recipientName: 'Jane Smith',
        courseName: 'UI/UX Design Masterclass',
        fromDate: new Date('2026-02-15'),
        toDate: new Date('2026-05-15'),
        status: 'pending',
        userId: user._id
      },
      {
        certificateId: 'CERT-2026-003',
        recipientName: 'Abinav S',
        courseName: 'Cloud Computing Expert',
        fromDate: new Date('2026-01-10'),
        toDate: new Date('2026-04-10'),
        status: 'pending',
        userId: user._id
      }
    ];

    await Certificate.insertMany(certificates);
    console.log('SUCCESS: 3 Certificates Added');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
