import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import path from 'path';
import fs from 'fs';

// ================== STATS ==================
export const getStats = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const total = await Certificate.countDocuments(filter);

    const pending = await Certificate.countDocuments({ ...filter, status: 'pending' });

    const approved = await Certificate.countDocuments({
      ...filter,
      status: { $in: ['approved', 'valid'] }
    });

    const expired = await Certificate.countDocuments({
      ...filter,
      expiryDate: { $lt: new Date() }
    });

    const valid = await Certificate.countDocuments({
      ...filter,
      status: 'valid'
    });

    const revoked = await Certificate.countDocuments({
      ...filter,
      status: 'revoked'
    });

    const totalUsers = req.user.role === 'admin' ? await User.countDocuments() : 1;

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        expired,
        pendingCertificates: pending,
        approvedCertificates: approved,
        validCertificates: valid,
        revokedCertificates: revoked,
        expiredCertificates: expired
      },
      overview: {
        totalCertificates: total,
        activeCertificates: approved,
        revokedCertificates: revoked,
        totalUsers
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== USER CERTIFICATES ==================
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== ADMIN VIEW ==================
export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== SINGLE CERTIFICATE ==================
export const getCertificateById = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate('userId', 'name email role');
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const isOwner = cert.userId?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this certificate' });
    }

    await ActivityLog.create({
      userId: req.user._id,
      action: 'view_certificate',
      description: `Viewed certificate: ${cert.certificateId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, certificate: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== UPLOAD ==================
export const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const certificateId = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const newCert = new Certificate({
      userId: req.user._id,
      certificateId,
      recipientName: req.body.recipientName || req.user.name,
      courseName: req.body.courseName,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      expiryDate: req.body.expiryDate || req.body.toDate,
      pdfUrl: `/uploads/certificates/${req.file.filename}`,
      status: 'pending'
    });

    await newCert.save();
    await ActivityLog.create({
      userId: req.user._id,
      action: 'create_certificate',
      description: `Uploaded certificate: ${newCert.certificateId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // 🔥 SOCKET NOTIFICATION
    const io = req.app.get("io");
    if (io) {
      io.emit("new_certificate", {
        message: "New certificate uploaded",
        certificate: newCert
      });
      io.emit("newCertificate", {
        message: "New certificate uploaded",
        certificate: newCert
      });
    }

    res.json({
      success: true,
      message: "Certificate uploaded successfully",
      certificate: newCert
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== APPROVE ==================
export const approveCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }
    cert.status = 'approved';
    await cert.save();
    await ActivityLog.create({
      userId: req.user._id,
      action: 'approve_certificate',
      description: `Approved certificate: ${cert.certificateId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("certificate_updated", { certificateId: cert.certificateId, status: 'approved' });
      io.emit("certificateUpdated", { certificateId: cert.certificateId, status: 'approved' });
    }

    res.json({ success: true, message: "Certificate approved", certificate: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== REJECT ==================
export const rejectCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }
    cert.status = 'rejected';
    await cert.save();
    await ActivityLog.create({
      userId: req.user._id,
      action: 'reject_certificate',
      description: `Rejected certificate: ${cert.certificateId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("certificate_updated", { certificateId: cert.certificateId, status: 'rejected' });
      io.emit("certificateUpdated", { certificateId: cert.certificateId, status: 'rejected' });
    }

    res.json({ success: true, message: "Certificate rejected", certificate: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== DOWNLOAD ==================
export const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);

    if (!cert || !cert.pdfUrl) {
      return res.status(404).json({ message: "File not found" });
    }

    const relativePath = cert.pdfUrl.replace(/^\/+/, '');
    const filePath = path.join(process.cwd(), relativePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing on server" });
    }

    await ActivityLog.create({
      userId: req.user._id,
      action: 'download_certificate',
      description: `Downloaded certificate file: ${cert.certificateId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.download(filePath);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== UPDATE CERTIFICATE ==================
export const updateCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const isOwner = cert.userId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this certificate' });
    }

    const allowedFields = ['recipientName', 'courseName', 'fromDate', 'toDate', 'expiryDate'];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        cert[key] = req.body[key];
      }
    }

    // Keep admin-controlled states unchanged unless admin explicitly sets status.
    if (isAdmin && req.body.status) {
      cert.status = req.body.status;
    }

    await cert.save();
    await ActivityLog.create({
      userId: req.user._id,
      action: 'update_certificate',
      description: `Updated certificate: ${cert.certificateId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Certificate updated successfully',
      certificate: cert
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== DELETE CERTIFICATE ==================
export const deleteCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const isOwner = cert.userId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this certificate' });
    }

    // Try removing uploaded file if present.
    if (cert.pdfUrl) {
      const relativePath = cert.pdfUrl.replace(/^\/+/, '');
      const filePath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const deletedId = cert.certificateId;
    await cert.deleteOne();
    await ActivityLog.create({
      userId: req.user._id,
      action: 'delete_certificate',
      description: `Deleted certificate: ${deletedId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== EMPLOYEE STATS ==================
export const getEmployeeStats = async (req, res) => {
  try {
    const topEmployees = await Certificate.aggregate([
      { $match: { userId: { $ne: null } } },
      { $group: { _id: '$userId', certificates: { $sum: 1 } } },
      { $sort: { certificates: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$user._id',
          name: '$user.name',
          email: '$user.email',
          certificates: 1
        }
      }
    ]);

    res.json({ success: true, topEmployees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== CERTIFICATE ANALYTICS ==================
export const getCertificateStats = async (req, res) => {
  try {
    const topCourses = await Certificate.aggregate([
      { $group: { _id: '$courseName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, courseName: '$_id', count: 1 } }
    ]);

    res.json({ success: true, topCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value).replace(/"/g, '""');
  return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue;
};

const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

// ================== EXPORT CSV ==================
export const exportCertificatesCsv = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const headers = [
      'certificateId',
      'recipientName',
      'courseName',
      'fromDate',
      'toDate',
      'expiryDate',
      'status',
      'ownerName',
      'ownerEmail',
      'createdAt'
    ];

    const rows = certificates.map((cert) => ([
      cert.certificateId,
      cert.recipientName,
      cert.courseName,
      cert.fromDate ? new Date(cert.fromDate).toISOString().split('T')[0] : '',
      cert.toDate ? new Date(cert.toDate).toISOString().split('T')[0] : '',
      cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
      cert.status,
      cert.userId?.name || '',
      cert.userId?.email || '',
      cert.createdAt ? new Date(cert.createdAt).toISOString() : ''
    ]));

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(toCsvValue).join(','))
    ].join('\n');

    await ActivityLog.create({
      userId: req.user._id,
      action: 'export_certificate',
      description: `Exported ${certificates.length} certificates as CSV`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="certificates-${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== IMPORT CSV ==================
export const importCertificatesCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'CSV file is required' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const lines = fileContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV must include header and at least one row' });
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const requiredHeaders = ['recipientname', 'coursename', 'fromdate', 'todate'];

    const missing = requiredHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required CSV columns: ${missing.join(', ')}`
      });
    }

    const headerIndex = Object.fromEntries(headers.map((h, index) => [h, index]));
    const docs = [];

    for (let i = 1; i < lines.length; i += 1) {
      const cols = parseCsvLine(lines[i]);
      const recipientName = cols[headerIndex.recipientname];
      const courseName = cols[headerIndex.coursename];
      const fromDate = cols[headerIndex.fromdate];
      const toDate = cols[headerIndex.todate];
      const expiryDate = cols[headerIndex.expirydate] || toDate;

      if (!recipientName || !courseName || !fromDate || !toDate) {
        continue;
      }

      docs.push({
        certificateId: `CERT-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        userId: req.user._id,
        recipientName,
        courseName,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        expiryDate: new Date(expiryDate),
        status: 'pending'
      });
    }

    if (docs.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid certificate rows found in CSV' });
    }

    const inserted = await Certificate.insertMany(docs);
    await ActivityLog.create({
      userId: req.user._id,
      action: 'import_certificate',
      description: `Imported ${inserted.length} certificates from CSV`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('new_certificate', {
        message: `${inserted.length} certificates imported`,
        count: inserted.length
      });
    }

    res.status(201).json({
      success: true,
      message: `Imported ${inserted.length} certificates`,
      imported: inserted.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};
