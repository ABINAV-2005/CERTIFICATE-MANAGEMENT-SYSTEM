import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Template name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  signature: {
    type: String,
    default: ''
  },
  signatureName: {
    type: String,
    default: ''
  },
  signatureTitle: {
    type: String,
    default: ''
  },
  fields: [{
    fieldName: {
      type: String,
      required: true
    },
    fieldLabel: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      enum: ['text', 'date', 'number'],
      default: 'text'
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    position: {
      x: Number,
      y: Number,
      fontSize: Number,
      fontFamily: String,
      color: String
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Template = mongoose.model('Template', templateSchema);

export default Template;