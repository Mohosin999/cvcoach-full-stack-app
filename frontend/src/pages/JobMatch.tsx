import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Briefcase, CheckCircle, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { jobMatchApi, resumeParserApi } from "../api/api";
import { useAppDispatch } from "../hooks/redux";
import { setUserCredits } from "../store/slices/authSlice";
import BackButton from "../components/ui/BackButton";
import ScoreCard from "../components/ui/ScoreCard";
import MatchBreakdown from "../components/MatchBreakdown";
import SuggestionList from "../components/SuggestionList";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { JobMatchHistory, ResumeContent } from "../types";

export default function JobMatchPage() {
  const navigate = useNavigate();
  const { id: analysisId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [resumeName, setResumeName] = useState("");
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(
    null,
  );
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<JobMatchHistory | null>(null);

  useEffect(() => {
    if (analysisId) {
      loadAnalysis(analysisId);
    } else {
      setResult(null);
      setResumeName("");
      setResumeContent(null);
      setJobDescription("");
    }
  }, [analysisId]);

  const loadAnalysis = async (id: string) => {
    setLoading(true);
    try {
      const response = await jobMatchApi.getById(id);
      if (response.data.data) {
        setResult(response.data.data);
        setResumeName(response.data.data.resumeName);
        setResumeContent(response.data.data.resumeContent);
        setJobDescription(response.data.data.jobDescription || "");
      }
    } catch (error) {
      toast.error("Failed to load analysis");
      navigate("/job-match");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("resume", file);
      const response = await resumeParserApi.parse(formData);
      setResumeName(response.data.data.resumeName);
      setResumeContent(response.data.data.resumeContent);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeContent) {
      toast.error("Please upload a resume");
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Please paste the job description");
      return;
    }

    try {
      setAnalyzing(true);
      const response = await jobMatchApi.analyze({
        resumeName,
        resumeContent,
        jobDescription,
      });
      setResult(response.data.data);
      
      if (response.data.credits !== undefined) {
        dispatch(setUserCredits(response.data.credits));
        toast.success(`Job match analysis completed! 1 credit deducted. New balance: ${response.data.credits}`);
      } else {
        toast.success("Job match analysis completed");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to analyze job match",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setResumeName("");
    setResumeContent(null);
    setJobDescription("");
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mt-6 mb-4">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Job Match Analysis
          </h1>
          <p className="text-gray-400">
            Compare your resume against a job description to see how well you
            match
          </p>
        </motion.div>

        {!result ? (
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Step 1: Upload Resume
              </h2>

              <div className="mb-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOCX (MAX. 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await handleFileUpload(file);
                    }}
                  />
                </label>
              </div>

              {resumeName && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Selected: {resumeName}</span>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Step 2: Paste Job Description
              </h2>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={12}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <button
                onClick={handleAnalyze}
                disabled={!resumeContent || !jobDescription.trim() || analyzing}
                className="w-full mt-4 h-12 gradient-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner /> Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Briefcase className="w-5 h-5" /> Analyze Job Match
                  </span>
                )}
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="md:col-span-1">
                <ScoreCard
                  score={result.matchPercentage}
                  label="Match Percentage"
                  size="lg"
                  showProgress
                />
              </div>
              <div className="md:col-span-2 bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Analysis Complete
                </h2>
                <p className="text-gray-400 mb-4">Resume: {resumeName}</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Analyze Another Job
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Match Breakdown
              </h2>
              <MatchBreakdown breakdown={result.breakdown} />
            </motion.div>

            {result.missingSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Missing Skills
                </h2>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-red-900/30 border border-red-500/30 text-red-400 rounded-lg text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Tailoring Suggestions
              </h2>
              <SuggestionList
                suggestions={result.suggestions}
                title="AI Suggestions"
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
