/**
 * Analysis Controller - Enterprise Implementation
 * Uses the new professional analysis service
 */

import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { Analysis } from "../../models/Analysis";
import { Resume } from "../../models/Resume";
import { User } from "../../models/User";
import { resumeAnalysisService } from "../../services/analysis";
import { extractSkillsFromResume, parseJobDescription } from "../../services/analysis";

export const generateAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "Resume ID is required",
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user || user.subscription.credits < 1) {
      return res.status(403).json({
        success: false,
        message: "Insufficient credits. Please upgrade your plan.",
      });
    }

    // Validate job description
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Job description is too short. Please provide a detailed job description (at least 50 characters).",
      });
    }

    // Check if job description appears to be random text
    const words = jobDescription.trim().split(/\s+/);
    const avgWordLength = jobDescription.replace(/\s/g, '').length / words.length;
    if (avgWordLength > 10 || words.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Job description appears to be invalid. Please provide a proper job description with multiple sentences.",
      });
    }

    // Convert resume content to text for analysis
    const resumeText = convertResumeToText(resume.content);

    // Validate resume has minimum content
    if (resumeText.length < 100) {
      return res.status(400).json({
        success: false,
        message: "Resume content is too short. Please upload a complete resume with work experience, skills, and education.",
      });
    }

    console.log('Starting analysis for resume:', resumeId);

    // Run professional analysis
    const analysisResult = await resumeAnalysisService.analyze({
      resume: resume.content,
      resumeText,
      jobDescription: jobDescription || "",
    });

    console.log('Analysis completed, transforming data...');

    // Transform analysis result to database format
    const analysisData = transformToAnalysisData(analysisResult, resumeId, req.user._id.toString(), jobDescription || "");

    console.log('Creating analysis record...');

    const analysis = await Analysis.create(analysisData);

    console.log('Analysis created successfully:', analysis._id);

    // Deduct credit
    user.subscription.credits -= 1;
    await user.save();

    return res.status(201).json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error analyzing resume",
    });
  }
};

/**
 * Convert resume content object to plain text
 */
function convertResumeToText(content: any): string {
  const parts: string[] = [];

  if (content.personalInfo) {
    parts.push(content.personalInfo.fullName || "");
    parts.push(content.personalInfo.jobTitle || "");
  }

  if (content.summary) {
    parts.push(content.summary);
  }

  if (content.experience && content.experience.length > 0) {
    content.experience.forEach((exp: any) => {
      parts.push(`${exp.title} at ${exp.company}`);
      parts.push(exp.description || "");
    });
  }

  if (content.skills && content.skills.length > 0) {
    parts.push(content.skills.join(" "));
  }

  if (content.projects && content.projects.length > 0) {
    content.projects.forEach((proj: any) => {
      parts.push(`${proj.name}: ${proj.description || ""}`);
    });
  }

  if (content.education && content.education.length > 0) {
    content.education.forEach((edu: any) => {
      parts.push(`${edu.degree} from ${edu.institution}`);
    });
  }

  return parts.filter(Boolean).join("\n");
}

/**
 * Transform new analysis result to database format
 */
