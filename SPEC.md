# Resume AI - AI-Powered Resume Analysis & Generation

## Project Overview

**Project Name:** Resume AI  
**Type:** Full-stack MERN Web Application  
**Core Functionality:** AI-powered resume analysis against job descriptions with intelligent feedback and resume generation while maintaining original formatting.  
**Target Users:** Job seekers, recruiters, HR professionals

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **State Management:** React Context + useReducer
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Forms:** React Hook Form + Zod
- **PDF Processing:** react-pdf, pdfjs-dist
- **DOCX Processing:** docx, file-saver

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js with TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** Passport.js (Google OAuth 2.0) + JWT
- **File Storage:** Local with multer (production: AWS S3)
- **AI Integration:** Google Gemini API
- **Validation:** Joi

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (optional)

## UI/UX Specification

### Color Palette
- **Primary:** #2563eb (Blue 600)
- **Primary Dark:** #1d4ed8 (Blue 700)
- **Secondary:** #7c3aed (Violet 600)
- **Success:** #10b981 (Emerald 500)
- **Warning:** #f59e0b (Amber 500)
- **Error:** #ef4444 (Red 500)
- **Background Light:** #f8fafc (Slate 50)
- **Background Dark:** #0f172a (Slate 900)
- **Surface Light:** #ffffff
- **Surface Dark:** #1e293b (Slate 800)
- **Text Primary Light:** #0f172a (Slate 900)
- **Text Primary Dark:** #f8fafc (Slate 50)
- **Text Secondary Light:** #64748b (Slate 500)
- **Text Secondary Dark:** #94a3b8 (Slate 400)

### Typography
- **Font Family:** Inter (headings), Inter (body)
- **Heading 1:** 2.5rem (40px), font-weight: 700
- **Heading 2:** 2rem (32px), font-weight: 600
- **Heading 3:** 1.5rem (24px), font-weight: 600
- **Heading 4:** 1.25rem (20px), font-weight: 500
- **Body:** 1rem (16px), font-weight: 400
- **Small:** 0.875rem (14px), font-weight: 400
- **Caption:** 0.75rem (12px), font-weight: 400

### Spacing System
- **xs:** 0.25rem (4px)
- **sm:** 0.5rem (8px)
- **md:** 1rem (16px)
- **lg:** 1.5rem (24px)
- **xl:** 2rem (32px)
- **2xl:** 3rem (48px)
- **3xl:** 4rem (64px)

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Layout Structure

#### Navbar
- Fixed top, height: 64px
- Logo on left, navigation center, user menu right
- Mobile: hamburger menu
- Dark mode toggle on right

#### Sidebar (Dashboard)
- Width: 280px on desktop
- Collapsible on tablet
- Hidden on mobile with overlay

#### Main Content
- Max-width: 1280px
- Padding: 24px (desktop), 16px (mobile)
- Centered with auto margins

### Components

#### Buttons
- **Primary:** Blue background, white text, rounded-lg (8px)
- **Secondary:** Transparent with border
- **Ghost:** No background, hover shows background
- **Sizes:** sm (32px), md (40px), lg (48px)
- **States:** default, hover (darken 10%), active (darken 15%), disabled (opacity 50%)

#### Cards
- Border radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: translateY(-2px), shadow increase
- Padding: 24px

#### Form Inputs
- Height: 44px
- Border: 1px solid #e2e8f0
- Border radius: 8px
- Focus: ring-2 primary color
- Error: red border, error message below

#### Modals
- Centered overlay
- Max-width: 500px
- Background blur on overlay
- Scale animation on open

#### Toast Notifications
- Position: top-right
- Auto-dismiss after 5 seconds
- Slide-in animation
- Types: success, error, warning, info

### Animations

#### Page Transitions
- Fade in: 300ms ease-out
- Slide from right: 300ms ease-out

#### Loading States
- Skeleton pulse: 1.5s infinite
- Spinner: rotate 360deg, 1s linear infinite

#### Micro-interactions
- Button hover: scale(1.02), 150ms
- Card hover: translateY(-4px), shadow increase, 200ms
- Toggle switch: 200ms ease

## Database Models

