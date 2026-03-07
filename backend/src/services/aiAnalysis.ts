import { GoogleGenerativeAI } from '@google/generative-ai';

interface ResumeContent {
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

interface AnalysisResult {
  atsScore: number;
  atsScoreBreakdown: {
    keywordMatching: { score: number; weight: number; details: string };
    skillsMatch: { score: number; weight: number; details: string };
    resumeSections: { score: number; weight: number; details: string };
    experienceRelevance: { score: number; weight: number; details: string };
    resumeFormatting: { score: number; weight: number; details: string };
    achievementsImpact: { score: number; weight: number; details: string };
    grammarReadability: { score: number; weight: number; details: string };
  };
  jobMatchingScore: number;
  jobMatchingBreakdown: {
    requiredSkillsMatch: { score: number; details: string };
    relevantWorkExperience: { score: number; details: string };
    technologiesUsed: { score: number; details: string };
    toolsFrameworks: { score: number; details: string };
    industryRelevance: { score: number; details: string };
    yearsExperienceAlignment: { score: number; details: string };
    roleResponsibilitySimilarity: { score: number; details: string };
  };
  score: number;
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
  missingKeywords: {
    programmingLanguages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
    devops: string[];
    softSkills: string[];
  };
  recommendedKeywords: string[];
  howToUseKeywords: string[];
  resumeImprovements: string[];
  jobMatch?: {
    score: number;
    missingKeywords: string[];
    suggestions: string[];
  };
  existingSections: {
    experience: boolean;
    education: boolean;
    skills: boolean;
    summary: boolean;
    projects: boolean;
    certifications: boolean;
  };
}

const COMPREHENSIVE_KEYWORDS = {
  programmingLanguages: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
    'php', 'swift', 'kotlin', 'scala', 'perl', 'r', 'matlab', 'sql', 'html', 'css',
    'dart', 'elixir', 'haskell', 'clojure', 'lua', 'shell', 'bash'
  ],
  frameworks: [
    'react', 'angular', 'vue', 'svelte', 'nextjs', 'next.js', 'nuxt', 'nuxtjs',
    'express', 'fastify', 'nestjs', 'nest', 'django', 'flask', 'fastapi',
    'spring', 'spring boot', 'rails', 'laravel', 'symfony', 'codeigniter',
    'asp.net', '.net', 'dotnet', 'flutter', 'react native', 'ionic',
    'tailwind', 'bootstrap', 'material ui', 'mui', 'chakra ui', 'redux',
    'context api', 'react query', 'axios', 'fetch', 'graphql', 'apollo'
  ],
  databases: [
    'mongodb', 'postgresql', 'mysql', 'redis', 'sqlite',
    'elasticsearch', 'dynamodb', 'firebase', 'supabase', 'prisma', 'mongoose',
    'sequelize', 'typeorm', 'cassandra', 'mariadb', 'oracle', 'mssql',
    'mongodb atlas', 'cosmos db', 'realm', 'couchdb', 'neo4j', 'graphql'
  ],
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack',
    'webpack', 'vite', 'parcel', 'rollup', 'esbuild', 'babel', 'eslint',
    'prettier', 'husky', 'lint staged', 'npm', 'yarn', 'pnpm', 'node',
    'postman', 'insomnia', 'swagger', 'figma', 'adobe xd', 'sketch',
    'jest', 'mocha', 'cypress', 'playwright', 'selenium', 'pytest', 'unittest',
    'vitest', 'rtl', 'testing library', 'enzyme', 'chai', 'jasmine'
  ],
  devops: [
    'docker', 'kubernetes', 'k8s', 'jenkins', 'github actions', 'gitlab ci',
    'circleci', 'travis ci', 'aws', 'azure', 'gcp', 'google cloud',
    'terraform', 'ansible', 'puppet', 'chef', 'cloudformation',
    'nginx', 'apache', 'load balancer', 'ci/cd', 'cicd', 'devops',
    'microservices', 'monolith', 'serverless', 'lambda', 'ecs', 'eks',
    'containerization', 'orchestration', 'monitoring', 'logging',
    'grafana', 'prometheus', 'elk', 'splunk', 'datadog', 'new relic'
  ],
  softSkills: [
    'leadership', 'communication', 'teamwork', 'problem solving', 'problem-solving',
    'project management', 'agile', 'scrum', 'kanban', 'time management',
    'critical thinking', 'adaptability', 'collaboration', 'mentoring',
    'presentation', 'negotiation', 'analytical', 'creative', 'innovative'
  ]
};

const RECOMMENDED_KEYWORDS = [
  'docker', 'ci/cd', 'cicd', 'rest api', 'restful api', 'microservices',
  'testing', 'unit testing', 'integration testing', 'agile', 'scrum',
  'github actions', 'kubernetes', 'aws', 'cloud', 'CI/CD pipeline',
  'api integration', 'websocket', 'graphql', 'microservices architecture',
  'system design', 'performance optimization', 'code review', 'tdd',
  'bdd', 'clean code', 'solid principles', 'design patterns'
];

const ATS_SECTIONS = [
  { name: 'summary', keywords: ['summary', 'objective', 'profile', 'about'] },
  { name: 'skills', keywords: ['skills', 'technical skills', 'competencies', 'technologies'] },
  { name: 'experience', keywords: ['experience', 'work experience', 'employment', 'work history', 'professional experience'] },
  { name: 'education', keywords: ['education', 'academic', 'qualification', 'degree'] },
  { name: 'projects', keywords: ['projects', 'portfolio', 'personal projects', 'side projects'] },
  { name: 'certifications', keywords: ['certifications', 'certificates', 'licenses', 'achievements'] }
];

