# Backend File Structure

## Authentication (Google + JWT)

| File                      | Description                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| `src/routes/auth.ts`      | Auth routes: login, register, google oauth, logout, refresh token |
| `src/config/passport.ts`  | Google OAuth passport configuration                               |
| `src/config/jwt.ts`       | JWT token generation and verification                             |
| `src/middlewares/auth.ts` | Authentication middleware (verify JWT)                            |
| `src/models/User.ts`      | User model (stores google ID, email, etc.)                        |

---

## Resume Analysis

| File                                    | Description                             |
| --------------------------------------- | --------------------------------------- |
| `src/routes/analysis.ts`                | Analysis API routes                     |
| `src/controllers/analysisController.ts` | Analysis controller                     |
| `src/services/analysisService.ts`       | Analysis business logic                 |
| `src/services/aiAnalysis.ts`            | AI-powered resume analysis using Gemini |
| `src/services/resumeParser.ts`          | Parse resume (PDF/DOCX) to extract text |
| `src/models/Analysis.ts`                | Analysis result model                   |

---

## Resume Building

| File                              | Description           |
| --------------------------------- | --------------------- |
| `src/routes/resumes.ts`           | Resume CRUD routes    |
| `src/services/resumeGenerator.ts` | Generate/build resume |
| `src/models/Resume.ts`            | Resume data model     |

---

## Other Important Files

| File                  | Description                             |
| --------------------- | --------------------------------------- |
| `src/app.ts`          | Express app setup (middlewares, routes) |
| `src/index.ts`        | Server entry point                      |
| `src/db/connectDB.ts` | MongoDB connection                      |
