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
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduationDate?: string;
    gpa?: string;
  }>;
  skills: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
    url?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
}

export interface AnalysisResult {
  score: number;
  atsScore: number;
  feedback: {
    overall: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  sectionScores: {
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
  };
  keywords: {
    found: string[];
    missing: string[];
    density: Record<string, number>;
  };
}

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export interface AuthRequest extends Express.Request {
  user?: any;
}
