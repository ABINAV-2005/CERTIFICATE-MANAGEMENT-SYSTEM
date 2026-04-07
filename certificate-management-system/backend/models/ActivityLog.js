import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'register',
      'create_certificate',
      'view_certificate',
      'download_certificate',
      'update_certificate',
      'delete_certificate',
      'approve_certificate',
      'reject_certificate',
      'export_certificate',
      'import_certificate',
      'revoke_certificate',
      'create_template',
      'update_template',
      'delete_template',
      'create_user',
      'update_user',
      'delete_user',
      'verify_certificate',
      'bulk_upload'
    ]
  },
  description: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for faster queries
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;

