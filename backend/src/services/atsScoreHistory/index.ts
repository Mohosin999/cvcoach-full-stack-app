import { AtsScoreHistory } from '../../models/AtsScoreHistory';
import { analyzeAtsScore as analyzeWithGemini } from '../aiAnalysis/gemini';
import { ResumeContent } from '../../types';

const validErrorTypes = ['spelling', 'grammar', 'punctuation', 'formatting', 'redundancy'];

const sanitizeSpellingGrammar = (spellingGrammar: any) => {
  return {
    ...spellingGrammar,
    errors: spellingGrammar.errors.map((error: any) => ({
      ...error,
      type: validErrorTypes.includes(error.type) ? error.type : 'formatting',
    })),
  };
};

export const createAtsScoreHistory = async (
  userId: string,
  resumeName: string,
  resumeContent: ResumeContent
) => {
  const analysis = await analyzeWithGemini(resumeContent);

  if (!analysis.sectionScores.contactInfo.hasContactInfo) {
    analysis.sectionScores.contactInfo.hasContactInfo = Boolean(
      resumeContent.personalInfo?.email ||
      (resumeContent.personalInfo as any)?.phone ||
      resumeContent.personalInfo?.linkedIn
    );
  }

  const title = `${resumeName || 'Resume'} – ATS Score v${Date.now().toString(36).slice(-4)}`;

  const sanitizedSpellingGrammar = sanitizeSpellingGrammar(analysis.spellingGrammar);

  const atsScoreHistory = await AtsScoreHistory.create({
    userId,
    title,
    resumeName,
    overallScore: analysis.overallScore,
    sectionScores: analysis.sectionScores,
    spellingGrammar: sanitizedSpellingGrammar,
    atsFriendliness: analysis.atsFriendliness,
    suggestions: analysis.suggestions,
    resumeContent,
  });

  return atsScoreHistory;
};

export const getAtsScoreHistory = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [scores, total] = await Promise.all([
    AtsScoreHistory.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AtsScoreHistory.countDocuments({ userId }),
  ]);

  return {
    scores,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAtsScoreHistoryById = async (userId: string, historyId: string) => {
  const score = await AtsScoreHistory.findOne({
    _id: historyId,
    userId,
  });

  if (!score) {
    throw new Error('ATS Score history not found');
  }

  return score;
};

export const deleteAtsScoreHistory = async (userId: string, historyId: string) => {
  const result = await AtsScoreHistory.deleteOne({
    _id: historyId,
    userId,
  });

  if (result.deletedCount === 0) {
    throw new Error('ATS Score history not found');
  }

  return { success: true };
};

export const deleteAllAtsScoreHistory = async (userId: string) => {
  await AtsScoreHistory.deleteMany({ userId });
  return { success: true };
};
