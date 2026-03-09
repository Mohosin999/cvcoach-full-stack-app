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
  sourceType?: 'uploaded' | 'builder';
  originalFormat?: {
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
  experience: Experience[];
  projects?: Project[];
  achievements?: Achievement[];
  certifications?: Certification[];
  education: Education[];
  skills: string[];
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

export interface Project {
  name: string;
  description: string;
  links?: {
    live?: string;
    github?: string;
    caseStudy?: string;
  };
  technologies?: string[];
}

export interface Achievement {
  title: string;
  description?: string;
  date?: string;
}

export interface Certification {
  title: string;
  link?: string;
  date?: string;
}

export interface Education {
  institution: string;
  degree: string;
  date?: string;
}

export interface MissingKeywords {
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  devops: string[];
  softSkills: string[];
}

export interface JobMatch {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
}

export interface ExistingSections {
  experience: boolean;
  education: boolean;
  skills: boolean;
}

export interface AtsScoreBreakdown {
  keywordMatching: { score: number; weight: number; details: string };
  skillsMatch: { score: number; weight: number; details: string };
  resumeSections: { score: number; weight: number; details: string };
  experienceRelevance: { score: number; weight: number; details: string };
  achievementsImpact: { score: number; weight: number; details: string };
}

export interface JobMatchingBreakdown {
  requiredSkillsMatch: { score: number; details: string };
  relevantWorkExperience: { score: number; details: string };
  technologiesUsed: { score: number; details: string };
  toolsFrameworks: { score: number; details: string };
  industryRelevance: { score: number; details: string };
  yearsExperienceAlignment: { score: number; details: string };
  roleResponsibilitySimilarity: { score: number; details: string };
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
  atsScoreBreakdown?: AtsScoreBreakdown;
  jobMatchingBreakdown?: JobMatchingBreakdown;
  feedback: Feedback;
  sectionScores: SectionScores;
  keywords: Keywords;
  missingKeywords: MissingKeywords;
  recommendedKeywords: string[];
  howToUseKeywords: string[];
  resumeImprovements: string[];
  jobMatch?: JobMatch;
  existingSections: ExistingSections;
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
