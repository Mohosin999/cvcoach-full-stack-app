# ResumeAI - AI-Powered Resume Analysis & Generation

A professional MERN stack web application for AI-powered resume analysis and generation. The app allows users to upload resumes, paste job descriptions, get AI feedback, and generate improved resumes while maintaining original formatting.

## Features

- **Google OAuth 2.0 Authentication** - Secure login with Google
- **Resume Upload** - Drag and drop PDF/DOCX files (max 10MB)
- **AI Analysis** - Compare resume with job description using Google Gemini
- **ATS Optimization** - Get ATS compatibility scores and recommendations
- **Resume Builder** - Create and edit professional resumes
- **Multiple Export Formats** - Download as PDF or DOCX
- **Dark/Light Theme** - Professional UI with theme switching

## Tech Stack

### Backend
- Node.js 20 + Express.js
- TypeScript
- MongoDB with Mongoose
- Google OAuth 2.0 + JWT
- Google Gemini AI
- PDF/DOCX parsing

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion
- React Router v6
- React Query
- jsPDF + docx

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB
- Docker & Docker Compose
- Google Cloud Console project
- Gemini API key

### Environment Setup

1. **Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

2. **Frontend**
```bash
cd frontend
cp .env.example .env
# Edit .env with your credentials
```

### Running with Docker

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Running Locally

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `DELETE /api/users/account` - Delete account

### Resumes
- `GET /api/resumes` - List resumes
- `POST /api/resumes` - Upload resume
- `GET /api/resumes/:id` - Get resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Analysis
- `GET /api/analysis` - List analyses
- `POST /api/analysis` - Create analysis
- `GET /api/analysis/:id` - Get analysis
- `DELETE /api/analysis/:id` - Delete analysis

### Job Descriptions
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Save job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript types
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## License

MIT
