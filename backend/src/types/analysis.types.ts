/**
 * Professional Resume Analysis Types
 * Enterprise-grade type definitions for ATS scoring system
 */

// ============================================================================
// Core Resume Content Types
// ============================================================================

export interface ResumeContent {
  personalInfo: {
    fullName?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    linkedIn?: string;
    github?: string;
    portfolio?: string;
    website?: string;
  };
  summary?: string;
  objective?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  projects?: Project[];
  certifications?: Certification[];
  achievements?: Achievement[];
  languages?: Language[];
  publications?: Publication[];
  volunteerWork?: VolunteerExperience[];
}

export interface WorkExperience {
  id?: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string;
  highlights?: string[];
  technologies?: string[];
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  honors?: string[];
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  role?: string;
  technologies?: string[];
  highlights?: string[];
  links?: {
    live?: string;
    github?: string;
    demo?: string;
  };
}

export interface Certification {
  id?: string;
  title: string;
  issuer?: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Achievement {
  id?: string;
  title: string;
  description?: string;
  date?: string;
  issuer?: string;
}

export interface Language {
  id?: string;
  name: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native' | 'Fluent';
  level?: number; // 1-5 scale
}

export interface Publication {
  id?: string;
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
  authors?: string[];
}

export interface VolunteerExperience {
  id?: string;
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
}

// ============================================================================
// Job Description Types
// ============================================================================

export interface ParsedJobDescription {
  rawText: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  experienceLevel?: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Principal';
  requiredSkills: SkillRequirement[];
  preferredSkills: SkillRequirement[];
  requiredExperience?: ExperienceRequirement;
  responsibilities: string[];
  qualifications: string[];
  benefits?: string[];
  keywords: string[];
  actionVerbs: string[];
  industryTerms: string[];
}

export interface SkillRequirement {
  name: string;
  category: SkillCategory;
  isRequired: boolean;
  priority: 'Critical' | 'High' | 'Medium' | 'Nice-to-have';
  yearsRequired?: number;
}

export type SkillCategory = 
  | 'Programming Language'
  | 'Framework'
  | 'Library'
  | 'Database'
  | 'Cloud Platform'
  | 'DevOps Tool'
  | 'Testing Tool'
  | 'Soft Skill'
  | 'Domain Knowledge'
  | 'Methodology'
  | 'Certification';

export interface ExperienceRequirement {
  minYears?: number;
  maxYears?: number;
  requiredIndustries?: string[];
  preferredIndustries?: string[];
  requiredRoles?: string[];
}

// ============================================================================
// Analysis Result Types
// ============================================================================

export interface AnalysisResult {
  // Overall Scores
  overallScore: number; // 0-100
  atsScore: number; // 0-100
  jobMatchScore: number; // 0-100

  // Detailed Score Breakdown
  scoreBreakdown: ScoreBreakdown;
  
  // Section Analysis
  sectionAnalysis: SectionAnalysis;
  
  // Skills Analysis
  skillsAnalysis: SkillsAnalysis;
  
  // Experience Analysis
  experienceAnalysis: ExperienceAnalysis;
  
  // Keyword Analysis
  keywordAnalysis: KeywordAnalysis;
  
  // Recommendations
  recommendations: Recommendation[];
  
  // Metadata
  metadata: AnalysisMetadata;
}

export interface ScoreBreakdown {
  // ATS Score Components (weights sum to 100%)
  ats: {
    keywordMatching: ScoreComponent; // 30%
    skillsMatch: ScoreComponent; // 30%
    sectionCompleteness: ScoreComponent; // 30%
    experienceRelevance: ScoreComponent; // 10%
  };
  
  // Job Match Score Components
  jobMatch: {
    requiredSkillsMatch: ScoreComponent;
    preferredSkillsMatch: ScoreComponent;
    experienceAlignment: ScoreComponent;
    educationAlignment: ScoreComponent;
    responsibilityMatch: ScoreComponent;
  };
}

export interface ScoreComponent {
  score: number; // 0-100
  weight: number; // 0-100 (percentage weight in parent category)
  maxScore: number; // Maximum possible score
  details: string;
  factors: ScoringFactor[];
}

export interface ScoringFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  evidence?: string[];
}

// ============================================================================
// Section Analysis Types
// ============================================================================

export interface SectionAnalysis {
  summary: SectionScore;
  skills: SectionScore;
  experience: SectionScore;
  projects: SectionScore;
  education: SectionScore;
  certifications: SectionScore;
  additionalSections: AdditionalSectionScore[];
}

export interface SectionScore {
  present: boolean;
  score: number; // 0-100
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Missing';
  wordCount?: number;
  issues: SectionIssue[];
  recommendations: string[];
  strengths: string[];
}

export interface AdditionalSectionScore {
  name: string;
  present: boolean;
  score: number;
}

export interface SectionIssue {
  type: 'Missing' | 'Too Short' | 'Too Long' | 'Poor Structure' | 'Missing Keywords' | 'Formatting';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  suggestion: string;
}

// ============================================================================
// Skills Analysis Types
// ============================================================================

export interface SkillsAnalysis {
  totalSkillsFound: number;
  matchedSkills: SkillMatch[];
  missingSkills: SkillGap[];
  additionalSkills: string[]; // Skills in resume but not in JD
  skillCategories: SkillCategoryBreakdown[];
  skillDensity: number; // Skills per year of experience
  skillProficiency: ProficiencyDistribution;
}

