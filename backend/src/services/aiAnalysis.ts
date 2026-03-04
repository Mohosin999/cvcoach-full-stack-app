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
}

interface AnalysisResult {
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

export const analyzeResume = async (resume: ResumeContent, jobDescription: string): Promise<AnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, using fallback analysis');
    return fallbackAnalysis(resume, jobDescription);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const resumeText = JSON.stringify(resume, null, 2);
    
    console.log('=== RESUME CONTENT ===');
    console.log(resumeText);
    console.log('=== JD CONTENT ===');
    console.log(jobDescription.substring(0, 500) + '...');
    
    const prompt = `You are an expert resume analyzer. Analyze the following resume against the job description and provide a detailed analysis in JSON format.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide a JSON response with the following structure (no additional text):
{
  "score": <overall match score 0-100>,
  "atsScore": <ATS compatibility score 0-100>,
  "feedback": {
    "overall": "<2-3 sentence overall assessment>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>", "<suggestion 5>"]
  },
  "sectionScores": {
    "skills": {
      "score": <0-100>,
      "matched": ["<skill 1>", "<skill 2>"],
      "missing": ["<missing skill 1>", "<missing skill 2>"]
    },
    "experience": {
      "score": <0-100>,
      "details": "<brief assessment of experience relevance>"
    },
    "education": {
      "score": <0-100>,
      "details": "<brief assessment of education requirements>"
    },
    "format": {
      "score": <0-100>,
      "details": "<brief assessment of format and readability>"
    }
  },
  "keywords": {
    "found": ["<keyword 1>", "<keyword 2>"],
    "missing": ["<keyword 1>", "<keyword 2>"],
    "density": {"<keyword>": <count>}
  }
}

Make sure the JSON is valid and complete.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('=== AI RESPONSE ===');
    console.log(response.substring(0, 1000) + '...');
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return validateAndNormalizeResult(parsed);
    }
    
    return fallbackAnalysis(resume, jobDescription);
  } catch (error) {
    console.error('Gemini API error:', error);
    return fallbackAnalysis(resume, jobDescription);
  }
};

const validateAndNormalizeResult = (result: any): AnalysisResult => {
  const defaultResult = fallbackAnalysis({ personalInfo: {}, experience: [], education: [], skills: [] }, '');
  
  return {
    score: typeof result.score === 'number' ? Math.min(100, Math.max(0, result.score)) : defaultResult.score,
    atsScore: typeof result.atsScore === 'number' ? Math.min(100, Math.max(0, result.atsScore)) : defaultResult.atsScore,
    feedback: {
      overall: result.feedback?.overall || defaultResult.feedback.overall,
      strengths: Array.isArray(result.feedback?.strengths) ? result.feedback.strengths : defaultResult.feedback.strengths,
      weaknesses: Array.isArray(result.feedback?.weaknesses) ? result.feedback.weaknesses : defaultResult.feedback.weaknesses,
      suggestions: Array.isArray(result.feedback?.suggestions) ? result.feedback.suggestions : defaultResult.feedback.suggestions
    },
    sectionScores: {
      skills: {
        score: result.sectionScores?.skills?.score ?? defaultResult.sectionScores.skills.score,
        matched: Array.isArray(result.sectionScores?.skills?.matched) ? result.sectionScores.skills.matched : defaultResult.sectionScores.skills.matched,
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
      found: Array.isArray(result.keywords?.found) ? result.keywords.found : defaultResult.keywords.found,
      missing: Array.isArray(result.keywords?.missing) ? result.keywords.missing : defaultResult.keywords.missing,
      density: typeof result.keywords?.density === 'object' ? result.keywords.density : defaultResult.keywords.density
    }
  };
};

const fallbackAnalysis = (resume: ResumeContent, jobDescription: string): AnalysisResult => {
  const jdLower = jobDescription.toLowerCase();
  
  const resumeSkills = (resume.skills || []).map(s => s.toLowerCase());
  const jobKeywords = extractKeywords(jobDescription);
  
  const matchedSkills = resumeSkills.filter(skill => 
    jdLower.includes(skill.toLowerCase())
  );
  
  const missingSkills = jobKeywords
    .filter(keyword => 
      !resumeSkills.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))
    )
    .slice(0, 10);

  const skillsScore = jobKeywords.length > 0 
    ? Math.round((matchedSkills.length / jobKeywords.length) * 100) 
    : 50;

  const experienceScore = resume.experience?.length > 0 ? 70 : 40;
  const educationScore = resume.education?.length > 0 ? 80 : 50;
  const formatScore = 75;

  const overallScore = Math.round((skillsScore + experienceScore + educationScore + formatScore) / 4);

  return {
    score: overallScore,
    atsScore: Math.round(overallScore * 0.85),
    feedback: {
      overall: `Your resume has a ${overallScore}% match with the job description. Key areas for improvement include adding missing keywords and highlighting relevant experience.`,
      strengths: matchedSkills.slice(0, 5),
      weaknesses: missingSkills.slice(0, 5),
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
        missing: missingSkills
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
      found: matchedSkills,
      missing: missingSkills,
      density: {}
    }
  };
};

const extractKeywords = (text: string): string[] => {
  const commonKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
    'mongodb', 'postgresql', 'mysql', 'redis', 'sql', 'nosql',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
    'html', 'css', 'sass', 'tailwind', 'rest', 'graphql', 'api',
    'agile', 'scrum', 'jira', 'ci/cd', 'devops', 'machine learning', 'data analysis',
    'leadership', 'communication', 'teamwork', 'problem solving', 'project management'
  ];

  const textLower = text.toLowerCase();
  
  return commonKeywords.filter(keyword => 
    textLower.includes(keyword.toLowerCase())
  );
};
