# Certificate Management System

A production-level full-stack web application for managing, generating, and verifying certificates.

## Features

- **Role-based Authentication**: Admin, User, Verifier roles
- **Certificate Generation**: Create custom templates with dynamic fields
- **PDF Generation**: Generate downloadable PDF certificates with QR codes
- **Verification System**: Public verification page with QR code scanning
- **Admin Dashboard**: Analytics and user management
- **Bulk Operations**: CSV upload for bulk certificate generation

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS
- ShadCN UI
- React Router
- Axios
- Recharts (for analytics)

### Backend
- Node.js
- Express.js
- JWT Authentication
- Multer (file uploads)
- PDFKit (PDF generation)
- QRCode

### Database
- MongoDB with Mongoose

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
```

2. **Frontend Setup**
```bash
cd frontend
npm install
```

### Environment Variables

Create `.env` files in both backend and frontend directories.

**Backend (.env)**
```
PORT=5005
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/certificate-management?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5005/api
```

### Running the Application

1. **Start MongoDB** (if using local)
```bash
mongod
```

2. **Start Backend**
```bash
cd backend
npm run dev
```

3. **Start Frontend**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## Default Admin Account
- Email: admin@cert.com
- Password: admin123

## API Routes

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Users
- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

### Certificates
- POST /api/certificates/upload
- GET /api/certificates/my
- GET /api/certificates/all
- GET /api/certificates/stats
- PUT /api/certificates/:id/approve
- PUT /api/certificates/:id/reject
- GET /api/certificates/download/:id

### Templates
- POST /api/templates
- GET /api/templates
- DELETE /api/templates/:id

### Verification
- GET /api/verify/:certificateId

### Health
- GET /api/health

## License
MIT

