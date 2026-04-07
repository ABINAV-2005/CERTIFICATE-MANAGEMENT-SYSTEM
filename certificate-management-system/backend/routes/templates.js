import express from 'express';
import Template from '../models/Template.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @route   POST /api/templates
// @desc    Create a new template
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), upload.fields([
  { name: 'backgroundImage', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description, signatureName, signatureTitle, fields } = req.body;

    // Parse fields if it's a string
    let parsedFields = fields;
    if (typeof fields === 'string') {
      parsedFields = JSON.parse(fields);
    }

    const templateData = {
      name,
      description,
      signatureName,
      signatureTitle,
      fields: parsedFields || [],
      createdBy: req.user._id
    };

    // Add file paths if uploaded
    if (req.files) {
      if (req.files.backgroundImage) {
        templateData.backgroundImage = `/uploads/templates/${req.files.backgroundImage[0].filename}`;
      }
      if (req.files.logo) {
        templateData.logo = `/uploads/templates/${req.files.logo[0].filename}`;
      }
      if (req.files.signature) {
        templateData.signature = `/uploads/templates/${req.files.signature[0].filename}`;
      }
    }

    const template = await Template.create(templateData);

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: 'create_template',
      description: `Template created: ${name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      template
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/templates
// @desc    Get all templates
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const templates = await Template.find(query)
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Template.countDocuments(query);

    res.json({
      success: true,
      templates,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/templates/:id
// @desc    Get template by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/templates/:id
// @desc    Update template
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), upload.fields([
  { name: 'backgroundImage', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description, signatureName, signatureTitle, fields, isActive } = req.body;

    let template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Parse fields if it's a string
    let parsedFields = fields;
    if (typeof fields === 'string') {
      parsedFields = JSON.parse(fields);
    }

    const updateData = {
      name: name || template.name,
      description: description || template.description,
      signatureName: signatureName || template.signatureName,
      signatureTitle: signatureTitle || template.signatureTitle,
      fields: parsedFields || template.fields,
      isActive: isActive !== undefined ? isActive === 'true' : template.isActive
    };

    // Add file paths if uploaded
    if (req.files) {
      if (req.files.backgroundImage) {
        updateData.backgroundImage = `/uploads/templates/${req.files.backgroundImage[0].filename}`;
      }
      if (req.files.logo) {
        updateData.logo = `/uploads/templates/${req.files.logo[0].filename}`;
      }
      if (req.files.signature) {
        updateData.signature = `/uploads/templates/${req.files.signature[0].filename}`;
      }
    }

    template = await Template.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: 'update_template',
      description: `Template updated: ${template.name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/templates/:id
// @desc    Delete template
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await template.deleteOne();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      action: 'delete_template',
      description: `Template deleted: ${template.name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

