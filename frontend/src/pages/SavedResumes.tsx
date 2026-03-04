import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Edit3, Trash2, Plus, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { resumeApi } from '../services/api';
import { Resume } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';

export default function SavedResumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await resumeApi.getAll(1, 50);
      setResumes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    
    setDeleting(id);
    try {
      await resumeApi.delete(id);
      toast.success('Resume deleted');
      await fetchResumes();
    } catch (error) {
      toast.error('Failed to delete resume');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (resume: Resume) => {
    navigate('/builder', { state: { resume } });
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Resumes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your saved resumes
          </p>
        </motion.div>

        {resumes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {resumes.map((resume) => (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
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
                      onClick={() => handleDelete(resume._id)}
                      disabled={deleting === resume._id}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-10 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {resume.content.personalInfo.name || 'Untitled Resume'}
                </h3>

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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Saved Resumes
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You haven't created any resumes yet. Start building your first resume!
            </p>
            <button
              onClick={() => navigate('/builder')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Resume
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