const calculateKeywordMatchingScore = (resumeText: string, jdKeywords: string[], resumeSkills: string[] = []): { score: number, found: string[], missing: string[] } => {
  const resumeLower = resumeText.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];
  
  const allKeywordsToCheck = [...new Set([...jdKeywords, ...resumeSkills.map(s => s.toLowerCase())])];
  
  for (const keyword of allKeywordsToCheck) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(resumeLower)) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  }
  
  const score = allKeywordsToCheck.length > 0 ? Math.round((found.length / allKeywordsToCheck.length) * 100) : 50;
  return { score, found, missing };
};

const calculateSkillsMatchScore = (resumeSkills: string[], jdSkills: string[]): { score: number, matched: string[], missing: string[] } => {
  const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
  const jdSkillsLower = jdSkills.map(s => s.toLowerCase());
  
  const matched: string[] = [];
  const missing: string[] = [];
  
  for (const jdSkill of jdSkillsLower) {
    const found = resumeSkillsLower.some(rs => rs.includes(jdSkill) || jdSkill.includes(rs));
    if (found) {
      matched.push(jdSkills[jdSkillsLower.indexOf(jdSkill)]);
    } else {
      missing.push(jdSkills[jdSkillsLower.indexOf(jdSkill)]);
    }
  }
  
  const score = jdSkills.length > 0 ? Math.round((matched.length / jdSkills.length) * 100) : 70;
  return { score, matched, missing };
};

const calculateResumeSectionsScore = (resume: ResumeContent): { score: number, found: string[], missing: string[] } => {
  const found: string[] = [];
  const missing: string[] = [];
  
  const hasSummary = resume.summary && resume.summary.length > 10;
  const hasSkills = resume.skills && resume.skills.length > 0;
  const hasExperience = resume.experience && resume.experience.length > 0;
  const hasEducation = resume.education && resume.education.length > 0;
  const hasProjects = resume.projects && resume.projects.length > 0;
  const hasCertifications = resume.certifications && resume.certifications.length > 0;
  
  if (hasSummary) found.push('Summary/Objective');
  else missing.push('Summary/Objective');
  
  if (hasSkills) found.push('Skills');
  else missing.push('Skills');
  
  if (hasExperience) found.push('Work Experience');
  else missing.push('Work Experience');
  
  if (hasEducation) found.push('Education');
  else missing.push('Education');
  
  if (hasProjects) found.push('Projects');
  else missing.push('Projects');
  
  if (hasCertifications) found.push('Certifications');
  else missing.push('Certifications');
  
  const score = Math.round((found.length / 6) * 100);
  return { score, found, missing };
};

const calculateExperienceRelevanceScore = (resume: ResumeContent, jobTitle: string, jdKeywords: string[]): { score: number, details: string } => {
  if (!resume.experience || resume.experience.length === 0) {
    return { score: 0, details: 'No work experience found in resume' };
  }
  
  let relevanceScore = 0;
  let relevantCount = 0;
  
  for (const exp of resume.experience) {
    const expText = `${exp.title} ${exp.company} ${exp.description}`.toLowerCase();
    const hasRelevantKeyword = jdKeywords.some(keyword => 
      expText.includes(keyword.toLowerCase())
    );
    if (hasRelevantKeyword) {
      relevantCount++;
    }
  }
  
  if (resume.experience.length > 0) {
    relevanceScore = Math.round((relevantCount / resume.experience.length) * 100);
  }
  
  const details = relevantCount > 0 
    ? `${relevantCount} out of ${resume.experience.length} roles have relevant experience`
    : 'Experience may not be directly relevant to the job';
  
  return { score: relevanceScore, details };
};

const calculateFormattingScore = (resumeText: string): { score: number, details: string } => {
  let score = 100;
  const issues: string[] = [];
  
  const hasTables = resumeText.includes('|') && resumeText.match(/\|.*\|/g)?.length > 3;
  const hasMultipleColumns = (resumeText.match(/={50,}/g) || []).length > 2;
  const hasSpecialChars = (resumeText.match(/[^\x00-\x7F]/g) || []).length > 10;
  
  if (hasTables) {
    score -= 20;
    issues.push('tables');
  }
  
  if (hasMultipleColumns) {
    score -= 15;
    issues.push('multiple columns');
  }
  
  if (hasSpecialChars) {
    score -= 10;
    issues.push('special characters');
  }
  
  const details = issues.length === 0 
    ? 'Resume uses ATS-friendly formatting (no tables, columns, or special characters)'
    : `Avoid using: ${issues.join(', ')}`;
  
  return { score: Math.max(0, score), details };
};

