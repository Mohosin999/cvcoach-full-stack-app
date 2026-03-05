import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  Send,
  RefreshCw,
  FileText,
  Upload,
  Star,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { analysisApi, resumeApi } from '../services/api';
import { Resume, ResumeContent } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';

const MAX_JD_LENGTH = 10000;

export default function Analyze() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await resumeApi.upload(formData);
      setResume(response.data.data);
      setResumeContent(response.data.data.content);
      toast.success('Resume uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!resume) {
      toast.error('Please upload a resume first');
      return;
    }
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }
    if (!user || user.subscription.credits < 1) {
      toast.error('Insufficient credits');
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await analysisApi.create({
        resumeId: resume._id,
        jobDescription,
      });

      setAnalysis(response.data.data);
      await refreshUser();

      toast.success('Analysis complete!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearAll = () => {
    setResume(null);
    setResumeContent(null);
    setJobDescription('');
    setAnalysis(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analyze Resume
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload your resume and compare it against a job description
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm">
            <Star className="w-4 h-4" />
            <span>{user?.subscription.credits || 0} credits remaining</span>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              1. Upload Resume
            </h2>
            
            {!resume ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload your resume (PDF, DOCX, or TXT)
                </p>
                <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {resume.metadata?.originalName || 'Resume uploaded'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Click to upload different file
                      </p>
                    </div>
                  </div>
                  <label className="btn-outline cursor-pointer">
                    Change
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              2. Job Description <span className="text-red-500">*</span>
            </h2>
            
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value.slice(0, MAX_JD_LENGTH))}
              placeholder="Paste the job description here..."
              className="input min-h-[200px] resize-none"
            />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500">
                {jobDescription.length} / {MAX_JD_LENGTH} characters
              </span>
              <button
                onClick={() => setJobDescription('')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !resume || !jobDescription.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <LoadingSpinner size="sm" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Analyze Resume
                </>
              )}
            </button>
            <button
              onClick={clearAll}
              className="btn-ghost px-4"
              title="Clear all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card flex items-center justify-center py-16"
              >
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Analyzing your resume...
                  </p>
                </div>
              </motion.div>
            ) : analysis ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Analysis Results
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                        {analysis.score}%
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Match Score</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className={`text-4xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                        {analysis.atsScore}%
                      </div>
                      <p className="text-sm text-gray-500 mt-1">ATS Score</p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {analysis.feedback?.overall}
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {(analysis.feedback?.suggestions || []).map((imp: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 dark:text-gray-300">{imp}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Skills Analysis
                  </h3>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Found Skills ({analysis.sectionScores?.skills?.matched?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.sectionScores?.skills?.matched || []).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Missing Skills ({analysis.sectionScores?.skills?.missing?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.sectionScores?.skills?.missing || []).slice(0, 15).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-12"
              >
                <FileSearch className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Upload a resume and enter a job description to get started
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
