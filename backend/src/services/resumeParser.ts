import fs from 'fs';
import path from 'path';

interface ResumeContent {
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

export const parseResumeFile = async (filePath: string, mimeType: string): Promise<ResumeContent> => {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') {
    return parsePDF(filePath);
  } else if (ext === '.docx') {
    return parseDOCX(filePath);
  } else {
    throw new Error('Unsupported file format');
  }
};

const parsePDF = async (filePath: string): Promise<ResumeContent> => {
  try {
    const pdf = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    return parseTextToResume(data.text);
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
};

const parseDOCX = async (filePath: string): Promise<ResumeContent> => {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    
    return parseTextToResume(result.value);
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
};

const parseTextToResume = (text: string): ResumeContent => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const content: ResumeContent = {
    personalInfo: {},
    experience: [],
    education: [],
    skills: []
  };

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/gi;
  const urlRegex = /https?:\/\/[^\s]+/g;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkedinMatch = text.match(linkedinRegex);
  const urlMatch = text.match(urlRegex);

  if (emailMatch) content.personalInfo.email = emailMatch[0];
  if (phoneMatch) content.personalInfo.phone = phoneMatch[0];
  if (linkedinMatch) content.personalInfo.linkedin = linkedinMatch[0];
  if (urlMatch) content.personalInfo.portfolio = urlMatch[0];

  const nameCandidate = lines[0];
  if (nameCandidate && !nameCandidate.includes('@') && nameCandidate.length < 50) {
    content.personalInfo.name = nameCandidate;
  }

  const sections = {
    summary: /^(summary|objective|profile|professional\s+summary)/i,
    experience: /^(experience|work\s+experience|employment|professional\s+experience)/i,
    education: /^(education|academic|qualification)/i,
    skills: /^(skills|technical\s+skills|core\s+competencies|technologies)/i,
    projects: /^(projects|portfolio|key\s+projects)/i,
    certifications: /^(certifications|certificates|licenses|professional\s+certifications)/i
  };

  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    for (const [section, regex] of Object.entries(sections)) {
      if (regex.test(line)) {
        currentSection = section;
        break;
      }
    }

    if (currentSection === 'skills' && line.length > 2) {
      const skills = line.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0);
      if (skills.length > 0) {
        content.skills.push(...skills);
      }
    }
  }

  if (content.skills.length === 0) {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQL', 'NoSQL',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
      'HTML', 'CSS', 'SASS', 'Tailwind', 'REST', 'GraphQL', 'API'
    ];
    
    for (const skill of commonSkills) {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        content.skills.push(skill);
      }
    }
  }

  return content;
};