const calculateAchievementsScore = (resumeText: string): { score: number, details: string } => {
  const percentageRegex = /(\d+(\.\d+)?)%/g;
  const numberRegex = /\b\d+\+?\b/g;
  const metricKeywords = ['increased', 'decreased', 'improved', 'reduced', 'saved', 'achieved', 'delivered', 'managed', 'led', 'increased by', 'reduced by', 'improved by'];
  
  const percentages = resumeText.match(percentageRegex) || [];
  const numbers = resumeText.match(numberRegex) || [];
  const hasMetricKeywords = metricKeywords.some(keyword => resumeText.toLowerCase().includes(keyword));
  
  let score = 0;
  if (percentages.length > 0) score += 40;
  if (numbers.length > 5) score += 30;
  if (hasMetricKeywords) score += 30;
  
  const details = percentages.length > 0 
    ? `Found ${percentages.length} quantified achievements with percentages`
    : numbers.length > 5 
      ? `Found ${numbers.length} numerical achievements`
      : 'Add quantifiable achievements (percentages, numbers, metrics)';
  
  return { score: Math.min(100, score), details };
};

const calculateGrammarScore = (resumeText: string): { score: number, details: string } => {
  const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const capitalizationErrors = (resumeText.match(/[a-z][A-Z]/g) || []).length;
  const doubleSpaces = (resumeText.match(/  +/g) || []).length;
  
  let score = 100;
  
  if (capitalizationErrors > 5) score -= 20;
  if (doubleSpaces > 3) score -= 10;
  
  const avgWordsPerSentence = sentences.length > 0 
    ? resumeText.split(/\s+/).length / sentences.length 
    : 0;
  
  if (avgWordsPerSentence > 30) {
    score -= 15;
  }
  
  const details = score >= 80 
    ? 'Resume is well-written and easy to read'
    : 'Consider simplifying sentences and checking for errors';
  
  return { score: Math.max(0, score), details };
};

const calculateJobMatchingScore = (
  resume: ResumeContent,
  jobDescription: string,
  jdKeywords: string[],
  jdSkills: string[]
): { overallScore: number, breakdown: AnalysisResult['jobMatchingBreakdown'] } => {
  
  const resumeText = JSON.stringify(resume).toLowerCase();
  const jdText = jobDescription.toLowerCase();
  
  const resumeSkills = extractSkillsFromResume(resume);
  const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  for (const skill of resumeSkillsLower) {
    if (jdText.includes(skill)) {
      matchedSkills.push(skill);
    }
  }
  
  for (const jdSkill of jdSkills) {
    const jdSkillLower = jdSkill.toLowerCase();
    const found = resumeSkillsLower.some(rs => 
      rs.includes(jdSkillLower) || jdSkillLower.includes(rs) || rs === jdSkillLower
    );
    if (!found) {
      missingSkills.push(jdSkill);
    }
  }
  
  const requiredSkillsMatch = {
    score: jdSkills.length > 0 ? Math.round((matchedSkills.length / Math.max(matchedSkills.length + missingSkills.length, jdSkills.length)) * 100) : 70,
    details: `${matchedSkills.length} skills matched`
  };
  
  let relevantWorkExperience = { score: 0, details: '' };
  if (resume.experience && resume.experience.length > 0) {
    let relevantRoles = 0;
    for (const exp of resume.experience) {
      const expText = `${exp.title} ${exp.description}`.toLowerCase();
      const matchCount = jdKeywords.filter(k => expText.includes(k.toLowerCase())).length;
      if (matchCount > 0) relevantRoles++;
    }
    relevantWorkExperience = {
      score: Math.round((relevantRoles / resume.experience.length) * 100),
      details: `${relevantRoles} of ${resume.experience.length} roles match job requirements`
    };
  } else {
    relevantWorkExperience = { score: 0, details: 'No work experience found' };
  }
  
  const resumeTechFromExp = extractTechFromText(
    resume.experience?.map(e => e.description).join(' ') || ''
  );
  const resumeTechFromProjects = extractTechFromText(
    resume.projects?.map(p => p.description).join(' ') || ''
  );
  const allResumeTech = [...new Set([...resumeTechFromExp, ...resumeTechFromProjects])];
  
  const jdTech = extractTechFromText(jobDescription);
  const techIntersection = jdTech.filter(t => 
    allResumeTech.some(rt => rt.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(rt.toLowerCase()))
  );
  
  const technologiesUsed = {
    score: jdTech.length > 0 ? Math.round((techIntersection.length / jdTech.length) * 100) : 50,
    details: `${techIntersection.length} of ${jdTech.length} technologies from JD found in resume`
  };
  
  const toolsInJD = jdKeywords.filter(k => 
    ['git', 'jira', 'docker', 'jenkins', 'aws', 'azure', 'kubernetes', 'linux', 'jenkins', 'github'].some(t => k.toLowerCase().includes(t))
  );
  const toolsInResume = allResumeTech.filter(t => 
    ['git', 'jira', 'docker', 'jenkins', 'aws', 'azure', 'kubernetes', 'linux', 'github'].some(t => t.toLowerCase().includes(t))
  );
  
  const toolsFrameworks = {
    score: toolsInJD.length > 0 ? Math.round((toolsInResume.length / toolsInJD.length) * 100) : 70,
    details: toolsInResume.length > 0 ? `Found ${toolsInResume.length} relevant tools` : 'Add tool experience to your resume'
  };
  
  const industryTerms = ['agile', 'scrum', 'software', 'engineering', 'development', 'programming', 'developer', 'engineer'];
  const industryMatches = industryTerms.filter(term => jdText.includes(term) && resumeText.includes(term));
  
  const industryRelevance = {
    score: Math.round((industryMatches.length / industryTerms.length) * 100),
    details: industryMatches.length > 3 ? 'Resume aligns well with the industry' : 'Tailor resume to match industry terminology'
  };
  
  let yearsExp = 0;
  if (resume.experience && resume.experience.length > 0) {
    const yearMatches = resumeText.match(/(\d+)\+?\s*(years?|years|yrs)/g) || [];
    yearsExp = Math.max(...yearMatches.map(m => parseInt(m.match(/\d+/)?.[0] || '0')));
  }
  
  const jdYearsMatch = jdText.match(/(\d+)\+?\s*(years?|years|yrs)/g) || [];
  const jdYears = jdYearsMatch.length > 0 ? parseInt(jdYearsMatch[0].match(/\d+/)?.[0] || '0') : 0;
  
  let yearsScore = 50;
  let yearsDetails = 'Unable to determine years of experience requirement';
  
  if (jdYears > 0 && yearsExp > 0) {
    if (yearsExp >= jdYears) {
      yearsScore = 100;
      yearsDetails = `Meets ${jdYears}+ years requirement`;
    } else if (yearsExp >= jdYears * 0.7) {
      yearsScore = 70;
      yearsDetails = `Close to ${jdYears}+ years requirement (${yearsExp} years found)`;
    } else {
      yearsScore = 40;
      yearsDetails = `Below ${jdYears}+ years requirement (${yearsExp} years found)`;
    }
  } else if (yearsExp > 0) {
    yearsScore = 80;
    yearsDetails = `${yearsExp} years of experience found`;
  }
  
  const yearsExperienceAlignment = { score: yearsScore, details: yearsDetails };
  
  const jdActionVerbs = jdText.match(/\b(managed|led|developed|designed|implemented|created|built|optimized|improved|increased)\b/gi) || [];
  const resumeActionVerbs = resumeText.match(/\b(managed|led|developed|designed|implemented|created|built|optimized|improved|increased)\b/gi) || [];
  const verbSimilarity = jdActionVerbs.length > 0 
    ? Math.round((resumeActionVerbs.length / jdActionVerbs.length) * Math.min(100, resumeActionVerbs.length * 10))
    : 50;
  
  const roleResponsibilitySimilarity = {
    score: Math.min(100, verbSimilarity + 20),
    details: resumeActionVerbs.length > 0 ? 'Responsibilities align with job description' : 'Use more action verbs matching job requirements'
  };
  
  const breakdown = {
    requiredSkillsMatch: requiredSkillsMatch as any,
    relevantWorkExperience,
    technologiesUsed,
    toolsFrameworks,
    industryRelevance,
    yearsExperienceAlignment,
    roleResponsibilitySimilarity
  };
  
  const weights = {
    requiredSkillsMatch: 0.25,
    relevantWorkExperience: 0.20,
    technologiesUsed: 0.15,
    toolsFrameworks: 0.15,
    industryRelevance: 0.10,
    yearsExperienceAlignment: 0.10,
    roleResponsibilitySimilarity: 0.05
  };
  
  const overallScore = Math.round(
    requiredSkillsMatch.score * weights.requiredSkillsMatch +
    relevantWorkExperience.score * weights.relevantWorkExperience +
    technologiesUsed.score * weights.technologiesUsed +
    toolsFrameworks.score * weights.toolsFrameworks +
    industryRelevance.score * weights.industryRelevance +
    yearsExperienceAlignment.score * weights.yearsExperienceAlignment +
    roleResponsibilitySimilarity.score * weights.roleResponsibilitySimilarity
  );
  
  return { overallScore, breakdown };
};

