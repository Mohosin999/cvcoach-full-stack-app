import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';
import { ResumeContent } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<any>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest) return Promise.reject(error);

    const isAuthRequest = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh') ||
                          originalRequest.url?.includes('/auth/me');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  googleLogin: () => window.location.href = `${API_URL}/auth/google`,
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  deleteAccount: () => api.delete('/users/account'),
  useCredit: () => api.post('/users/use-credit'),
  addFreeCredits: () => api.post('/users/add-free-credits'),
  getFreeCreditsStatus: () => api.get('/users/free-credits-status'),
};

export const resumeApi = {
  getAll: (page = 1, limit = 10) => api.get(`/resumes?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/resumes/${id}`),
  upload: (formData: FormData) => api.post('/resumes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  createFromContent: (content: ResumeContent) => api.post('/resumes/content', { content }),
  update: (id: string, data: any) => api.put(`/resumes/${id}`, data),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  deleteAll: () => api.delete('/resumes/delete-all'),
  generateSummary: (jobTitle: string, skills: string[], experience?: string) => 
    api.post('/resumes/ai/generate-summary', { jobTitle, skills, experience }),
  generateExperience: (jobTitle: string, company: string, yearsExperience?: number, skills?: string[]) =>
    api.post('/resumes/ai/generate-experience', { jobTitle, company, yearsExperience, skills }),
  generateProject: (projectName: string, technologies?: string[]) =>
    api.post('/resumes/ai/generate-project', { projectName, technologies }),
  generateSkills: (jobTitle: string) =>
    api.post('/resumes/ai/generate-skills', { jobTitle }),
  generateAchievements: (jobTitle: string, experience?: string) =>
    api.post('/resumes/ai/generate-achievements', { jobTitle, experience }),
  generateCertifications: (jobTitle: string) =>
    api.post('/resumes/ai/generate-certifications', { jobTitle }),
  generateFullResume: (data: { jobTitle: string; experience?: string; skills?: string[]; education?: string }) =>
    api.post('/resumes/ai/generate-full', data),
  improveContent: (section: string, content: string, jobTitle?: string) =>
    api.post('/resumes/ai/improve', { section, content, jobTitle }),
};

export const analysisApi = {
  getAll: (page = 1, limit = 10) => api.get(`/analysis?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/analysis/${id}`),
  create: (data: { resumeId: string; jobDescription: string; jobTitle?: string; company?: string }) =>
    api.post('/analysis', data),
  delete: (id: string) => api.delete(`/analysis/${id}`),
  deleteAll: () => api.delete('/analysis/delete-all'),
};

export const jobApi = {
  getAll: (page = 1, limit = 10) => api.get(`/jobs?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/jobs/${id}`),
  create: (data: { title: string; company?: string; description: string }) => api.post('/jobs', data),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
};

export default api;
