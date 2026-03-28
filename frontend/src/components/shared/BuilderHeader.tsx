/* ===================================
Builder Header Component
=================================== */
import { motion } from "framer-motion";
import { Eye, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BuilderHeaderProps {
  saving: boolean;
  onNewResume: () => void;
  onPreview: () => void;
}

export default function BuilderHeader({
  saving,
  onNewResume,
  onPreview,
}: BuilderHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">Resume Builder</span>
          <span className="text-emerald-500/50">|</span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">
          Create your professional resume with <span className="text-emerald-400">AI-powered</span> assistance
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate('/resume-build-history')}
          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
        >
          <History className="w-4 h-4" />
          History
        </button>
        <button onClick={onNewResume} className="inline-flex items-center justify-center px-3 sm:px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300">
          New
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPreview}
          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white hover:from-emerald-700 hover:to-emerald-500 shadow-lg shadow-emerald-700/30"
        >
          <Eye className="w-4 h-4" /> <span>Preview</span>
        </motion.button>
      </div>
    </div>
  );
}
