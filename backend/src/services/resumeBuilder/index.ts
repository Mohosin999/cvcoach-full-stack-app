import { ResumeTemplate } from '../../models/ResumeTemplate';
import {
  generateSectionContent as generateWithGemini,
  improveResumeSection as improveWithGemini,
} from '../aiAnalysis/gemini';
import { ResumeContent } from '../../types';
import { IResumeTemplate } from '../../models/ResumeTemplate';
import { useUserCredits, getUserCredits } from '../users';

export const createResumeTemplate = async (
  userId: string,
  name: string = 'Untitled Resume'
) => {
  const template = await ResumeTemplate.create({
    userId,
    name,
    isAtsFriendly: true,
    content: {
      personalInfo: {},
      experience: [],
      education: [],
      skills: [],
      projects: [],
      achievements: [],
    },
    isDraft: true,
  });

  return template;
};

export const getResumeTemplates = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [templates, total] = await Promise.all([
    ResumeTemplate.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ResumeTemplate.countDocuments({ userId }),
  ]);

  return {
    templates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getResumeTemplateById = async (
  userId: string,
  templateId: string
) => {
  const template = await ResumeTemplate.findOne({
    _id: templateId,
    userId,
  });

  if (!template) {
    throw new Error('Resume template not found');
  }

  return template;
};

export const updateResumeTemplate = async (
  userId: string,
  templateId: string,
  updates: Partial<IResumeTemplate>
) => {
  const template = await ResumeTemplate.findOneAndUpdate(
    {
      _id: templateId,
      userId,
    },
    {
      ...updates,
      updatedAt: new Date(),
    },
    { new: true, runValidators: true }
  );

  if (!template) {
    throw new Error('Resume template not found');
  }

  return template;
};

export const deleteResumeTemplate = async (
  userId: string,
  templateId: string
) => {
  const result = await ResumeTemplate.deleteOne({
    _id: templateId,
    userId,
  });

  if (result.deletedCount === 0) {
    throw new Error('Resume template not found');
  }

  return { success: true };
};

export const generateSectionContent = async (
  userId: string,
  section: string,
  context?: {
    jobTitle?: string;
    industry?: string;
    experience?: string;
    skills?: string[];
  }
) => {
  // Resume Build costs 1 credit
  const currentCredits = await getUserCredits(userId);
  if (currentCredits < 1) {
    throw new Error(`Insufficient credits. This task requires 1 credit. You have ${currentCredits} credits.`);
  }

  // Deduct 1 credit for Resume Build
  const { credits } = await useUserCredits(userId, 1);
  const suggestion = await generateWithGemini(section, context);
  return { suggestion, credits };
};

export const improveResumeSection = async (
  userId: string,
  section: string,
  currentContent: string
) => {
  // Resume Rewrite/Optimization is FREE - no credit deduction
  const improvement = await improveWithGemini(section, currentContent);
  return { improvement, credits: await getUserCredits(userId) };
};

export const checkAtsFriendliness = async (content: ResumeContent) => {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for required sections
  if (!content.summary || content.summary.length < 30) {
    issues.push('Summary is too short or missing');
    suggestions.push('Add a professional summary of 30-100 words');
  }

  if (!content.skills || content.skills.length < 5) {
    issues.push('Skills section is too short');
    suggestions.push('Add at least 5 relevant technical skills');
  }

  if (!content.experience || content.experience.length === 0) {
    issues.push('No work experience listed');
    suggestions.push('Add your work experience with quantified achievements');
  }

  if (!content.education || content.education.length === 0) {
    issues.push('No education listed');
    suggestions.push('Add your education background');
  }

  // Check contact info
  if (!content.personalInfo.email) {
    issues.push('Missing email address');
    suggestions.push('Add a professional email address');
  }

  if (!content.personalInfo.whatsapp && !content.personalInfo.socialLinks?.github) {
    issues.push('Limited contact information');
    suggestions.push('Add phone number or professional social links');
  }

  // Check experience descriptions
  content.experience?.forEach((exp, index) => {
    if (!exp.description || exp.description.length < 50) {
      issues.push(`Experience ${index + 1}: Description too short`);
      suggestions.push(
        `Expand experience ${index + 1} with quantified achievements`
      );
    }

    // Check for action verbs
    const actionVerbs = [
      'developed',
      'created',
      'implemented',
      'designed',
      'built',
      'optimized',
      'improved',
      'led',
      'managed',
    ];
    const hasActionVerb = actionVerbs.some(
      (verb) => exp.description.toLowerCase().includes(verb)
    );
    if (!hasActionVerb) {
      issues.push(`Experience ${index + 1}: No action verbs`);
      suggestions.push(
        `Start bullet points with strong action verbs for experience ${index + 1}`
      );
    }
  });

  const atsScore = Math.max(
    0,
    100 - issues.length * 10
  );

  return {
    atsScore,
    issues,
    suggestions,
    isAtsFriendly: atsScore >= 70,
  };
};
