import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return new GoogleGenerativeAI(apiKey);
};

const MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8k'
];

const getModel = async () => {
  const genAI = getGenAI();
  
  for (const modelName of MODELS) {
    try {
      return genAI.getGenerativeModel({ model: modelName });
    } catch (error: any) {
      console.log(`Model ${modelName} failed, trying next...`);
      continue;
    }
  }
  
  throw new Error('No available models found. Please check your API quota.');
};

const generateWithFallback = async (prompt: string): Promise<string> => {
  const genAI = getGenAI();
  
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.log(`Model ${modelName} error:`, error.message);
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('API quota exceeded. Please check your Google AI Studio billing settings or try again later.');
};

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  'software engineer': ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'AWS', 'Docker', 'REST API', 'Agile'],
  'frontend developer': ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript', 'Redux', 'Tailwind', 'Webpack', 'Figma', 'Responsive Design'],
  'backend developer': ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'REST API', 'Docker', 'AWS', 'Git', 'Redis', 'GraphQL'],
  'full stack developer': ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'SQL', 'Docker', 'AWS', 'Git', 'REST API'],
  'data scientist': ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'SQL', 'Statistics', 'Data Visualization', 'Scikit-learn', 'NLP', 'Deep Learning'],
  'devops engineer': ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'CI/CD', 'Linux', 'Ansible', 'CloudFormation', 'Monitoring'],
  'ui/ux designer': ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing', 'HTML/CSS', 'Design Systems', 'Sketch', 'Zeplin', 'Usability Testing'],
  'product manager': ['Product Strategy', 'Agile', 'User Research', 'Data Analysis', 'Roadmapping', 'Stakeholder Management', 'Jira', 'SQL', 'A/B Testing', 'Scrum'],
  'data analyst': ['SQL', 'Python', 'Excel', 'Tableau', 'Power BI', 'Data Visualization', 'Statistics', 'Pandas', 'R', 'Reporting'],
  'machine learning engineer': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Scikit-learn', 'NLP', 'Computer Vision', 'MLOps', 'AWS'],
  'mobile developer': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Firebase', 'REST API', 'Mobile UI', 'App Store'],
  'cloud engineer': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Cloud Architecture', 'DevOps', 'Networking'],
  'qa engineer': ['Selenium', 'Jest', 'Cypress', 'Manual Testing', 'Automation Testing', 'API Testing', 'Jira', 'CI/CD', 'Performance Testing', 'Test Planning'],
  'security engineer': ['Network Security', 'Penetration Testing', 'SIEM', 'Firewalls', 'Encryption', 'Compliance', 'Risk Assessment', 'Incident Response', 'Python', 'Security Tools'],
  'project manager': ['Project Planning', 'Agile', 'Scrum', 'Risk Management', 'Stakeholder Management', 'Jira', 'Budgeting', 'Team Leadership', 'Communication', 'MS Project'],
};

const getDefaultSkills = (jobTitle: string): string[] => {
  const titleLower = jobTitle.toLowerCase();
  
  for (const [key, skills] of Object.entries(SKILL_SUGGESTIONS)) {
    if (titleLower.includes(key)) {
      return skills.slice(0, 6);
    }
  }
  
  return ['Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Leadership', 'Analytical Skills'];
};

export const generateSummary = async (jobTitle: string, skills: string[], experience?: string) => {
  const skillsText = skills.length > 0 ? skills.join(', ') : 'various relevant skills';
  const expText = experience ? `\nExperience: ${experience}` : '';
  
  const prompt = `Generate a professional summary for a resume for a ${jobTitle} position.
The person has skills in: ${skillsText}.${expText}

Write a 2-3 sentence professional summary that:
- Highlights their expertise and years of experience
- Mentions key skills relevant to the role
- Is impactful and ATS-friendly
- Do not use bullet points or list format
- Is concise and impactful

Just return the summary text as plain paragraphs, nothing else.`;

  const response = await generateWithFallback(prompt);
  let text = response.trim();
  
  // Clean up any markdown or HTML that might be included
  text = text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
  
  return text;
};

