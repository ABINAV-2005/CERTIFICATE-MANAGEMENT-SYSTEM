import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: [true, 'Certificate ID is required'],
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  recipientName: {
    type: String,
    required: [true, 'Recipient name is required']
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required']
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  pdfUrl: {
    type: String
  },
  qrCodeUrl: {
    type: String
  },
  fromDate: {
    type: Date,
    required: [true, 'From date is required']
  },
  toDate: {
    type: Date,
    required: [true, 'To date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'valid', 'revoked', 'rejected', 'expired'],
    default: 'pending'
  },

  metadata: {
    type: Map,
    of: String
  },
  verificationLink: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
certificateSchema.index({ userId: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ fromDate: 1, toDate: 1 });

// Pre-save hook for auto status update
certificateSchema.pre('save', function(next) {
  if (this.expiryDate && this.expiryDate < new Date() && this.status !== 'expired') {
    this.status = 'expired';
  } else if (this.status === 'approved' && !this.expiryDate) {
    this.status = 'valid';
  }
  next();
});


const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;

