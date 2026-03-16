/* ===================================
Job Match Breakdown Component (Enhanced)
Displays job matching score with detailed skills analysis
=================================== */
import { Briefcase, Target, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface JobMatchItem {
  label: string;
  score: number;
  details: string;
  weight?: number;
}

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

const getScoreBadge = (score: number) => {
  if (score >= 80) return { label: "Excellent", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  if (score >= 60) return { label: "Good", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  if (score >= 40) return { label: "Fair", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
  return { label: "Needs Work", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
};

interface JobMatchItemProps {
  item: JobMatchItem;
  index: number;
  icon?: React.ElementType;
}

const JobMatchItem = ({ item, index, icon: Icon }: JobMatchItemProps) => {
  const badge = getScoreBadge(item.score);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.weight && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Weight: {item.weight}%
            </span>
          )}
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.class}`}>
            {badge.label}
          </span>
          <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
            {item.score}%
          </span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
        <motion.div
          className={`h-2.5 rounded-full ${getScoreBg(item.score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${item.score}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
        />
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">{item.details}</p>
    </motion.div>
  );
};

interface JobMatchBreakdownEnhancedProps {
  jobMatchScore: number;
  items: JobMatchItem[];
  suggestions: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
}

export default function JobMatchBreakdownEnhanced({ 
  jobMatchScore, 
  items, 
  suggestions,
  matchedSkills = [],
  missingSkills = []
}: JobMatchBreakdownEnhancedProps) {
  const overallBadge = getScoreBadge(jobMatchScore);

  return (
    <div className="space-y-6">
      {/* Job Match Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Match Score</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">How well your skills match the job requirements</p>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className={`text-6xl font-bold ${getScoreColor(jobMatchScore)}`}>
            {jobMatchScore}%
          </div>
          <div className="mb-2">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${overallBadge.class}`}>
              {overallBadge.label}
            </span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-primary/20">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Match Analysis:</strong> 
            {jobMatchScore >= 80 
              ? " Excellent alignment! Your skills and experience strongly match the job requirements." 
              : jobMatchScore >= 60
              ? " Good match! You have most of the required qualifications with some gaps."
              : jobMatchScore >= 40
              ? " Moderate match. Consider addressing key skill gaps before applying."
              : " Low match. Review the missing skills and requirements carefully."}
          </p>
        </div>
      </motion.div>

      {/* Skills Summary */}
      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {matchedSkills.length > 0 && (
            <div className="card p-4 border-l-4 border-l-green-500">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Matched Skills ({matchedSkills.length})</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.slice(0, 10).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {matchedSkills.length > 10 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                    +{matchedSkills.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {missingSkills.length > 0 && (
            <div className="card p-4 border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Missing Skills ({missingSkills.length})</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.slice(0, 10).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {missingSkills.length > 10 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                    +{missingSkills.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Job Match Breakdown Items */}
      <div className="grid gap-3">
        {items.map((item, index) => (
          <JobMatchItem 
            key={index} 
            item={item} 
            index={index}
            icon={index === 0 ? Target : index === 1 ? TrendingUp : Award}
          />
        ))}
      </div>

      {/* Job Match Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 border-l-4 border-l-primary"
        >
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Match Improvement Tips</h3>
          </div>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
