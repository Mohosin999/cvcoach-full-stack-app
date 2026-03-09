import React from "react";
import { motion } from "framer-motion";
import { SkillList } from "./SkillBadge";
import AnalysisSection, { SuggestionItem } from "./AnalysisSection";
import { Analysis } from "../types";
import {
  Trophy,
  Target,
  BookOpen,
  Briefcase,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Layers,
  Zap,
} from "lucide-react";

interface ResultPanelProps {
  analysis: Analysis;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ analysis }) => {
  const jobMatchingBreakdown = analysis.jobMatchingBreakdown as any;

  const jobMatchingItems = jobMatchingBreakdown
    ? [
        {
          label: "Required Skills",
          score: jobMatchingBreakdown.requiredSkillsMatch?.score || 0,
          details: jobMatchingBreakdown.requiredSkillsMatch?.details || "",
        },
        {
          label: "Preferred Skills",
          score: jobMatchingBreakdown.preferredSkillsMatch?.score || 0,
          details: jobMatchingBreakdown.preferredSkillsMatch?.details || "",
        },
        {
          label: "Experience Alignment",
          score: jobMatchingBreakdown.experienceAlignment?.score || 0,
          details: jobMatchingBreakdown.experienceAlignment?.details || "",
        },
        {
          label: "Education Match",
          score: jobMatchingBreakdown.educationAlignment?.score || 0,
          details: jobMatchingBreakdown.educationAlignment?.details || "",
        },
        {
          label: "Responsibility Match",
          score: jobMatchingBreakdown.responsibilityMatch?.score || 0,
          details: jobMatchingBreakdown.responsibilityMatch?.details || "",
        },
      ]
    : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-gradient-to-br from-green-500 to-emerald-600";
    if (score >= 60) return "bg-gradient-to-br from-blue-500 to-indigo-600";
    if (score >= 40) return "bg-gradient-to-br from-yellow-500 to-orange-600";
    return "bg-gradient-to-br from-red-500 to-rose-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overall Scores - Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5">
          <div className="flex items-center justify-between mb-3">
            <Trophy className={`w-6 h-6 ${getScoreColor(analysis.score)}`} />
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                analysis.score >= 80
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : analysis.score >= 60
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {getScoreLabel(analysis.score)}
            </span>
          </div>
          <div
            className={`text-5xl font-bold ${getScoreColor(analysis.score)} mb-1`}
          >
            {analysis.score}%
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Score
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Combined ATS + Job Match
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/5">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              ATS Optimized
            </span>
          </div>
          <div className="text-5xl font-bold text-blue-500 mb-1">
            {analysis.atsScore}%
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ATS Score
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            30% Keywords + 30% Skills + 30% Sections + 10% Experience
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/5">
          <div className="flex items-center justify-between mb-3">
            <Briefcase className="w-6 h-6 text-purple-500" />
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Job Match
            </span>
          </div>
          <div className="text-5xl font-bold text-purple-500 mb-1">
            {analysis.jobMatch?.score || 0}%
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Job Match Score
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Alignment with job requirements
          </p>
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="card p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Analysis Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {analysis.feedback?.overall ||
                "Analysis complete. Review the detailed breakdown below for actionable insights."}
            </p>
          </div>
        </div>
      </div>

      {/* ATS Score Breakdown - Detailed */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ATS Score Breakdown
          </h3>
        </div>

        {/* Scoring Criteria Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                How ATS Score is Calculated
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>
                    <strong>Keyword Matching (30%):</strong> Presence and
                    density of job keywords
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>
                    <strong>Skills Match (30%):</strong> Alignment with
                    required/preferred skills
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>
                    <strong>Section Completeness (30%):</strong> 4 critical
                    sections present
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>
                    <strong>Experience Relevance (10%):</strong> Years and
                    keyword match in experience
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Skills Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Matched Skills (
                {analysis.sectionScores?.skills?.matched?.length || 0})
              </span>
            </div>
            <SkillList
              skills={analysis.sectionScores?.skills?.matched || []}
              type="matched"
              maxDisplay={12}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Missing Skills (
                {analysis.sectionScores?.skills?.missing?.length || 0})
              </span>
            </div>
            <SkillList
              skills={analysis.sectionScores?.skills?.missing || []}
              type="missing"
              maxDisplay={12}
            />
          </div>
        </div>
      </div>

      {/* Job Match Breakdown */}
      {jobMatchingItems.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Job Match Breakdown
            </h3>
          </div>

          <div className="space-y-3">
            {jobMatchingItems.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                  <span
                    className={`text-sm font-bold ${getScoreColor(item.score)}`}
                  >
                    {item.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreBg(item.score)} transition-all duration-500`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations / Areas for Improvement */}
      {analysis.feedback?.suggestions &&
        analysis.feedback.suggestions.length > 0 && (
          <AnalysisSection title="Priority Recommendations" icon="alert">
            <div className="space-y-3">
              {analysis.feedback.suggestions
                .slice(0, 7)
                .map((suggestion: string, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-900 dark:text-amber-100">
                        {suggestion}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </AnalysisSection>
        )}

      {/* Strengths */}
      {analysis.feedback?.strengths &&
        analysis.feedback.strengths.length > 0 && (
          <AnalysisSection title="Your Strengths" icon="check">
            <div className="space-y-2">
              {analysis.feedback.strengths.map(
                (strength: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-900 dark:text-green-100">
                      {strength}
                    </p>
                  </div>
                ),
              )}
            </div>
          </AnalysisSection>
        )}

      {/* Missing Keywords */}
      {analysis.keywords?.missing && analysis.keywords.missing.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Missing Keywords ({analysis.keywords.missing.length})
            </h3>
          </div>
          <SkillList
            skills={analysis.keywords.missing}
            type="missing"
            maxDisplay={20}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Tip: Incorporate these keywords naturally throughout your resume,
            especially in the skills and experience sections.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ResultPanel;
