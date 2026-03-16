/* ===================================
Result Panel Component
=================================== */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Analysis } from "../types";
import ResultToggle, { ResultView } from "./ResultToggle";
import ATSScoreBreakdown from "./ATSScoreBreakdown";
import JobMatchBreakdownEnhanced from "./JobMatchBreakdownEnhanced";
import { OverallFeedback, SkillsAnalysis, Strengths, MissingKeywords } from "./shared";

interface ResultPanelProps {
  analysis: Analysis;
}

export default function ResultPanel({ analysis }: ResultPanelProps) {
  const [view, setView] = useState<ResultView>("ats");

  const jobMatchingBreakdown = analysis.jobMatchingBreakdown as any;
  const atsBreakdown = analysis.atsBreakdown as any;

  // Get matched and missing skills from sectionScores
  const matchedSkills = analysis.sectionScores?.skills?.matched || [];
  const missingSkills = analysis.sectionScores?.skills?.missing || [];
  const totalSkills = matchedSkills.length + missingSkills.length;

  // Calculate Skills Match score - recalculate if stored is 0 or use stored
  let skillsMatchScore = jobMatchingBreakdown?.skillsMatch?.score 
    ?? jobMatchingBreakdown?.requiredSkillsMatch?.score 
    ?? 0;
  // If score is 0 but we have matched skills, recalculate
  if (skillsMatchScore === 0 && totalSkills > 0) {
    skillsMatchScore = Math.round((matchedSkills.length / totalSkills) * 100);
  }
  // If still 0, provide default based on matched skills
  if (skillsMatchScore === 0 && matchedSkills.length > 0) {
    skillsMatchScore = 60; // Default for partial match
  }

  // Calculate Keywords Match score - recalculate if stored is 0
  let keywordsMatchScore = jobMatchingBreakdown?.keywordsMatch?.score 
    ?? jobMatchingBreakdown?.technologiesUsed?.score 
    ?? 0;
  const foundKeywords = analysis.keywords?.found || [];
  const missingKeywordsList = analysis.keywords?.missing || [];
  const totalKeywords = foundKeywords.length + missingKeywordsList.length;
  if (keywordsMatchScore === 0 && totalKeywords > 0) {
    keywordsMatchScore = Math.round((foundKeywords.length / totalKeywords) * 100);
  }
  if (keywordsMatchScore === 0 && foundKeywords.length > 0) {
    keywordsMatchScore = 50; // Default for partial match
  }

  const skillsMatchDetails = jobMatchingBreakdown?.skillsMatch?.details 
    ?? (totalSkills > 0 ? `${matchedSkills.length}/${totalSkills} skills matched` : "");
  const keywordsMatchDetails = jobMatchingBreakdown?.keywordsMatch?.details 
    ?? (totalKeywords > 0 ? `${foundKeywords.length}/${totalKeywords} keywords matched` : "");

  const jobMatchItems = jobMatchingBreakdown ? [
    { label: "Skills Match", score: skillsMatchScore, details: skillsMatchDetails || `${matchedSkills.length} skills matched`, weight: 50 },
    { label: "Keywords Match", score: keywordsMatchScore, details: keywordsMatchDetails || `${foundKeywords.length} keywords found`, weight: 50 },
  ] : [];

  const atsItems = atsBreakdown ? [
    { label: "Keyword Match", score: atsBreakdown.keywordMatch?.score || 0, details: atsBreakdown.keywordMatch?.details || "", info: "30% weight - Keywords from job description" },
    { label: "Formatting & Structure", score: atsBreakdown.formattingCompatibility?.score || 0, details: atsBreakdown.formattingCompatibility?.details || "", info: "25% weight - ATS-readable format" },
    { label: "Skills Section", score: atsBreakdown.skillsSection?.score || 0, details: atsBreakdown.skillsSection?.details || "", info: "25% weight - Technical skills coverage" },
    { label: "Experience Relevance", score: atsBreakdown.experienceRelevance?.score || 0, details: atsBreakdown.experienceRelevance?.details || "", info: "15% weight - Relevant work history" },
    { label: "Readability & Length", score: atsBreakdown.readabilityLength?.score || 0, details: atsBreakdown.readabilityLength?.details || "", info: "5% weight - Content clarity" },
    { label: "Contact Information", score: atsBreakdown.contactInfo?.score || 0, details: atsBreakdown.contactInfo?.details || "", info: "Complete contact details" },
  ] : [];

  const atsSuggestions = analysis.atsSuggestions || [];
  const jobMatchSuggestions = analysis.jobMatchSuggestions || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Toggle Button */}
      <div className="flex justify-center">
        <ResultToggle view={view} onViewChange={setView} />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {view === "ats" ? (
          <motion.div
            key="ats"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ATSScoreBreakdown
              atsScore={analysis.atsScore || 0}
              breakdown={atsItems}
              suggestions={atsSuggestions}
            />
          </motion.div>
        ) : (
          <motion.div
            key="jobMatch"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <JobMatchBreakdownEnhanced
              jobMatchScore={analysis.jobMatch?.score || analysis.score || 0}
              items={jobMatchItems}
              suggestions={jobMatchSuggestions}
              matchedSkills={matchedSkills}
              missingSkills={missingSkills}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Common Sections - Always shown */}
      <OverallFeedback analysis={analysis} />
      <SkillsAnalysis analysis={analysis} />
      {analysis.feedback?.strengths?.length > 0 && <Strengths strengths={analysis.feedback.strengths} />}
      {analysis.keywords?.missing?.length > 0 && <MissingKeywords keywords={analysis.keywords.missing} />}
    </motion.div>
  );
}