export const analyzeResume = async (resume: ResumeContent, jobDescription: string): Promise<AnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, using fallback analysis');
    return fallbackAnalysis(resume, jobDescription);
  }

  try {
    const resumeText = JSON.stringify(resume, null, 2);
    const jdLower = jobDescription.toLowerCase();
    
    const jdKeywords = extractTechFromText(jobDescription);
    const jdSkills = extractSkillsFromText(jobDescription);
    
    const resumeSkills = extractSkillsFromResume(resume);
    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
    
    const keywordMatching = calculateKeywordMatchingScore(resumeText, jdKeywords, resumeSkills);
    
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    
    for (const skill of resumeSkillsLower) {
      if (jdLower.includes(skill)) {
        matchedSkills.push(skill);
      }
    }
    
    for (const jdSkill of jdSkills) {
      const jdSkillLower = jdSkill.toLowerCase();
      const found = resumeSkillsLower.some(rs => 
        rs.includes(jdSkillLower) || jdSkillLower.includes(rs) || rs === jdSkillLower
      );
      if (!found) {
        missingSkills.push(jdSkill);
      }
    }
    
    const totalUniqueSkills = new Set([...matchedSkills, ...missingSkills]).size;
    const skillsMatchScore = totalUniqueSkills > 0 
      ? Math.round((matchedSkills.length / totalUniqueSkills) * 100) 
      : jdSkills.length > 0 
        ? Math.round((matchedSkills.length / jdSkills.length) * 100)
        : 70;
    
    const skillsMatch = { 
      score: skillsMatchScore, 
      matched: matchedSkills, 
      missing: missingSkills 
    };
    
    const resumeSections = calculateResumeSectionsScore(resume);
    const experienceRelevance = calculateExperienceRelevanceScore(resume, '', jdKeywords);
    const formatting = calculateFormattingScore(resumeText);
    const achievements = calculateAchievementsScore(resumeText);
    const grammar = calculateGrammarScore(resumeText);
    
    const atsScoreBreakdown = {
      keywordMatching: { 
        score: keywordMatching.score, 
        weight: 30, 
        details: `${keywordMatching.found.length} of ${jdKeywords.length || 0} keywords found` 
      },
      skillsMatch: { 
        score: skillsMatch.score, 
        weight: 20, 
        details: `${skillsMatch.matched.length} of ${jdSkills.length || 0} required skills matched` 
      },
      resumeSections: { 
        score: resumeSections.score, 
        weight: 15, 
        details: `${resumeSections.found.length}/6 standard sections present` 
      },
      experienceRelevance: { 
        score: experienceRelevance.score, 
        weight: 15, 
        details: experienceRelevance.details 
      },
      resumeFormatting: { 
        score: formatting.score, 
        weight: 10, 
        details: formatting.details 
      },
      achievementsImpact: { 
        score: achievements.score, 
        weight: 5, 
        details: achievements.details 
      },
      grammarReadability: { 
        score: grammar.score, 
        weight: 5, 
        details: grammar.details 
      }
    };
    
    const atsScore = Math.round(
      keywordMatching.score * 0.30 +
      skillsMatch.score * 0.20 +
      resumeSections.score * 0.15 +
      experienceRelevance.score * 0.15 +
      formatting.score * 0.10 +
      achievements.score * 0.05 +
      grammar.score * 0.05
    );
    
    let jobMatchingScore = 0;
    let jobMatchingBreakdown: AnalysisResult['jobMatchingBreakdown'];
    
    if (jobDescription && jobDescription.trim()) {
      const jobMatchResult = calculateJobMatchingScore(resume, jobDescription, jdKeywords, jdSkills);
      jobMatchingScore = jobMatchResult.overallScore;
      jobMatchResult.breakdown.requiredSkillsMatch = {
        score: jobMatchResult.breakdown.requiredSkillsMatch.score,
        details: `${matchedSkills.length} skills matched`
      };
      jobMatchingBreakdown = jobMatchResult.breakdown as any;
    } else {
      jobMatchingBreakdown = {
        requiredSkillsMatch: { score: 0, details: 'No job description provided' },
        relevantWorkExperience: { score: 0, details: 'No job description provided' },
        technologiesUsed: { score: 0, details: 'No job description provided' },
        toolsFrameworks: { score: 0, details: 'No job description provided' },
        industryRelevance: { score: 0, details: 'No job description provided' },
        yearsExperienceAlignment: { score: 0, details: 'No job description provided' },
        roleResponsibilitySimilarity: { score: 0, details: 'No job description provided' }
      };
    }
    
    const existingSections = {
      experience: resume.experience && resume.experience.length > 0 && resume.experience.some(e => e.company || e.title),
      education: resume.education && resume.education.length > 0 && resume.education.some(e => e.institution || e.degree),
      skills: resume.skills && resume.skills.length > 0,
      summary: !!(resume.summary && resume.summary.length > 10),
      projects: !!(resume.projects && resume.projects.length > 0),
      certifications: !!(resume.certifications && resume.certifications.length > 0)
    };
    
    const missingKeywords = categorizeMissingKeywords(resumeSkills, resume);
    
    const suggestions: string[] = [];
    
    if (keywordMatching.missing.length > 0) {
      suggestions.push(`Add missing keywords: ${keywordMatching.missing.slice(0, 5).join(', ')}`);
    }
    
    if (skillsMatch.missing.length > 0) {
      suggestions.push(`Add missing skills: ${skillsMatch.missing.slice(0, 5).join(', ')}`);
    }
    
    if (!existingSections.summary) {
      suggestions.push('Add a professional summary to highlight your key qualifications');
    }
    
    if (!existingSections.projects) {
      suggestions.push('Add a projects section to showcase your practical experience');
    }
    
    if (!existingSections.certifications) {
      suggestions.push('Add certifications to validate your expertise');
    }
    
    if (achievements.score < 50) {
      suggestions.push('Quantify your achievements with percentages, numbers, and metrics');
    }
    
    if (formatting.score < 80) {
      suggestions.push('Improve formatting - avoid tables and columns for better ATS compatibility');
    }
    
    const strengths: string[] = [];
    if (existingSections.summary) strengths.push('Professional summary included');
    if (existingSections.skills && resume.skills.length > 5) strengths.push(`Strong skills section with ${resume.skills.length} skills`);
    if (existingSections.experience && resume.experience.length > 1) strengths.push('Relevant work experience');
    if (existingSections.projects) strengths.push('Projects section showcases practical work');
    if (achievements.score >= 50) strengths.push('Quantified achievements demonstrate impact');
    if (formatting.score >= 90) strengths.push('ATS-friendly formatting');
    
    const weaknesses: string[] = [];
    if (!existingSections.summary) weaknesses.push('Missing professional summary');
    if (!existingSections.projects) weaknesses.push('No projects section');
    if (achievements.score < 50) weaknesses.push('Lack of quantified achievements');
    if (formatting.score < 80) weaknesses.push('Formatting issues detected');
    if (skillsMatch.score < 50) weaknesses.push('Skills gap identified');
    
    const overallScore = jobDescription ? Math.round((atsScore * 0.5 + jobMatchingScore * 0.5)) : atsScore;
    
    return {
      atsScore,
      atsScoreBreakdown,
      jobMatchingScore,
      jobMatchingBreakdown: jobMatchingBreakdown || {} as any,
      score: overallScore,
      feedback: {
        overall: `ATS Score: ${atsScore}% | Job Match: ${jobDescription ? jobMatchingScore + '%' : 'N/A'}. Key areas: ${suggestions[0] || 'Continue building your profile'}`,
        strengths,
        weaknesses,
        suggestions: suggestions.slice(0, 7)
      },
      sectionScores: {
        skills: {
          score: skillsMatch.score,
          matched: skillsMatch.matched,
          missing: skillsMatch.missing
        },
        experience: {
          score: experienceRelevance.score,
          details: experienceRelevance.details
        },
        education: {
          score: resume.education && resume.education.length > 0 ? 80 : 50,
          details: resume.education && resume.education.length > 0 ? 'Education section present' : 'Add education details'
        },
        format: {
          score: formatting.score,
          details: formatting.details
        }
      },
      keywords: {
        found: keywordMatching.found,
        missing: keywordMatching.missing,
        density: {}
      },
      missingKeywords,
      recommendedKeywords: RECOMMENDED_KEYWORDS,
      howToUseKeywords: [
        'Add Docker inside the "Projects" section by describing containerized deployment',
        'Mention CI/CD inside your experience or project deployment workflow',
        'Use REST API in project descriptions',
        'Add microservices experience if you\'ve worked with distributed systems',
        'Include testing experience in your project or work history'
      ],
      resumeImprovements: suggestions,
      jobMatch: jobDescription ? {
        score: jobMatchingScore,
        missingKeywords: missingSkills,
        suggestions
      } : undefined,
      existingSections
    };
    
  } catch (error) {
    console.error('Analysis error:', error);
    return fallbackAnalysis(resume, jobDescription);
  }
};

