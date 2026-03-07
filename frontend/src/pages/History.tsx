import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, Search, Trash2, FileText, ChevronLeft, ChevronRight, AlertTriangle, Target } from 'lucide-react';
import { toast } from 'react-toastify';
import { analysisApi } from '../services/api';
import { Analysis } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';
import ConfirmModal from '../components/ConfirmModal';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    fetchAnalyses();
  }, [page]);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const response = await analysisApi.getAll(page, 10);
      setAnalyses(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalItems(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await analysisApi.delete(deleteId);
      setAnalyses(analyses.filter((a) => a._id !== deleteId));
      setTotalItems(prev => prev - 1);
      toast.success('Analysis deleted');
    } catch (error) {
      toast.error('Failed to delete analysis');
    } finally {
      setDeleteId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await analysisApi.deleteAll();
      setAnalyses([]);
      setTotalItems(0);
      setTotalPages(1);
      setPage(1);
      toast.success('All analysis history cleared');
      setShowClearModal(false);
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const filteredAnalyses = analyses.filter(
    (analysis) =>
      analysis.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.jobDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.resumeId?.content?.personalInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && analyses.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
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
                Analysis History
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and manage your past resume analyses ({totalItems} total)
              </p>
            </div>
            {totalItems > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="btn-outline text-red-500 hover:text-red-600 hover:border-red-500 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </motion.div>

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
              placeholder="Search analyses by job title, company, or resume name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredAnalyses.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {filteredAnalyses.map((analysis) => (
                <div
                  key={analysis._id}
                  className="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/analyze?analysis=${analysis._id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        analysis.score >= 70
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : analysis.score >= 50
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}
                    >
                      <span
                        className={`text-xl font-bold ${
                          analysis.score >= 70
                            ? 'text-green-600'
                            : analysis.score >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {analysis.score}%
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {analysis.jobTitle || analysis.resumeId?.content?.personalInfo?.fullName || 'Resume Analysis'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {analysis.company || 'General'} • {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                      {analysis.jobMatch && (
                        <div className="flex items-center gap-2 mt-1">
                          <Target className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-blue-500">
                            Job Match: {analysis.jobMatch.score}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(analysis._id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
            <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Analyses Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try a different search term' : 'Start by analyzing your first resume'}
            </p>
            <Link to="/analyze" className="btn-primary inline-flex items-center gap-2">
              <FileText className="w-4 h-4" />
              New Analysis
            </Link>
          </motion.div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Analysis"
        message="Are you sure you want to delete this analysis? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        type="danger"
      />

      <ConfirmModal
        isOpen={showClearModal}
        title="Clear All History"
        message="Are you sure you want to delete all analysis history? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearModal(false)}
        type="danger"
      />
    </div>
  );
}
