import express from 'express';
import Certificate from '../models/Certificate.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// @route   GET /api/verify/:certificateId
// @desc    Verify a certificate by ID
// @access  Public
router.get('/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('userId', 'name email')
      .populate('templateId', 'name');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate not found',
        status: 'not_found'
      });
    }

    // Log verification activity
    await ActivityLog.create({
      userId: certificate.userId?._id || null,
      action: 'verify_certificate',
      description: `Certificate verified: ${certificateId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { certificateId, status: certificate.status }
    });

    const normalizedStatus = certificate.status === 'approved' ? 'valid' : certificate.status;

    res.json({
      success: true,
      valid: ['valid', 'approved'].includes(certificate.status),
      status: normalizedStatus,
      certificate: {
        certificateId: certificate.certificateId,
        recipientName: certificate.recipientName,
        courseName: certificate.courseName,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        status: normalizedStatus,
        verificationLink: certificate.verificationLink,
        templateName: certificate.templateId?.name
      },
      certificateId: certificate.certificateId,
      recipientName: certificate.recipientName,
      courseName: certificate.courseName,
      issueDate: certificate.issueDate,
      expiryDate: certificate.expiryDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/verify/qr
// @desc    Verify a certificate by QR code data
// @access  Public
router.post('/qr', async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }

    // Extract certificate ID from QR data
    // QR data could be the certificate ID directly or a URL
    let certificateId = qrData;
    
    // If it's a URL, extract the certificate ID
    if (qrData.includes('/verify/')) {
      const parts = qrData.split('/verify/');
      certificateId = parts[parts.length - 1];
    }

    const certificate = await Certificate.findOne({ certificateId })
      .populate('userId', 'name email')
      .populate('templateId', 'name');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate not found',
        status: 'not_found'
      });
    }

    // Log verification activity
    await ActivityLog.create({
      userId: certificate.userId?._id || null,
      action: 'verify_certificate',
      description: `Certificate verified via QR: ${certificateId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { certificateId, status: certificate.status }
    });

    const normalizedStatus = certificate.status === 'approved' ? 'valid' : certificate.status;

    res.json({
      success: true,
      valid: ['valid', 'approved'].includes(certificate.status),
      status: normalizedStatus,
      certificate: {
        certificateId: certificate.certificateId,
        recipientName: certificate.recipientName,
        courseName: certificate.courseName,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        status: normalizedStatus,
        verificationLink: certificate.verificationLink,
        templateName: certificate.templateId?.name
      },
      certificateId: certificate.certificateId,
      recipientName: certificate.recipientName,
      courseName: certificate.courseName,
      issueDate: certificate.issueDate,
      expiryDate: certificate.expiryDate
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

