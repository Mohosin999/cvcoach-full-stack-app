import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Edit3,
  Trash2,
  Plus,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import { resumeApi } from "../services/api";
import { Resume } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import BackButton from "../components/BackButton";
import ConfirmModal from "../components/ConfirmModal";

export default function SavedResumes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, [page]);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await resumeApi.getAll(page, 12);
      setResumes(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalItems(response.data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await resumeApi.delete(deleteId);
      toast.success("Resume deleted");
      setResumes(resumes.filter((r) => r._id !== deleteId));
      setTotalItems((prev) => prev - 1);
    } catch (error) {
      toast.error("Failed to delete resume");
    } finally {
      setDeleteId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await resumeApi.deleteAll();
      setResumes([]);
      setTotalItems(0);
      setTotalPages(1);
      setPage(1);
      toast.success("All resumes cleared");
      setShowClearModal(false);
      fetchResumes();
    } catch (error: any) {
      console.error("Clear all error:", error);
      toast.error(error.response?.data?.message || "Failed to clear resumes");
    }
  };

  const handleEdit = (resume: Resume) => {
    navigate("/builder", { state: { resume } });
  };

  const filteredResumes = resumes.filter(
    (resume) =>
      resume.content.personalInfo.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      resume.content.personalInfo.jobTitle
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      resume.content.summary
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      resume.content.skills?.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  if (loading && resumes.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 mb-1">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Resumes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your saved resumes ({totalItems} total)
              </p>
            </div>
            <div className="flex gap-2">
              {totalItems > 0 && (
                <button
                  onClick={() => setShowClearModal(true)}
                  className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card mb-6"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resumes by name, summary, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredResumes.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredResumes.map((resume) => (
                <motion.div
                  key={resume._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(resume)}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(resume._id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                    {resume.content.personalInfo.fullName || "Untitled Resume"}
                  </h3>

                  {resume.content.personalInfo.jobTitle && (
                    <p className="text-sm text-green-500 font-medium mb-2 truncate">
                      {resume.content.personalInfo.jobTitle}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Clock className="w-4 h-4" />
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </div>

                  {resume.content.summary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {resume.content.summary}
                    </p>
                  )}

                  {resume.content.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resume.content.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {resume.content.skills.length > 3 && (
                        <span className="px-2 py-0.5 text-gray-500 text-xs">
                          +{resume.content.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleEdit(resume)}
                    className="w-full btn-outline flex items-center justify-center gap-2"
                  >
                    Edit Resume
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn-ghost p-2 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost p-2 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? "No Resumes Found" : "No Saved Resumes"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm
                ? "Try a different search term"
                : "You haven't created any resumes yet. Start building your first resume!"}
            </p>
            <button
              onClick={() => navigate("/builder")}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Resume
            </button>
          </motion.div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        type="danger"
      />

      <ConfirmModal
        isOpen={showClearModal}
        title="Clear All Resumes"
        message="Are you sure you want to delete all your saved resumes? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearModal(false)}
        type="danger"
      />
    </div>
  );
}
