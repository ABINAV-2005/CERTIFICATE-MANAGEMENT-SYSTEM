import express from 'express';
import { upload, uploadCSV } from '../middleware/uploadMiddleware.js';
import {
  uploadCertificate,
  getAllCertificates,
  getMyCertificates,
  downloadCertificate,
  getStats,
  approveCertificate,
  rejectCertificate,
  getEmployeeStats,
  getCertificateStats,
  exportCertificatesCsv,
  importCertificatesCsv,
  getCertificateById,
  updateCertificate,
  deleteCertificate
} from '../controllers/certificateController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadCertificate);
router.get('/my', protect, getMyCertificates);
router.get('/stats', protect, getStats);
router.get('/stats/employees', protect, authorize('admin'), getEmployeeStats);
router.get('/stats/certificates', protect, authorize('admin'), getCertificateStats);
router.get('/all', protect, authorize('admin'), getAllCertificates);
router.put('/:id/approve', protect, authorize('admin'), approveCertificate);
router.put('/:id/reject', protect, authorize('admin'), rejectCertificate);
router.get('/download/:id', protect, downloadCertificate);
router.get('/export/csv', protect, authorize('admin'), exportCertificatesCsv);
router.post('/import/csv', protect, authorize('admin'), uploadCSV.single('csv'), importCertificatesCsv);
router.get('/:id', protect, getCertificateById);
router.put('/:id', protect, updateCertificate);
router.delete('/:id', protect, deleteCertificate);

export default router;
