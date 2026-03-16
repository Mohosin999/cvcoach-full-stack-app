/* ===================================
Result Toggle Component
Allows switching between ATS Score and Job Match results
=================================== */
import { motion } from "framer-motion";
import { FileText, Briefcase } from "lucide-react";

export type ResultView = "ats" | "jobMatch";

interface ResultToggleProps {
  view: ResultView;
  onViewChange: (view: ResultView) => void;
}

export default function ResultToggle({ view, onViewChange }: ResultToggleProps) {
  return (
    <div className="inline-flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
      <motion.button
        onClick={() => onViewChange("ats")}
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          view === "ats"
            ? "text-white"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {view === "ats" && (
          <motion.div
            layoutId="toggle-bg"
            className="absolute inset-0 bg-primary rounded-lg"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <FileText className="w-4 h-4" />
          ATS Score
        </span>
      </motion.button>

      <motion.button
        onClick={() => onViewChange("jobMatch")}
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          view === "jobMatch"
            ? "text-white"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {view === "jobMatch" && (
          <motion.div
            layoutId="toggle-bg"
            className="absolute inset-0 bg-primary rounded-lg"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Job Match
        </span>
      </motion.button>
    </div>
  );
}
