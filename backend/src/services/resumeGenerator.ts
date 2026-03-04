import { GoogleGenerativeAI } from '@google/generative-ai';

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

export const generateImprovedResume = async (
  resume: ResumeContent,
  jobDescription: string,
  analysisFeedback: any
): Promise<ResumeContent> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, using basic improvements');
    return applyBasicImprovements(resume, jobDescription, analysisFeedback);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const resumeText = JSON.stringify(resume, null, 2);
    const feedback = JSON.stringify(analysisFeedback, null, 2);
    
    const prompt = `You are an expert resume writer. Improve the following resume based on the job description and feedback. 

Original Resume:
${resumeText}

Job Description:
${jobDescription}

Analysis Feedback:
${feedback}

Provide an improved version of the resume in JSON format. Keep the same structure but:
1. Improve the summary to be more targeted to the job
2. Enhance experience descriptions with action verbs and quantifiable achievements
3. Add missing keywords naturally into skills or experience
4. Keep all original information but improve the wording
5. Maintain ATS-friendly format

Return ONLY valid JSON (no additional text):
{
  "personalInfo": { ... },
  "summary": "improved summary",
  "experience": [...],
  "education": [...],
  "skills": [...],
  "projects": [...],
  "certifications": [...],
  "languages": [...]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const improved = JSON.parse(jsonMatch[0]);
      return validateImprovedResume(improved, resume);
    }
    
    return applyBasicImprovements(resume, jobDescription, analysisFeedback);
  } catch (error) {
    console.error('Gemini API error in generate:', error);
    return applyBasicImprovements(resume, jobDescription, analysisFeedback);
  }
};

const validateImprovedResume = (improved: any, original: ResumeContent): ResumeContent => {
  return {
    personalInfo: improved.personalInfo || original.personalInfo,
    summary: improved.summary || original.summary,
    experience: Array.isArray(improved.experience) ? improved.experience : original.experience,
    education: Array.isArray(improved.education) ? improved.education : original.education,
    skills: Array.isArray(improved.skills) ? improved.skills : original.skills,
    projects: Array.isArray(improved.projects) ? improved.projects : original.projects,
    certifications: Array.isArray(improved.certifications) ? improved.certifications : original.certifications,
    languages: Array.isArray(improved.languages) ? improved.languages : original.languages
  };
};

const applyBasicImprovements = (
  resume: ResumeContent, 
  jobDescription: string, 
  feedback: any
): ResumeContent => {
  const jdLower = jobDescription.toLowerCase();
  
  const improved = { ...resume };
  
  if (feedback?.keywords?.missing) {
    const missingKeywords = feedback.keywords.missing.slice(0, 5);
    const currentSkills = improved.skills || [];
    const newSkills = [...new Set([...currentSkills, ...missingKeywords])];
    improved.skills = newSkills;
  }

  if (improved.summary) {
    const summary = improved.summary;
    const actionWords = ['driven', 'experienced', 'skilled', 'passionate', 'dedicated'];
    
    if (!actionWords.some(word => summary.toLowerCase().startsWith(word))) {
      improved.summary = 'Driven professional with proven expertise. ' + summary;
    }
  }

  if (improved.experience && improved.experience.length > 0) {
    improved.experience = improved.experience.map(exp => ({
      ...exp,
      description: enhanceDescription(exp.description, jdLower)
    }));
  }

  return improved;
};

const enhanceDescription = (description: string, jdLower: string): string => {
  const actionVerbs = [
    'Led', 'Developed', 'Implemented', 'Created', 'Managed',
    'Optimized', 'Improved', 'Designed', 'Built', 'Delivered'
  ];

  const lines = description.split('. ').filter(line => line.trim().length > 0);
  
  const enhanced = lines.map(line => {
    const trimmed = line.trim();
    
    if (!actionVerbs.some(verb => trimmed.startsWith(verb))) {
      return `• ${trimmed}`;
    }
    
    return trimmed.startsWith('•') ? trimmed : `• ${trimmed}`;
  });

  return enhanced.join('. ');
};
