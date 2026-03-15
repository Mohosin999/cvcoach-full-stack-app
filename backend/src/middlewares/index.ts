// Middleware barrel export
// Re-export AuthRequest from types for backward compatibility
export type { AuthRequest } from '../types';
export * from './auth';
export * from './errorHandler';

// Export applyMiddleware from separate file
export { applyMiddleware } from './middlewareConfig';
