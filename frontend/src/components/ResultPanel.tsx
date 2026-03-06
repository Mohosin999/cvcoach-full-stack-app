import React from 'react';
import { motion } from 'framer-motion';
import ScoreCard from './ScoreCard';
import { SkillList } from './SkillBadge';
import AnalysisSection, { SuggestionItem } from './AnalysisSection';
import { Analysis } from '../types';

interface ResultPanelProps {
  analysis: Analysis;
}

interface AtsScoreBreakdown {
  keywordMatching: { score: number; weight: number; details: string };
  skillsMatch: { score: number; weight: number; details: string };
  resumeSections: { score: number; weight: number; details: string };
  experienceRelevance: { score: number; weight: number; details: string };
  resumeFormatting: { score: number; weight: number; details: string };
  achievementsImpact: { score: number; weight: number; details: string };
  grammarReadability: { score: number; weight: number; details: string };
}

interface JobMatchingBreakdown {
  requiredSkillsMatch: { score: number; details: string };
  relevantWorkExperience: { score: number; details: string };
  technologiesUsed: { score: number; details: string };
  toolsFrameworks: { score: number; details: string };
  industryRelevance: { score: number; details: string };
  yearsExperienceAlignment: { score: number; details: string };
  roleResponsibilitySimilarity: { score: number; details: string };
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ analysis }) => {
  const atsBreakdown = analysis.atsScoreBreakdown as unknown as AtsScoreBreakdown;
  const jobMatchingBreakdown = analysis.jobMatchingBreakdown as unknown as JobMatchingBreakdown;

  const atsBreakdownList = atsBreakdown ? [
    { label: 'Keyword Matching', score: atsBreakdown.keywordMatching?.score || 0, weight: 30 },
    { label: 'Skills Match', score: atsBreakdown.skillsMatch?.score || 0, weight: 20 },
    { label: 'Resume Sections', score: atsBreakdown.resumeSections?.score || 0, weight: 15 },
    { label: 'Experience Relevance', score: atsBreakdown.experienceRelevance?.score || 0, weight: 15 },
    { label: 'Formatting', score: atsBreakdown.resumeFormatting?.score || 0, weight: 10 },
    { label: 'Achievements', score: atsBreakdown.achievementsImpact?.score || 0, weight: 5 },
    { label: 'Grammar', score: atsBreakdown.grammarReadability?.score || 0, weight: 5 },
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <ScoreCard
          score={analysis.score}
          label="Overall Score"
          sublabel="Combined rating"
          size="lg"
        />
        <ScoreCard
          score={analysis.atsScore}
          label="ATS Score"
          sublabel="Resume compatibility"
          size="lg"
        />
      </div>

      <div className="card">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {analysis.feedback?.overall}
        </p>
      </div>

      {analysis.feedback?.suggestions && analysis.feedback.suggestions.length > 0 && (
        <AnalysisSection title="Areas for Improvement" icon="alert">
          <ul className="space-y-3">
            {analysis.feedback.suggestions.slice(0, 7).map((imp: string, index: number) => (
              <SuggestionItem key={index} suggestion={imp} type="improvement" />
            ))}
          </ul>
        </AnalysisSection>
      )}

      {analysis.feedback?.strengths && analysis.feedback.strengths.length > 0 && (
        <AnalysisSection title="Strengths" icon="check">
          <ul className="space-y-3">
            {analysis.feedback.strengths.map((strength: string, index: number) => (
              <SuggestionItem key={index} suggestion={strength} type="strength" />
            ))}
          </ul>
        </AnalysisSection>
      )}

      <AnalysisSection title="Skills Analysis" icon="info">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Matched Skills ({analysis.sectionScores?.skills?.matched?.length || 0})
          </p>
          <SkillList
            skills={analysis.sectionScores?.skills?.matched || []}
            type="matched"
            maxDisplay={15}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Missing Skills ({analysis.sectionScores?.skills?.missing?.length || 0})
          </p>
          <SkillList
            skills={analysis.sectionScores?.skills?.missing || []}
            type="missing"
            maxDisplay={15}
          />
        </div>
      </AnalysisSection>

      {atsBreakdownList.length > 0 && (
        <AnalysisSection title="ATS Score Breakdown" icon="info">
          <ScoreCard
            score={analysis.atsScore}
            label="ATS Score"
            breakdown={atsBreakdownList}
          />
        </AnalysisSection>
      )}

      {jobMatchingBreakdown && (
        <AnalysisSection title="Job Matching Breakdown" icon="info">
          <div className="space-y-3">
            {[
              { label: 'Required Skills Match', ...jobMatchingBreakdown.requiredSkillsMatch },
              { label: 'Relevant Work Experience', ...jobMatchingBreakdown.relevantWorkExperience },
              { label: 'Technologies Used', ...jobMatchingBreakdown.technologiesUsed },
              { label: 'Tools & Frameworks', ...jobMatchingBreakdown.toolsFrameworks },
              { label: 'Industry Relevance', ...jobMatchingBreakdown.industryRelevance },
              { label: 'Years of Experience', ...jobMatchingBreakdown.yearsExperienceAlignment },
              { label: 'Role Responsibility', ...jobMatchingBreakdown.roleResponsibilitySimilarity },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.score}%
                </span>
              </div>
            ))}
          </div>
        </AnalysisSection>
      )}

      {analysis.keywords?.missing && analysis.keywords.missing.length > 0 && (
        <AnalysisSection title="Missing Keywords" icon="alert">
          <SkillList
            skills={analysis.keywords.missing}
            type="missing"
            maxDisplay={20}
          />
        </AnalysisSection>
      )}
    </motion.div>
  );
};

export default ResultPanel;