### User
```typescript
{
  _id: ObjectId,
  email: String (unique, required),
  name: String,
  googleId: String (unique),
  picture: String,
  preferences: {
    theme: 'light' | 'dark' | 'system',
    defaultTemplate: String,
    notifications: Boolean
  },
  subscription: {
    plan: 'free' | 'pro',
    credits: Number,
    expiresAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Resume
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  originalFormat: {
    filename: String,
    mimetype: String,
    size: Number,
    path: String
  },
  content: {
    personalInfo: Object,
    summary: String,
    experience: Array,
    education: Array,
    skills: Array,
    projects: Array,
    certifications: Array,
    languages: Array
  },
  metadata: {
    filename: String,
    originalName: String,
    size: Number,
    type: String
  },
  tags: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Analysis
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  resumeId: ObjectId (ref: Resume),
  jobDescription: String,
  jobTitle: String,
  company: String,
  score: Number,
  atsScore: Number,
  feedback: {
    overall: String,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String]
  },
  sectionScores: {
    skills: { score: Number, matched: [String], missing: [String] },
    experience: { score: Number, details: String },
    education: { score: Number, details: String },
    format: { score: Number, details: String }
  },
  keywords: {
    found: [String],
    missing: [String],
    density: Object
  },
  createdAt: Date
}
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Google OAuth redirect
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete account

### Resumes
- `GET /api/resumes` - List user resumes
- `POST /api/resumes` - Upload resume
- `GET /api/resumes/:id` - Get resume details
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Analysis
- `GET /api/analysis` - List user analyses
- `POST /api/analysis` - Create new analysis
- `GET /api/analysis/:id` - Get analysis details
- `DELETE /api/analysis/:id` - Delete analysis

### Job Descriptions
- `GET /api/jobs` - List saved job descriptions
- `POST /api/jobs` - Save job description
- `PUT /api/jobs/:id` - Update job description
- `DELETE /api/jobs/:id` - Delete job description

## Functionality Specification

### 1. Authentication Flow
1. User clicks "Login with Google"
2. Redirect to Google OAuth consent screen
3. After approval, callback with auth code
4. Backend exchanges code for tokens
5. Create/update user in database
6. Generate JWT tokens (access + refresh)
7. Store tokens in httpOnly cookies
8. Redirect to dashboard

### 2. Resume Upload Flow
1. User drags file or clicks to upload
2. Client validates: PDF/DOCX only, max 10MB
3. Show progress indicator during upload
4. Backend processes file:
   - PDF: Extract text using pdf-parse
   - DOCX: Extract text using mammoth
5. Parse content into structured data
6. Return parsed resume data
7. Display preview with file name

### 3. Analysis Flow
1. User pastes job description
2. User selects uploaded resume
3. Click "Analyze Resume"
4. Backend sends resume + JD to Gemini AI
5. AI returns:
   - Overall match score
   - Section-wise scores
   - Missing keywords
   - Suggestions
6. Calculate ATS score
7. Store analysis in database
8. Display results with visual feedback

### 4. Resume Generation Flow
1. User clicks "Generate Improved Resume"
2. Backend uses Gemini AI to improve content
3. Maintain original format/structure
4. Return improved resume data
5. Display preview with edit options
6. User can edit sections
7. Download as PDF or DOCX

## Pages

### 1. Landing Page (`/`)
- Hero section with animated text
- Feature cards with icons
- How it works (3 steps)
- Testimonials carousel
- Pricing cards
- CTA buttons

### 2. Login Page (`/login`)
- Google OAuth button
- App branding
- Feature highlights

### 3. Dashboard (`/dashboard`)
- Welcome message with user name
- Stats cards (analyses, resumes, credits)
- Recent analyses list
- Quick action buttons

### 4. Analysis Page (`/analyze`)
- Two-column layout
- Left: Upload + JD input
- Right: Live results
- Progress steps indicator

### 5. Resume Builder (`/builder`)
- Multi-step wizard
- Template selection
- Content editor
- Live preview
- Download options

### 6. History Page (`/history`)
- Paginated list of analyses
- Search and filter
- Date grouping
- Export options

### 7. Settings Page (`/settings`)
- Profile form
- Theme toggle
- Preferences

## Acceptance Criteria

### Authentication
- [ ] Google OAuth login works
- [ ] JWT tokens are secure (httpOnly cookies)
- [ ] Protected routes redirect to login
- [ ] User profile shows Google picture/name

### File Upload
- [ ] Drag and drop works
- [ ] PDF files parse correctly
- [ ] DOCX files parse correctly
- [ ] Invalid formats show error
- [ ] File size limit enforced
- [ ] Progress indicator shows

### Analysis
- [ ] JD text can be pasted
- [ ] Character counter works
- [ ] Analysis returns match percentage
- [ ] Keywords identified correctly
- [ ] Section scores displayed
- [ ] Suggestions provided

### UI/UX
- [ ] Dark/light mode toggle works
- [ ] Theme persists in localStorage
- [ ] Animations are smooth
- [ ] Responsive on all breakpoints
- [ ] Loading states display

### Export
- [ ] PDF download works
- [ ] DOCX download works
- [ ] Formatting maintained

### Performance
- [ ] Pages load under 3 seconds
- [ ] Lazy loading works
- [ ] No memory leaks
