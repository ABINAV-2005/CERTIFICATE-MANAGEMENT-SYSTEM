# Certificate Management System Upgrade TODO

## Priority 1: Core Fixes (Backend Stability)
- [ ] 1. Backend server.js: Set port 5005 explicitly
- [ ] 2. Backend certificateController.js: Fix uploadCertificate to use pdfUrl=req.file.path, generate proper certificateId (e.g. CERT-YYYY-XXX)
- [ ] 3. Backend: Add approveCertificate/rejectCertificate functions (update status 'approved'/'rejected', emit socket)
- [ ] 4. Backend routes/certificates.js: Add PUT /:id/approve, PUT /:id/reject
- [ ] 5. Backend models/Certificate.js: Add pre('save') hook to compute status (expired if expiryDate < now)

## Priority 2: Frontend Core
- [ ] 6. Frontend socket.js: Change to localhost:5005, add on('new_certificate') listener
- [ ] 7. Frontend api.js: Add endpoints approveCertificate(id), rejectCertificate(id), ensure getStats used
- [ ] 8. Frontend UploadCertificatePage.jsx: Full form (recipientName, courseName, dates, expiryDate, file), shadcn inputs, toast
- [ ] 9. Frontend Dashboard.jsx: Fix API to /stats + /my recent, add socket refresh, monthly graph placeholder, colorful UI
- [ ] 10. Frontend CertificatesPage.jsx: Role-based (user: list own; admin: all + approve/reject/download/export buttons), badges

## Priority 3: Polish & Advanced
- [ ] 11. Backend: Add exportCSV controller/route
- [ ] 12. Frontend: CSV export button (admin)
- [ ] 13. Backend: importCSV (bonus)
- [ ] 14. Frontend: VerifyPage certificateId lookup + badge
- [ ] 15. Install deps: backend json2csv csv-parser, frontend date-fns if needed
- [ ] 16. Test full flow: upload -> admin approve -> download -> dashboard realtime -> export

**Progress: 10/16** ( + CertificatesPage full admin panel with approve/reject/download + badges + role-based)
