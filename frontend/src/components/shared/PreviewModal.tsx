/* ===================================
Preview Modal Component
=================================== */
import { motion } from "framer-motion";
import { FileText, Download, X } from "lucide-react";
import { ResumeContent } from "../../types";
import { ResumePreview } from "./index";

interface PreviewModalProps {
  content: ResumeContent;
  onClose: () => void;
  onExportPDF: () => void;
}

export default function PreviewModal({
  content,
  onClose,
  onExportPDF,
}: PreviewModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gray-900 w-full sm:rounded-2xl sm:shadow-2xl sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden border-0 sm:border border-gray-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <h2 className="text-base sm:text-xl font-bold text-white">Resume Preview</h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onExportPDF}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
              <span className="hidden xs:inline">Download PDF</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-800 p-3 sm:p-6">
          <div className="transform scale-90 sm:scale-100 origin-top" id="resume-preview-modal-content">
            <ResumePreview content={content} forPdf={true} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
