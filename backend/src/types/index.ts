export interface ResumeContent {
  personalInfo: {
    fullName?: string;
    jobTitle?: string;
    email?: string;
    whatsapp?: string;
    address?: {
      city?: string;
      division?: string;
      zipCode?: string;
    };
    linkedIn?: string;
    socialLinks?: {
      github?: string;
      portfolio?: string;
      website?: string;
    };
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
  projects?: Array<{
    name: string;
    description: string;
    links?: {
      live?: string;
      github?: string;
      caseStudy?: string;
    };
    technologies?: string[];
  }>;
  achievements?: Array<{
    title: string;
    description?: string;
    date?: string;
  }>;
  certifications?: Array<{
    title: string;
    link?: string;
    date?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    date?: string;
  }>;
  skills: string[];
}

export interface AnalysisResult {
  score: number;
  atsScore?: number;
  atsScoreBreakdown?: {
    keywordMatching: { score: number; weight: number; details: string };
    skillsMatch: { score: number; weight: number; details: string };
    resumeSections: { score: number; weight: number; details: string };
    experienceRelevance: { score: number; weight: number; details: string };
    achievementsImpact: { score: number; weight: number; details: string };
  };
  jobMatchingScore?: number;
  jobMatchingBreakdown?: {
    requiredSkillsMatch: { score: number; details: string };
    relevantWorkExperience: { score: number; details: string };
    technologiesUsed: { score: number; details: string };
    toolsFrameworks: { score: number; details: string };
    industryRelevance: { score: number; details: string };
    yearsExperienceAlignment: { score: number; details: string };
    roleResponsibilitySimilarity: { score: number; details: string };
  };
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
