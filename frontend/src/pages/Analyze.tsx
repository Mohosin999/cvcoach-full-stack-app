import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  Send,
  RefreshCw,
  FileText,
  Upload,
  Star,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { analysisApi, resumeApi } from '../services/api';
import { Resume, ResumeContent, Analysis } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';
import JobDescriptionInput from '../components/JobDescriptionInput';
import AnalysisProgress, { AnalysisStep } from '../components/AnalysisProgress';
import ResultPanel from '../components/ResultPanel';

const MAX_JD_LENGTH = 10000;

export default function Analyze() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('uploading');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    const analysisId = searchParams.get('analysis');
    if (analysisId) {
      loadAnalysisById(analysisId);
    }
  }, [searchParams]);

  const loadAnalysisById = async (id: string) => {
    setLoadingAnalysis(true);
    try {
      const response = await analysisApi.getById(id);
      if (response.data.success && response.data.data) {
        const analysisData = response.data.data;
        setAnalysis(analysisData);
        if (analysisData.resumeId) {
          setResume(analysisData.resumeId as unknown as Resume);
          setResumeContent(analysisData.resumeId.content);
        }
        setJobDescription(analysisData.jobDescription || '');
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error('Failed to load analysis');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    if (analyzing) {
      const steps: AnalysisStep[] = [
        'uploading',
        'parsing',
        'keywords',
        'skills',
        'formatting',
        'experience',
        'achievements',
        'grammar',
        'matching',
        'complete',
      ];
      
      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex < steps.length - 1) {
          setCurrentStep(steps[stepIndex]);
          stepIndex++;
        } else {
          clearInterval(interval);
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [analyzing]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await resumeApi.upload(formData);
      setResume(response.data.data);
      setResumeContent(response.data.data.content);
      setUploadSuccess(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  }, []);

  const simulateAnalysis = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    
    const steps: AnalysisStep[] = [
      'uploading',
      'parsing',
      'keywords',
      'skills',
      'formatting',
      'experience',
      'achievements',
      'grammar',
      'matching',
      'complete',
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    return steps[steps.length - 1];
  };

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
      navigate('/plans');
      return;
    }

    try {
      await simulateAnalysis();
      
      const response = await analysisApi.create({
        resumeId: resume._id,
        jobDescription,
      });

      setAnalysis(response.data.data);
      await refreshUser();
      setCurrentStep('complete');
      toast.success('Analysis complete!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Analysis failed');
      setAnalyzing(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const clearAll = () => {
    setResume(null);
    setResumeContent(null);
    setJobDescription('');
    setAnalysis(null);
    setCurrentStep('uploading');
    setAnalyzing(false);
  };

  const clearResume = () => {
    setResume(null);
    setResumeContent(null);
    setUploadSuccess(false);
  };

  const clearJobDescription = () => {
    setJobDescription('');
  };

  const handleClearAll = () => {
    if (analyzing) {
      setAnalyzing(false);
    }
    clearAll();
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
            <Star className="w-4 h-4" />
            <span>{user?.subscription.credits || 0} credits remaining</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  1. Upload Resume
                </h2>
                {resume && (
                  <button
                    onClick={clearResume}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            
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
                      {uploadSuccess ? (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : uploading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <FileText className="w-8 h-8 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {resume.metadata?.originalName || 'Resume uploaded'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {uploadSuccess ? 'Ready to analyze' : 'Click to upload different file'}
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

            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
              onClear={clearJobDescription}
              maxLength={MAX_JD_LENGTH}
            />

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
                onClick={handleClearAll}
                className="btn-ghost px-4"
                title="Clear all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {loadingAnalysis ? (
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
                      Loading analysis...
                    </p>
                  </div>
                </motion.div>
              ) : analyzing ? (
                <AnalysisProgress currentStep={currentStep} showDetails={true} />
              ) : analysis ? (
                <ResultPanel analysis={analysis} />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card text-center py-16"
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
    </div>
  );
}
