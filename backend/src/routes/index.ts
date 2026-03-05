import authRoutes from './auth';
import userRoutes from './users';
import resumeRoutes from './resumes';
import analysisRoutes from './analysis';
import jobRoutes from './jobs';

export {
  authRoutes,
  userRoutes,
  resumeRoutes,
  analysisRoutes,
  jobRoutes
};

export const routes = [
  { path: '/api/auth', router: authRoutes },
  { path: '/api/users', router: userRoutes },
  { path: '/api/resumes', router: resumeRoutes },
  { path: '/api/analysis', router: analysisRoutes },
  { path: '/api/jobs', router: jobRoutes }
];