export interface SkillMatch {
  name: string;
  category: SkillCategory;
  matchType: 'Exact' | 'Partial' | 'Related' | 'Equivalent';
  matchScore: number; // 0-100
  foundIn: string[]; // Sections where skill was found
  context: string[]; // Context snippets
  yearsOfExperience?: number;
  lastUsed?: string;
}

export interface SkillGap {
  name: string;
  category: SkillCategory;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  isRequired: boolean;
  suggestions: string[];
  learningResources?: string[];
}

export interface SkillCategoryBreakdown {
  category: SkillCategory;
  required: number;
  matched: number;
  missing: number;
  matchPercentage: number;
  skills: string[];
}

export interface ProficiencyDistribution {
  expert: number;
  advanced: number;
  intermediate: number;
  beginner: number;
}

// ============================================================================
// Experience Analysis Types
// ============================================================================

export interface ExperienceAnalysis {
  totalYears: number;
  relevantYears: number;
  positions: PositionAnalysis[];
  careerProgression: CareerProgression;
  achievementMetrics: AchievementMetrics;
  responsibilityMatch: ResponsibilityMatch;
  gaps: EmploymentGap[];
}

export interface PositionAnalysis {
  title: string;
  company: string;
  duration: number; // months
  relevanceScore: number; // 0-100
  matchedKeywords: string[];
  matchedResponsibilities: string[];
  achievements: number;
  quantifiedAchievements: number;
  technologiesUsed: string[];
}

export interface CareerProgression {
  hasProgression: boolean;
  progressionScore: number; // 0-100
  titleProgression: 'Increasing' | 'Lateral' | 'Decreasing' | 'Unclear';
  responsibilityGrowth: boolean;
  skillGrowth: boolean;
}

export interface AchievementMetrics {
  totalAchievements: number;
  quantifiedCount: number;
  quantificationRate: number; // 0-100
  metricTypes: {
    percentages: number;
    monetaryValues: number;
    timeReductions: number;
    efficiencyGains: number;
    scaleMetrics: number;
  };
}

export interface ResponsibilityMatch {
  matchedResponsibilities: number;
  totalResponsibilities: number;
  matchPercentage: number;
  matchedActionVerbs: string[];
  missingActionVerbs: string[];
}

export interface EmploymentGap {
  startDate: string;
  endDate: string;
  durationMonths: number;
  isExplained: boolean;
  severity: 'Critical' | 'Moderate' | 'Minor';
}

// ============================================================================
// Keyword Analysis Types
// ============================================================================

export interface KeywordAnalysis {
  totalKeywords: number;
  foundKeywords: KeywordMatch[];
  missingKeywords: KeywordGap[];
  keywordDensity: {
    overall: number; // keywords per 100 words
    bySection: Record<string, number>;
  };
  keywordDistribution: {
    summary: number;
    experience: number;
    skills: number;
    projects: number;
  };
  overusedKeywords: OverusedKeyword[];
  semanticKeywords: SemanticKeyword[];
}

export interface KeywordMatch {
  keyword: string;
  category: KeywordCategory;
  frequency: number;
  locations: string[];
  context: string[];
  relevanceScore: number;
}

export interface KeywordGap {
  keyword: string;
  category: KeywordCategory;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  frequency: number; // Expected frequency
  suggestions: string[];
}

export type KeywordCategory = 
  | 'Technical Skill'
  | 'Tool'
  | 'Technology'
  | 'Methodology'
  | 'Certification'
  | 'Soft Skill'
  | 'Action Verb'
  | 'Industry Term'
  | 'Domain Knowledge';

export interface OverusedKeyword {
  keyword: string;
  frequency: number;
  recommendedMax: number;
  suggestion: string;
}

export interface SemanticKeyword {
  keyword: string;
  relatedTo: string;
  suggestion: string;
}

// ============================================================================
// Recommendation Types
// ============================================================================

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  actionItems: ActionItem[];
  estimatedScoreImprovement: number;
}

export interface ActionItem {
  id: string;
  action: string;
  section: string;
  example?: string;
  completed: boolean;
}

export type RecommendationCategory = 
  | 'Content'
  | 'Skills'
  | 'Keywords'
  | 'Formatting'
  | 'Structure'
  | 'Achievements'
  | 'Experience'
  | 'Education'
  | 'ATS Optimization';

// ============================================================================
// Metadata Types
// ============================================================================

export interface AnalysisMetadata {
  analysisVersion: string;
  analyzedAt: Date;
  processingTimeMs: number;
  resumeWordCount: number;
  jdWordCount: number;
  confidenceScore: number; // 0-100
  dataQuality: DataQuality;
  limitations: string[];
}

export interface DataQuality {
  resumeQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  jdQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  parseSuccess: boolean;
  completenessScore: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface AnalysisConfig {
  weights: {
    keywordMatching: number;
    skillsMatch: number;
    sectionCompleteness: number;
    experienceRelevance: number;
  };
  thresholds: {
    excellent: number;
    good: number;
    fair: number;
  };
  minWordCount: {
    summary: number;
    experience: number;
  };
}

export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  weights: {
    keywordMatching: 30,
    skillsMatch: 30,
    sectionCompleteness: 30,
    experienceRelevance: 10,
  },
  thresholds: {
    excellent: 80,
    good: 60,
    fair: 40,
  },
  minWordCount: {
    summary: 30,
    experience: 50,
  },
};
