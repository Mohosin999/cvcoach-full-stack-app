/* ===================================
Result Panel Component
=================================== */
import { motion } from "framer-motion";
import { Analysis } from "../types";
import {
  ScoreCards, OverallFeedback, SkillsAnalysis,
  JobMatchBreakdown, Recommendations, Strengths, MissingKeywords,
} from "./shared";

interface ResultPanelProps {
  analysis: Analysis;
}

export default function ResultPanel({ analysis }: ResultPanelProps) {
  const jobMatchingBreakdown = analysis.jobMatchingBreakdown as any;

  const jobMatchingItems = jobMatchingBreakdown ? [
    { label: "Required Skills", score: jobMatchingBreakdown.requiredSkillsMatch?.score || 0, details: jobMatchingBreakdown.requiredSkillsMatch?.details || "" },
    { label: "Preferred Skills", score: jobMatchingBreakdown.preferredSkillsMatch?.score || 0, details: jobMatchingBreakdown.preferredSkillsMatch?.details || "" },
    { label: "Experience Alignment", score: jobMatchingBreakdown.experienceAlignment?.score || 0, details: jobMatchingBreakdown.experienceAlignment?.details || "" },
    { label: "Education Match", score: jobMatchingBreakdown.educationAlignment?.score || 0, details: jobMatchingBreakdown.educationAlignment?.details || "" },
    { label: "Responsibility Match", score: jobMatchingBreakdown.responsibilityMatch?.score || 0, details: jobMatchingBreakdown.responsibilityMatch?.details || "" },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ScoreCards analysis={analysis} />
      <OverallFeedback analysis={analysis} />
      <SkillsAnalysis analysis={analysis} />
      {jobMatchingItems.length > 0 && <JobMatchBreakdown items={jobMatchingItems} />}
      {analysis.feedback?.suggestions?.length > 0 && <Recommendations suggestions={analysis.feedback.suggestions} />}
      {analysis.feedback?.strengths?.length > 0 && <Strengths strengths={analysis.feedback.strengths} />}
      {analysis.keywords?.missing?.length > 0 && <MissingKeywords keywords={analysis.keywords.missing} />}
    </motion.div>
  );
}