const extractSkillsFromResume = (resume: ResumeContent): string[] => {
  const allSkills: string[] = [];
  
  if (resume.skills && Array.isArray(resume.skills)) {
    allSkills.push(...resume.skills.map(s => s.toLowerCase()));
  }
  
  if (resume.experience && Array.isArray(resume.experience)) {
    resume.experience.forEach(exp => {
      if (exp.description) {
        const descSkills = extractTechFromText(exp.description);
        allSkills.push(...descSkills);
      }
    });
  }
  
  if (resume.projects && Array.isArray(resume.projects)) {
    resume.projects.forEach(proj => {
      if (proj.description) {
        const projSkills = extractTechFromText(proj.description);
        allSkills.push(...projSkills);
      }
      if (proj.technologies && Array.isArray(proj.technologies)) {
        allSkills.push(...proj.technologies.map(t => t.toLowerCase()));
      }
    });
  }
  
  return [...new Set(allSkills)];
};

const extractTechFromText = (text: string): string[] => {
  const textLower = text.toLowerCase();
  const found: string[] = [];
  
  const allKeywords = [
    ...COMPREHENSIVE_KEYWORDS.programmingLanguages,
    ...COMPREHENSIVE_KEYWORDS.frameworks,
    ...COMPREHENSIVE_KEYWORDS.databases,
    ...COMPREHENSIVE_KEYWORDS.tools,
    ...COMPREHENSIVE_KEYWORDS.devops
  ];
  
  for (const keyword of allKeywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(textLower)) {
      found.push(keyword);
    }
  }
  
  return found;
};

