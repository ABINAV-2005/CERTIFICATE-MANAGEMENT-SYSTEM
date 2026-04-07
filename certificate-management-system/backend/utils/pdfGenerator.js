import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const ensureDirectories = () => {
  const dirs = ['uploads/certificates', 'uploads/templates'];
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

export const generateCertificatePDF = async ({ certificate, template, recipientName, courseName, issueDate }) => {
  ensureDirectories();

  const doc = new PDFDocument({
    size: 'A4 landscape',
    margins: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const fileName = `certificate-${certificate.certificateId}.pdf`;
  const filePath = path.join(__dirname, '..', 'uploads/certificates', fileName);
  
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Background color
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');

  // Border design
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .lineWidth(3)
    .stroke('#1a365d');

  // Inner border
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
    .lineWidth(1)
    .stroke('#2c5282');

  // Header decoration
  doc.rect(0, 0, doc.page.width, 80).fill('#1a365d');
  
  // Title
  doc.fillColor('#ffffff')
    .fontSize(36)
    .font('Helvetica-Bold')
    .text('CERTIFICATE', 0, 30, { align: 'center' });

  doc.fontSize(24)
    .font('Helvetica')
    .text('OF COMPLETION', { align: 'center' });

  // Reset for main content
  doc.fillColor('#1a365d').fontSize(16);
  
  // Decorative line
  doc.moveTo(200, 150).lineTo(610, 150).lineWidth(2).stroke('#2c5282');

  // "This is to certify that"
  doc.fontSize(16)
    .font('Helvetica')
    .text('This is to certify that', 0, 180, { align: 'center' });

  // Recipient name
  doc.fontSize(40)
    .font('Helvetica-Bold')
    .fillColor('#2c5282')
    .text(recipientName, 0, 220, { align: 'center' });

  // Underline for name
  const nameWidth = doc.widthOfString(recipientName);
  doc.moveTo((doc.page.width - nameWidth) / 2, 270)
    .lineTo((doc.page.width + nameWidth) / 2, 270)
    .lineWidth(2)
    .stroke('#2c5282');

  // "has successfully completed"
  doc.fillColor('#1a365d')
    .fontSize(16)
    .font('Helvetica')
    .text('has successfully completed the course', 0, 300, { align: 'center' });

  // Course name
  doc.fontSize(32)
    .font('Helvetica-Bold')
    .fillColor('#2c5282')
    .text(courseName, 0, 340, { align: 'center' });

  // Issue date
  const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  doc.fontSize(14)
    .font('Helvetica')
    .fillColor('#4a5568')
    .text(`Issued on: ${formattedDate}`, 0, 420, { align: 'center' });

  // Certificate ID
  doc.fontSize(10)
    .fillColor('#718096')
    .text(`Certificate ID: ${certificate.certificateId}`, 0, 500, { align: 'center' });

  // Generate QR Code
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${certificate.certificateId}`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(verificationLink, {
    width: 100,
    margin: 1,
    color: {
      dark: '#1a365d',
      light: '#ffffff'
    }
  });

  // Extract base64 data and write to PDF
  const qrBase64 = qrCodeDataUrl.replace('data:image/png;base64,', '');
  const qrBuffer = Buffer.from(qrBase64, 'base64');

  // Add QR code to PDF
  doc.image(qrBuffer, doc.page.width - 150, doc.page.height - 180, {
    width: 100,
    height: 100
  });

  // QR code label
  doc.fontSize(8)
    .fillColor('#718096')
    .text('Scan to verify', doc.page.width - 150, doc.page.height - 85, {
      width: 100,
      align: 'center'
    });

  // Signature section (if template has signature)
  if (template?.signature) {
    const signaturePath = path.join(__dirname, '..', template.signature);
    if (fs.existsSync(signaturePath)) {
      doc.image(signaturePath, 100, 450, { width: 150, height: 50 });
    }
  }

  // Signature line and text
  doc.moveTo(100, 520).lineTo(300, 520).stroke('#1a365d');
  doc.fontSize(12)
    .fillColor('#1a365d')
    .text('Authorized Signature', 100, 530, { width: 200, align: 'center' });

  // Footer decoration
  doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill('#1a365d');
  doc.fillColor('#ffffff')
    .fontSize(10)
    .text('Certificate Management System', 0, doc.page.height - 25, { align: 'center' });

  // Finalize PDF
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      resolve(filePath);
    });
    stream.on('error', reject);
  });
};

export const generateTemplatePreview = async (templateData) => {
  const doc = new PDFDocument({
    size: 'A4 landscape',
    margins: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const fileName = `template-preview-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '..', 'uploads/templates', fileName);
  
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');
  
  // Border
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .lineWidth(3)
    .stroke('#1a365d');

  // Template name
  doc.fillColor('#1a365d')
    .fontSize(36)
    .font('Helvetica-Bold')
    .text('TEMPLATE PREVIEW', 0, 30, { align: 'center' });

  doc.fontSize(24)
    .font('Helvetica')
    .text(templateData.name || 'Certificate Template', { align: 'center' });

  // Sample content
  doc.fontSize(16)
    .font('Helvetica')
    .text('Sample Recipient Name', 0, 200, { align: 'center' });

  doc.fontSize(24)
    .text('Sample Course Name', 0, 300, { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      resolve(filePath);
    });
    stream.on('error', reject);
  });
};