function transformToAnalysisData(
  result: any,
  resumeId: string,
  userId: string,
  jobDescription: string
): any {
  return {
    userId,
    resumeId,
    jobDescription,
    jobTitle: "",
    company: "",
    score: result.overallScore,
    atsScore: result.atsScore,
    atsScoreBreakdown: {
      keywordMatching: {
        score: result.scoreBreakdown.ats.keywordMatching.score,
        weight: 30,
        details: result.scoreBreakdown.ats.keywordMatching.details,
      },
      skillsMatch: {
        score: result.scoreBreakdown.ats.skillsMatch.score,
        weight: 30,
        details: result.scoreBreakdown.ats.skillsMatch.details,
      },
      resumeSections: {
        score: result.scoreBreakdown.ats.sectionCompleteness.score,
        weight: 30,
        details: result.scoreBreakdown.ats.sectionCompleteness.details,
      },
      experienceRelevance: {
        score: result.scoreBreakdown.ats.experienceRelevance.score,
        weight: 10,
        details: result.scoreBreakdown.ats.experienceRelevance.details,
      },
    },
    jobMatchingBreakdown: {
      requiredSkillsMatch: {
        score: result.scoreBreakdown.jobMatch.requiredSkillsMatch.score,
        details: result.scoreBreakdown.jobMatch.requiredSkillsMatch.details,
      },
      preferredSkillsMatch: {
        score: result.scoreBreakdown.jobMatch.preferredSkillsMatch.score,
        details: result.scoreBreakdown.jobMatch.preferredSkillsMatch.details,
      },
      experienceAlignment: {
        score: result.scoreBreakdown.jobMatch.experienceAlignment.score,
        details: result.scoreBreakdown.jobMatch.experienceAlignment.details,
      },
      educationAlignment: {
        score: result.scoreBreakdown.jobMatch.educationAlignment.score,
        details: result.scoreBreakdown.jobMatch.educationAlignment.details,
      },
      responsibilityMatch: {
        score: result.scoreBreakdown.jobMatch.responsibilityMatch.score,
        details: result.scoreBreakdown.jobMatch.responsibilityMatch.details,
      },
    },
    feedback: {
      overall: generateOverallFeedback(result),
      strengths: generateStrengths(result),
      weaknesses: generateWeaknesses(result),
      suggestions: result.recommendations.slice(0, 7).map((r: any) => r.title + ": " + r.description),
    },
    sectionScores: {
      skills: {
        score: result.skillsAnalysis ? 
          Math.round((result.skillsAnalysis.matchedSkills.length / Math.max(1, result.skillsAnalysis.matchedSkills.length + result.skillsAnalysis.missingSkills.length)) * 100) : 70,
        matched: result.skillsAnalysis?.matchedSkills?.map((s: any) => s.name) || [],
        missing: result.skillsAnalysis?.missingSkills?.map((s: any) => s.name) || [],
      },
      experience: {
        score: result.experienceAnalysis?.positions?.length > 0 ? 80 : 40,
        details: result.experienceAnalysis?.positions?.length > 0 
          ? `${result.experienceAnalysis.positions.length} positions | ${result.experienceAnalysis.totalYears} years experience`
          : "No experience listed",
      },
      education: {
        score: result.sectionAnalysis?.education?.present ? 80 : 50,
        details: result.sectionAnalysis?.education?.present 
          ? "Education section present" 
          : "No education listed",
      },
      format: {
        score: Math.min(100, Math.round((result.atsScore + result.jobMatchScore) / 2)),
        details: "Resume format evaluated",
      },
    },
    keywords: {
      found: result.keywordAnalysis?.foundKeywords?.map((k: any) => k.keyword) || [],
      missing: result.keywordAnalysis?.missingKeywords?.map((k: any) => k.keyword) || [],
      density: {},
    },
    missingKeywords: {
      programmingLanguages: result.skillsAnalysis?.missingSkills
        ?.filter((s: any) => s.category === 'Programming Language')
        ?.map((s: any) => s.name) || [],
      frameworks: result.skillsAnalysis?.missingSkills
        ?.filter((s: any) => s.category === 'Framework')
        ?.map((s: any) => s.name) || [],
      databases: result.skillsAnalysis?.missingSkills
        ?.filter((s: any) => s.category === 'Database')
        ?.map((s: any) => s.name) || [],
      tools: result.skillsAnalysis?.missingSkills
        ?.filter((s: any) => s.category === 'DevOps Tool' || s.category === 'Technical Skill')
        ?.map((s: any) => s.name) || [],
      devops: result.skillsAnalysis?.missingSkills
        ?.filter((s: any) => s.category === 'DevOps Tool')
        ?.map((s: any) => s.name) || [],
      softSkills: result.skillsAnalysis?.missingSkills
        ?.filter((s: any) => s.category === 'Soft Skill')
        ?.map((s: any) => s.name) || [],
    },
    recommendedKeywords: [],
    howToUseKeywords: result.recommendations?.slice(0, 5)?.map((r: any) => 
      r.actionItems?.[0]?.action || `Add ${r.title.toLowerCase()}`
    ) || [],
    resumeImprovements: result.recommendations?.map((r: any) => r.description) || [],
    jobMatch: {
      score: result.jobMatchScore,
      missingKeywords: result.skillsAnalysis?.missingSkills?.map((s: any) => s.name) || [],
      suggestions: result.recommendations?.slice(0, 3)?.map((r: any) => r.description) || [],
    },
    existingSections: {
      experience: result.sectionAnalysis?.experience?.present || false,
      education: result.sectionAnalysis?.education?.present || false,
      skills: result.sectionAnalysis?.skills?.present || false,
      summary: result.sectionAnalysis?.summary?.present || false,
      projects: result.sectionAnalysis?.projects?.present || false,
    },
  };
}

/**
 * Generate overall feedback summary
 */
function generateOverallFeedback(result: any): string {
  const { overallScore, atsScore, jobMatchScore } = result;
  
  let summary = `Overall Score: ${overallScore}% | ATS Score: ${atsScore}% | Job Match: ${jobMatchScore}%. `;
  
  if (overallScore >= 80) {
    summary += "Excellent match! Your resume strongly aligns with the job requirements.";
  } else if (overallScore >= 60) {
    summary += "Good match with room for improvement.";
  } else if (overallScore >= 40) {
    summary += "Fair match. Consider addressing the key gaps identified.";
  } else {
    summary += "Significant gaps detected. Review recommendations carefully.";
  }
  
  return summary;
}

/**
 * Generate strengths list
 */
function generateStrengths(result: any): string[] {
  const strengths: string[] = [];
  
  if (result.sectionAnalysis?.summary?.present) {
    strengths.push("Professional summary included");
  }
  
  if (result.sectionAnalysis?.experience?.present) {
    strengths.push(`Work experience with ${result.experienceAnalysis?.totalYears || 0} years`);
  }
  
  if (result.sectionAnalysis?.skills?.present && result.skillsAnalysis?.totalSkillsFound > 5) {
    strengths.push(`Strong skills section with ${result.skillsAnalysis.totalSkillsFound} skills`);
  }
  
  if (result.sectionAnalysis?.projects?.present) {
    strengths.push("Projects section showcases practical work");
  }
  
  if (result.atsScore >= 70) {
    strengths.push("Strong ATS optimization");
  }
  
  if (result.jobMatchScore >= 70) {
    strengths.push("Excellent job requirements alignment");
  }
  
  return strengths;
}

/**
 * Generate weaknesses list
 */
function generateWeaknesses(result: any): string[] {
  const weaknesses: string[] = [];
  
  if (!result.sectionAnalysis?.summary?.present) {
    weaknesses.push("Missing professional summary");
  }
  
  if (!result.sectionAnalysis?.experience?.present) {
    weaknesses.push("No work experience listed");
  }
  
  if (!result.sectionAnalysis?.projects?.present) {
    weaknesses.push("No projects section");
  }
  
  if (result.skillsAnalysis?.missingSkills?.length > 5) {
    weaknesses.push(`Missing ${result.skillsAnalysis.missingSkills.length} required skills`);
  }
  
  if (result.atsScore < 50) {
    weaknesses.push("ATS optimization needs improvement");
  }
  
  return weaknesses;
}