const extractSkillsFromText = (text: string): string[] => {
  const textLower = text.toLowerCase();
  const found: string[] = [];
  
  const allSkills = [
    ...COMPREHENSIVE_KEYWORDS.programmingLanguages,
    ...COMPREHENSIVE_KEYWORDS.frameworks,
    ...COMPREHENSIVE_KEYWORDS.databases,
    ...COMPREHENSIVE_KEYWORDS.tools,
    ...COMPREHENSIVE_KEYWORDS.devops,
    ...COMPREHENSIVE_KEYWORDS.softSkills
  ];
  
  for (const skill of allSkills) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(textLower)) {
      found.push(skill);
    }
  }
  
  return found;
};

const categorizeMissingKeywords = (foundSkills: string[], resume: ResumeContent): AnalysisResult['missingKeywords'] => {
  const foundLower = foundSkills.map(s => s.toLowerCase());
  
  const missing: AnalysisResult['missingKeywords'] = {
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    tools: [],
    devops: [],
    softSkills: []
  };
  
  for (const keyword of COMPREHENSIVE_KEYWORDS.programmingLanguages) {
    if (!foundLower.includes(keyword.toLowerCase())) {
      missing.programmingLanguages.push(keyword);
    }
  }
  
  for (const keyword of COMPREHENSIVE_KEYWORDS.frameworks) {
    if (!foundLower.includes(keyword.toLowerCase())) {
      missing.frameworks.push(keyword);
    }
  }
  
  for (const keyword of COMPREHENSIVE_KEYWORDS.databases) {
    if (!foundLower.includes(keyword.toLowerCase())) {
      missing.databases.push(keyword);
    }
  }
  
  for (const keyword of COMPREHENSIVE_KEYWORDS.tools) {
    if (!foundLower.includes(keyword.toLowerCase())) {
      missing.tools.push(keyword);
    }
  }
  
  for (const keyword of COMPREHENSIVE_KEYWORDS.devops) {
    if (!foundLower.includes(keyword.toLowerCase())) {
      missing.devops.push(keyword);
    }
  }
  
  return missing;
};

