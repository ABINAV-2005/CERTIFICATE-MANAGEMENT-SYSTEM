import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Certificate from '../models/Certificate.js';
import Template from '../models/Template.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

if (fs.existsSync('./.env.local')) {
  dotenv.config({ path: './.env.local' });
  console.log('Seeder: Loaded .env.local (local MongoDB)');
} else {
  dotenv.config();
  console.log('Seeder: Loaded .env (Atlas)');
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to preserve data)
    // await Certificate.deleteMany({});
    // await User.deleteMany({});
    // await Template.deleteMany({});
    // console.log('Cleared existing data');

    // Create Admin User
    const adminExists = await User.findOne({ email: 'admin@cert.com' });
    let adminUser;
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@cert.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created: admin@cert.com / admin123');
    } else {
      adminUser = adminExists;
      console.log('Admin user already exists');
    }

    // Create Verifier User
    const verifierExists = await User.findOne({ email: 'verifier@cert.com' });
    if (!verifierExists) {
      const hashedPassword = await bcrypt.hash('verifier123', 12);
      await User.create({
        name: 'Certificate Verifier',
        email: 'verifier@cert.com',
        password: hashedPassword,
        role: 'verifier',
        isActive: true
      });
      console.log('Verifier user created: verifier@cert.com / verifier123');
    }

    // Create Test User
    const userExists = await User.findOne({ email: 'user@cert.com' });
    let testUser;
    if (!userExists) {
      const hashedPassword = await bcrypt.hash('user123', 12);
      testUser = await User.create({
        name: 'Test Employee',
        email: 'user@cert.com',
        password: hashedPassword,
        role: 'user',
        isActive: true
      });
      console.log('Test user created: user@cert.com / user123');
    } else {
      testUser = userExists;
    }

    // Create Sample Template
    const templateExists = await Template.findOne({ name: 'Default Certificate' });
    let template;
    if (!templateExists) {
      template = await Template.create({
        name: 'Default Certificate',
        description: 'Standard certificate template with elegant design',
        signatureName: 'Certificate Authority',
        signatureTitle: 'Director',
        fields: [
          { fieldName: 'recipientName', fieldLabel: 'Recipient Name', fieldType: 'text', isRequired: true },
          { fieldName: 'courseName', fieldLabel: 'Course Name', fieldType: 'text', isRequired: true },
          { fieldName: 'issueDate', fieldLabel: 'Issue Date', fieldType: 'date', isRequired: true },
          { fieldName: 'fromDate', fieldLabel: 'From Date', fieldType: 'date', isRequired: true },
          { fieldName: 'toDate', fieldLabel: 'To Date', fieldType: 'date', isRequired: true }
        ],
        createdBy: adminUser._id
      });
      console.log('Default template created');
    } else {
      template = templateExists;
    }

    // Create Sample Certificates with required fields
    const certCount = await Certificate.countDocuments();
    if (certCount === 0) {
      const baseId = `CERT-${Date.now()}`;
      const sampleCertificates = [
        {
          certificateId: `${baseId}-001`,
          userId: testUser._id,
          templateId: template._id,
          recipientName: 'John Smith',
          courseName: 'Advanced Web Development',
          issueDate: new Date('2024-01-15'),
          expiryDate: new Date('2025-01-15'),
          fromDate: new Date('2023-10-01'),
          toDate: new Date('2024-01-15'),
          status: 'valid'
        },
        {
          certificateId: `${baseId}-002`,
          userId: testUser._id,
          templateId: template._id,
          recipientName: 'Sarah Johnson',
          courseName: 'Data Science Fundamentals',
          issueDate: new Date('2024-02-20'),
          expiryDate: new Date('2025-02-20'),
          fromDate: new Date('2023-11-01'),
          toDate: new Date('2024-02-20'),
          status: 'pending'
        },
        {
          certificateId: `${baseId}-003`,
          userId: testUser._id,
          templateId: template._id,
          recipientName: 'Michael Brown',
          courseName: 'Cloud Computing Essentials',
          issueDate: new Date('2023-06-10'),
          expiryDate: new Date('2024-06-10'),
          fromDate: new Date('2023-01-01'),
          toDate: new Date('2023-06-10'),
          status: 'expired'
        },
        {
          certificateId: `${baseId}-004`,
          userId: testUser._id,
          templateId: template._id,
          recipientName: 'Emily Davis',
          courseName: 'Machine Learning Basics',
          issueDate: new Date('2023-12-01'),
          fromDate: new Date('2023-09-01'),
          toDate: new Date('2023-12-01'),
          status: 'revoked'
        },
        {
          certificateId: `${baseId}-005`,
          userId: adminUser._id,
          templateId: template._id,
          recipientName: 'David Wilson',
          courseName: 'UI/UX Design Masterclass',
          issueDate: new Date('2024-03-05'),
          expiryDate: new Date('2025-03-05'),
          fromDate: new Date('2024-01-01'),
          toDate: new Date('2024-03-05'),
          status: 'approved'
        },
        {
          certificateId: `${baseId}-006`,
          userId: testUser._id,
          templateId: template._id,
          recipientName: 'Jennifer Martinez',
          courseName: 'Python Programming Advanced',
          issueDate: new Date('2024-04-10'),
          fromDate: new Date('2024-02-01'),
          toDate: new Date('2024-04-10'),
          status: 'valid'
        }
      ];

      await Certificate.insertMany(sampleCertificates);
      console.log(`Created ${sampleCertificates.length} sample certificates with proper fromDate/toDate/status`);
    } else {
      console.log(`Found ${certCount} existing certificates - skipping creation`);
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n👤 Default Login Credentials:');
    console.log('   • Admin: admin@cert.com / admin123');
    console.log('   • Verifier: verifier@cert.com / verifier123'); 
    console.log('   • User: user@cert.com / user123');
    console.log('\n🚀 Start the app:');
    console.log('   Backend: cd backend && npm run dev');
    console.log('   Frontend: cd frontend && npm run dev');
    console.log('\n🌐 Access:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend API: http://localhost:5005/api');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  }
};

seedDatabase();
