import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  Send,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Share2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { analysisApi } from '../services/api';
import { Resume, ResumeContent, Analysis as AnalysisType } from '../types';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';

const MAX_JD_LENGTH = 10000;

export default function Analyze() {
  const { user, refreshUser } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisType | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    skills: true,
    experience: true,
    education: true,
    format: true,
  });

  const handleFileSelect = useCallback((res: Resume, content: ResumeContent) => {
    setResume(res);
    setResumeContent(content);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
            Analyze Resume
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload your resume and compare it against a job description
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm">
            <span>{user?.subscription.credits || 0} credits remaining</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Upload Resume
              </h2>
              {!resume ? (
                <FileUpload onFileSelect={handleFileSelect} />
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {resume.metadata?.originalName || resume.originalFormat?.filename || 'Resume'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {resume.metadata?.size ? (resume.metadata.size / 1024).toFixed(1) + ' KB' : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                2. Job Description
              </h2>
              
              <div>
                <label className="label">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value.slice(0, MAX_JD_LENGTH))}
                  placeholder="Paste the job description here..."
                  className="input min-h-[300px] resize-none"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">
                    {jobDescription.length} / {MAX_JD_LENGTH} characters
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setJobDescription('')}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !resume || !jobDescription}
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
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card flex items-center justify-center min-h-[400px]"
                >
                  <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Analyzing your resume...
                    </p>
                    <p className="text-sm text-gray-500">
                      This may take a few seconds
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
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Analysis Results
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(analysis.feedback.overall)}
                          className="btn-ghost p-2"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="btn-ghost p-2" title="Share">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

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

                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Overall Assessment
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {analysis.feedback.overall}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <button
                          onClick={() => toggleSection('skills')}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            Skills Analysis
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${getScoreColor(analysis.sectionScores.skills.score)}`}>
                              {analysis.sectionScores.skills.score}%
                            </span>
                            {expandedSections.skills ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedSections.skills && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="p-4 border border-t-0 border-gray-200 dark:border-gray-700"
                            >
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Matched Skills ({analysis.sectionScores.skills.matched.length})
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.sectionScores.skills.matched.map((skill) => (
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
                                    Missing Skills ({analysis.sectionScores.skills.missing.length})
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.sectionScores.skills.missing.map((skill) => (
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
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <button
                          onClick={() => toggleSection('experience')}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            Experience
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${getScoreColor(analysis.sectionScores.experience.score)}`}>
                              {analysis.sectionScores.experience.score}%
                            </span>
                            {expandedSections.experience ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedSections.experience && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="p-4 border border-t-0 border-gray-200 dark:border-gray-700"
                            >
                              <p className="text-gray-600 dark:text-gray-400">
                                {analysis.sectionScores.experience.details}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <button
                          onClick={() => toggleSection('education')}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            Education
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${getScoreColor(analysis.sectionScores.education.score)}`}>
                              {analysis.sectionScores.education.score}%
                            </span>
                            {expandedSections.education ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedSections.education && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="p-4 border border-t-0 border-gray-200 dark:border-gray-700"
                            >
                              <p className="text-gray-600 dark:text-gray-400">
                                {analysis.sectionScores.education.details}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <button
                          onClick={() => toggleSection('format')}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            Format & ATS
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${getScoreColor(analysis.sectionScores.format.score)}`}>
                              {analysis.sectionScores.format.score}%
                            </span>
                            {expandedSections.format ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedSections.format && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="p-4 border border-t-0 border-gray-200 dark:border-gray-700"
                            >
                              <p className="text-gray-600 dark:text-gray-400">
                                {analysis.sectionScores.format.details}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Actionable Suggestions
                    </h3>
                    <div className="space-y-3">
                      {analysis.feedback.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                        >
                          <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            {suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Strengths & Weaknesses
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Strengths
                        </p>
                        <ul className="space-y-1">
                          {analysis.feedback.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Weaknesses
                        </p>
                        <ul className="space-y-1">
                          {analysis.feedback.weaknesses.map((weakness, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card flex items-center justify-center min-h-[400px]"
                >
                  <div className="text-center">
                    <FileSearch className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Analysis Yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Upload a resume and add a job description to get started
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