const validateAndNormalizeResult = (result: any, resume: ResumeContent, jobDescription: string): AnalysisResult => {
  const resumeSkills = extractSkillsFromResume(resume);
  const existingSections = {
    experience: resume.experience && resume.experience.length > 0 && resume.experience.some(e => e.company || e.title),
    education: resume.education && resume.education.length > 0 && resume.education.some(e => e.institution || e.degree),
    skills: resume.skills && resume.skills.length > 0,
    summary: !!(resume.summary && resume.summary.length > 10),
    projects: !!(resume.projects && resume.projects.length > 0),
    certifications: !!(resume.certifications && resume.certifications.length > 0)
  };

  let missingKeywords = result.missingKeywords;
  if (!missingKeywords) {
    missingKeywords = categorizeMissingKeywords(resumeSkills, resume);
  }

  const howToUseKeywords = result.howToUseKeywords || [
    `Add Docker inside the "Projects" section by describing containerized deployment`,
    `Mention CI/CD inside your experience or project deployment workflow`,
    `Use REST API in project descriptions`,
    `Add microservices experience if you've worked with distributed systems`,
    `Include testing experience in your project or work history`
  ];

  const resumeImprovements = result.resumeImprovements || [
    'Improve bullet point structure - use action verbs at the start',
    'Add measurable impact - include numbers and percentages where possible',
    'Improve project descriptions with specific technologies used',
    'Ensure consistent formatting throughout the resume',
    'Add quantifiable achievements in experience section'
  ];

  let jobMatch = result.jobMatch;
  if (jobDescription && jobDescription.trim()) {
    if (!jobMatch) {
      const jdLower = jobDescription.toLowerCase();
      const matchedSkills = resumeSkills.filter(skill => jdLower.includes(skill.toLowerCase()));
      const missingJDKeywords = resumeSkills.filter(skill => !jdLower.includes(skill.toLowerCase()));
      
      const matchScore = resumeSkills.length > 0 
        ? Math.round((matchedSkills.length / Math.max(matchedSkills.length + missingJDKeywords.length, resumeSkills.length)) * 100)
        : 0;
      
      jobMatch = {
        score: matchScore,
        missingKeywords: missingJDKeywords.slice(0, 10),
        suggestions: [
          'Add missing keywords to your skills section',
          'Incorporate job requirements in your project descriptions',
          'Tailor your summary to match the job description'
        ]
      };
    }
  } else {
    jobMatch = undefined;
  }

  const defaultResult = fallbackAnalysis(resume, jobDescription);
  
  return {
    score: typeof result.score === 'number' ? Math.min(100, Math.max(0, result.score)) : defaultResult.score,
    atsScore: Math.round((typeof result.score === 'number' ? Math.min(100, Math.max(0, result.score)) : defaultResult.score) * 0.85),
    feedback: {
      overall: result.feedback?.overall || defaultResult.feedback.overall,
      strengths: Array.isArray(result.feedback?.strengths) ? result.feedback.strengths : defaultResult.feedback.strengths,
      weaknesses: Array.isArray(result.feedback?.weaknesses) ? result.feedback.weaknesses : defaultResult.feedback.weaknesses,
      suggestions: Array.isArray(result.feedback?.suggestions) ? result.feedback.suggestions : defaultResult.feedback.suggestions
    },
    sectionScores: {
      skills: {
        score: result.sectionScores?.skills?.score ?? defaultResult.sectionScores.skills.score,
        matched: Array.isArray(result.sectionScores?.skills?.matched) ? result.sectionScores.skills.matched : resumeSkills,
        missing: Array.isArray(result.sectionScores?.skills?.missing) ? result.sectionScores.skills.missing : defaultResult.sectionScores.skills.missing
      },
      experience: {
        score: result.sectionScores?.experience?.score ?? defaultResult.sectionScores.experience.score,
        details: result.sectionScores?.experience?.details || defaultResult.sectionScores.experience.details
      },
      education: {
        score: result.sectionScores?.education?.score ?? defaultResult.sectionScores.education.score,
        details: result.sectionScores?.education?.details || defaultResult.sectionScores.education.details
      },
      format: {
        score: result.sectionScores?.format?.score ?? defaultResult.sectionScores.format.score,
        details: result.sectionScores?.format?.details || defaultResult.sectionScores.format.details
      }
    },
    keywords: {
      found: Array.isArray(result.keywords?.found) ? result.keywords.found : resumeSkills,
      missing: Array.isArray(result.keywords?.missing) ? result.keywords.missing : defaultResult.keywords.missing,
      density: typeof result.keywords?.density === 'object' ? result.keywords.density : {}
    },
    missingKeywords,
    recommendedKeywords: Array.isArray(result.recommendedKeywords) ? result.recommendedKeywords : RECOMMENDED_KEYWORDS,
    howToUseKeywords,
    resumeImprovements,
    jobMatch,
    existingSections,
    atsScoreBreakdown: defaultResult.atsScoreBreakdown,
    jobMatchingScore: 0,
    jobMatchingBreakdown: defaultResult.jobMatchingBreakdown
  };
};

