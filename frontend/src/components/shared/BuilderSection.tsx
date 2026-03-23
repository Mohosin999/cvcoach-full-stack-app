/* ===================================
Builder Section Component
=================================== */
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Save } from "lucide-react";
import { ReactNode } from "react";

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  completed: boolean;
}

interface BuilderSectionProps {
  currentSection: Section;
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  saving: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onExportPDF: () => void;
  onSave: () => void;
  children: ReactNode;
}

export default function BuilderSection({
  currentSection,
  currentStep,
  totalSteps,
  isFirstStep,
  isLastStep,
  saving,
  onPrevious,
  onNext,
  onExportPDF,
  onSave,
  children,
}: BuilderSectionProps) {
  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-emerald-500/10 border border-emerald-500/20 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 p-3 sm:p-4 relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMODAgME0wIDBMODAgNDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
            <currentSection.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white">
              {currentSection.title}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="p-3 sm:p-6 border-t border-emerald-700/20 bg-gray-900/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
          <motion.button
            whileHover={{ scale: isFirstStep ? 1 : 1.02 }}
            whileTap={{ scale: isFirstStep ? 1 : 0.98 }}
            onClick={onPrevious}
            disabled={isFirstStep}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
              isFirstStep
                ? "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                : "bg-gray-800 text-white hover:bg-gray-700 border border-emerald-700/30"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </motion.button>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all font-medium shadow-lg shadow-emerald-500/30 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">{saving ? "Saving..." : "Save Resume"}</span>
              <span className="sm:hidden">{saving ? "Saving..." : "Save"}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={isLastStep ? onExportPDF : onNext}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-500 transition-all font-medium shadow-lg shadow-emerald-700/30 text-sm sm:text-base"
            >
              {isLastStep ? (
                <>
                  <Download className="w-4 h-4" />{" "}
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              ) : (
                <>
                  Next <ChevronRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
