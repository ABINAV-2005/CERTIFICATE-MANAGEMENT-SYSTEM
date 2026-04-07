import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure folders exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir('uploads/templates');
ensureDir('uploads/certificates');
ensureDir('uploads/csv');

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'backgroundImage') {
      cb(null, 'uploads/templates');
    } else if (file.fieldname === 'logo' || file.fieldname === 'signature') {
      cb(null, 'uploads/templates');
    } else if (file.fieldname === 'csv') {
      cb(null, 'uploads/csv');
    } else if (file.fieldname === 'file') {
      cb(null, 'uploads/certificates'); // ✅ MAIN FIX
    } else {
      cb(null, 'uploads');
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

// CSV filter
const csvFilter = (req, file, cb) => {
  if (file.mimetype.includes('csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files allowed'), false);
  }
};

// Export
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadCSV = multer({
  storage,
  fileFilter: csvFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});