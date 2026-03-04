export interface User {
  _id: string;
  email: string;
  name: string;
  googleId?: string;
  picture?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultTemplate?: string;
    notifications: boolean;
  };
  subscription: {
    plan: 'free' | 'pro';
    credits: number;
    expiresAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  _id: string;
  userId: string;
  originalFormat: {
    filename: string;
    mimetype: string;
    size: number;
    path: string;
  };
  content: ResumeContent;
  metadata: {
    filename: string;
    originalName: string;
    size: number;
    type: string;
  };
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeContent {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
}

export interface Experience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  graduationDate?: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface Language {
  language: string;
  proficiency: string;
}

export interface Analysis {
  _id: string;
  userId: string;
  resumeId: Resume;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  score: number;
  atsScore: number;
  feedback: Feedback;
  sectionScores: SectionScores;
  keywords: Keywords;
  createdAt: string;
}

export interface Feedback {
  overall: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface SectionScores {
  skills: {
    score: number;
    matched: string[];
    missing: string[];
  };
  experience: {
    score: number;
    details: string;
  };
  education: {
    score: number;
    details: string;
  };
  format: {
    score: number;
    details: string;
  };
}

export interface Keywords {
  found: string[];
  missing: string[];
  density: Record<string, number>;
}

export interface JobDescription {
  _id: string;
  userId: string;
  title: string;
  company?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