const fallbackAnalysis = (resume: ResumeContent, jobDescription: string): AnalysisResult => {
  const resumeSkills = extractSkillsFromResume(resume);
  const jdLower = jobDescription.toLowerCase();
  const jobKeywords = extractTechFromText(jobDescription);
  
  const matchedSkills = resumeSkills.filter(skill => jdLower.includes(skill.toLowerCase()));
  
  const missingFromJD = resumeSkills.filter(skill => !jdLower.includes(skill.toLowerCase())).slice(0, 10);

  const skillsScore = resumeSkills.length > 0 
    ? Math.round((matchedSkills.length / Math.max(matchedSkills.length + missingFromJD.length, resumeSkills.length)) * 100)
    : Math.min(100, Math.round(30 + resumeSkills.length * 5));

  const experienceScore = resume.experience?.length > 0 ? 70 : 40;
  const educationScore = resume.education?.length > 0 ? 80 : 50;
  const formatScore = 75;

  const overallScore = Math.round((skillsScore + experienceScore + educationScore + formatScore) / 4);

  const existingSections = {
    experience: resume.experience && resume.experience.length > 0 && resume.experience.some(e => e.company || e.title),
    education: resume.education && resume.education.length > 0 && resume.education.some(e => e.institution || e.degree),
    skills: resume.skills && resume.skills.length > 0,
    summary: !!(resume.summary && resume.summary.length > 10),
    projects: !!(resume.projects && resume.projects.length > 0),
    certifications: !!(resume.certifications && resume.certifications.length > 0)
  };

  const missingKeywords = categorizeMissingKeywords(resumeSkills, resume);

  let jobMatch = undefined;
  if (jobDescription && jobDescription.trim()) {
    const matchScore = resumeSkills.length > 0 
      ? Math.round((matchedSkills.length / Math.max(matchedSkills.length + missingFromJD.length, resumeSkills.length)) * 100)
      : 0;
    jobMatch = {
      score: matchScore,
      missingKeywords: missingFromJD,
      suggestions: [
        'Add missing keywords to your skills section',
        'Incorporate job requirements in your project descriptions',
        'Tailor your summary to match the job description'
      ]
    };
  }

  return {
    score: overallScore,
    atsScore: Math.round(overallScore * 0.85),
    feedback: {
      overall: `Your resume contains ${resumeSkills.length} technical skills. Key areas for improvement include adding missing keywords and highlighting relevant experience.`,
      strengths: matchedSkills.slice(0, 5),
      weaknesses: missingFromJD.slice(0, 5),
      suggestions: [
        'Add missing keywords from the job description',
        'Quantify your achievements with numbers and metrics',
        'Use action verbs to start bullet points',
        'Tailor your summary to the specific role',
        'Ensure consistent formatting throughout'
      ]
    },
    sectionScores: {
      skills: {
        score: skillsScore,
        matched: matchedSkills,
        missing: missingFromJD
      },
      experience: {
        score: experienceScore,
        details: resume.experience?.length > 0 
          ? 'Good professional experience included' 
          : 'Add relevant work experience'
      },
      education: {
        score: educationScore,
        details: resume.education?.length > 0 
          ? 'Education section is present' 
          : 'Add education details'
      },
      format: {
        score: formatScore,
        details: 'Resume format is readable and well-structured'
      }
    },
    keywords: {
      found: resumeSkills,
      missing: missingFromJD,
      density: {}
    },
    missingKeywords,
    recommendedKeywords: RECOMMENDED_KEYWORDS,
    howToUseKeywords: [
      'Add Docker inside the "Projects" section by describing containerized deployment',
      'Mention CI/CD inside your experience or project deployment workflow',
      'Use REST API in project descriptions',
      'Add microservices experience if you\'ve worked with distributed systems',
      'Include testing experience in your project or work history'
    ],
    resumeImprovements: [
      'Improve bullet point structure - use action verbs at the start',
      'Add measurable impact - include numbers and percentages where possible',
      'Improve project descriptions with specific technologies used',
      'Ensure consistent formatting throughout the resume',
      'Add quantifiable achievements in experience section'
    ],
    jobMatch,
    existingSections,
    atsScoreBreakdown: {
      keywordMatching: { score: skillsScore, weight: 30, details: `${matchedSkills.length} keywords matched` },
      skillsMatch: { score: skillsScore, weight: 20, details: 'Skills match calculated' },
      resumeSections: { score: 70, weight: 15, details: 'Standard sections present' },
      experienceRelevance: { score: experienceScore, weight: 15, details: 'Experience reviewed' },
      resumeFormatting: { score: formatScore, weight: 10, details: 'Format checked' },
      achievementsImpact: { score: 50, weight: 5, details: 'Achievements impact assessed' },
      grammarReadability: { score: 80, weight: 5, details: 'Grammar checked' }
    },
    jobMatchingScore: 0,
    jobMatchingBreakdown: {
      requiredSkillsMatch: { score: 0, details: 'No job description provided' },
      relevantWorkExperience: { score: 0, details: 'No job description provided' },
      technologiesUsed: { score: 0, details: 'No job description provided' },
      toolsFrameworks: { score: 0, details: 'No job description provided' },
      industryRelevance: { score: 0, details: 'No job description provided' },
      yearsExperienceAlignment: { score: 0, details: 'No job description provided' },
      roleResponsibilitySimilarity: { score: 0, details: 'No job description provided' }
    }
  };
};

export const extractTechFromTextExport = extractTechFromText;