export const generateExperienceBulletPoints = async (
  jobTitle: string,
  company: string,
  yearsExperience: number = 1,
  skills: string[] = []
) => {
  const skillsText = skills.length > 0 ? skills.join(', ') : 'relevant technical skills';
  
  const prompt = `Generate 4-6 professional bullet points for a ${jobTitle} position at ${company}.
The person has ${yearsExperience} year(s) of experience and skills in: ${skillsText}.

Each bullet point should:
- Start with action verbs (Led, Developed, Implemented, Managed, Optimized, etc.)
- Include quantifiable achievements (percentages, numbers, metrics when possible)
- Be ATS-friendly
- Be specific and impactful
- Show career progression and impact

Return ONLY bullet points in HTML format, one per line with <li> tags, wrapped in <ul> tags. Example: <ul><li>Led a team of 5 developers...</li><li>Increased revenue by 25%...</li></ul>`;

  const response = await generateWithFallback(prompt);
  
  // If response already contains HTML, use it directly
  if (response.includes('<ul>') || response.includes('<li>')) {
    return response;
  }
  
  // Otherwise, convert plain text bullet points to HTML
  const bulletPoints = response
    .split('\n')
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(line => line.length > 0);
  
  const htmlBullets = bulletPoints.map(bp => `<li>${bp}</li>`).join('\n');
  return `<ul>${htmlBullets}</ul>`;
};

export const generateProjectDescription = async (
  projectName: string,
  technologies: string[] = []
) => {
  const techText = technologies.length > 0 ? technologies.join(', ') : 'modern technologies';
  
  const prompt = `Generate a professional project description for a project called "${projectName}".
Technologies used: ${techText}.

Generate 3-5 bullet points that:
- Describe what the project does and its purpose
- Highlight key features and functionalities
- Mention technologies and tools used
- Include quantifiable outcomes if applicable
- Are ATS-friendly and impactful

Return ONLY bullet points in HTML format, one per line with <li> tags, wrapped in <ul> tags. Example: <ul><li>Built a full-stack e-commerce platform...</li><li>Implemented payment gateway integration...</li></ul>`;

  const response = await generateWithFallback(prompt);
  
  // If response already contains HTML, use it directly
  if (response.includes('<ul>') || response.includes('<li>')) {
    return response;
  }
  
  // Otherwise, convert plain text bullet points to HTML
  const bulletPoints = response
    .split('\n')
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(line => line.length > 0);
  
  const htmlBullets = bulletPoints.map(bp => `<li>${bp}</li>`).join('\n');
  return `<ul>${htmlBullets}</ul>`;
};

export const generateSkills = async (jobTitle: string): Promise<string[]> => {
  const defaultSkills = getDefaultSkills(jobTitle);
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return defaultSkills;
  }
  
  try {
    const prompt = `Suggest exactly 6 relevant technical and soft skills for a ${jobTitle} position.
Prioritize the most important and commonly required skills for this role.

Return ONLY the skills, one per line, with no numbering, no descriptions, no extra text.`;

    const response = await generateWithFallback(prompt);
    
    const skills = response
      .split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0 && line.length < 50)
      .slice(0, 6);
    
    return skills.length >= 3 ? skills : defaultSkills;
  } catch (error) {
    console.error('Error generating skills with AI:', error);
    return defaultSkills;
  }
};

export const generateAchievement = async (jobTitle: string, experience?: string) => {
  const expText = experience ? `Experience: ${experience}` : '';
  
  const prompt = `Generate 3-5 impressive professional achievements for a ${jobTitle}.${expText ? '\n' + expText : ''}

Each achievement should:
- Include quantifiable metrics (percentages, numbers, dollar amounts)
- Start with action verbs
- Show impact and results
- Be ATS-friendly
- Be specific and measurable

Return ONLY the achievements, one per line, with no numbering or extra text.`;

  const response = await generateWithFallback(prompt);
  
  const achievements = response
    .split('\n')
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(line => line.length > 0);
  
  return achievements;
};

export const generateCertification = async (jobTitle: string) => {
  const prompt = `Suggest 2-3 relevant professional certifications for a ${jobTitle} position.
These should be well-known, industry-recognized certifications.

Return ONLY the certification names, one per line, with no numbering or extra text.`;

  const response = await generateWithFallback(prompt);
  
  const certs = response
    .split('\n')
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(line => line.length > 0 && line.length < 100);
  
  return certs.map(cert => ({
    title: cert,
    link: '',
    date: ''
  }));
};
