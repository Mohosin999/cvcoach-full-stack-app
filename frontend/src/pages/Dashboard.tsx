import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileSearch,
  FileText,
  TrendingUp,
  Plus,
  Clock,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analysisApi, resumeApi } from '../services/api';
import { Analysis, Resume } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [recentResumes, setRecentResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysesRes, resumesRes] = await Promise.all([
          analysisApi.getAll(1, 5),
          resumeApi.getAll(1, 5),
        ]);
        
        setRecentAnalyses(analysesRes.data.data || []);
        setRecentResumes(resumesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const stats = [
    {
      label: 'Total Analyses',
      value: recentAnalyses.length,
      icon: FileSearch,
      color: 'bg-blue-500',
    },
    {
      label: 'Saved Resumes',
      value: recentResumes.length,
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      label: 'Credits Left',
      value: user?.subscription.credits || 0,
      icon: Zap,
      color: 'bg-amber-500',
    },
    {
      label: 'Avg Match Score',
      value: recentAnalyses.length > 0
        ? Math.round(
            recentAnalyses.reduce((acc, a) => acc + a.score, 0) / recentAnalyses.length
          )
        : 0,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
  ];

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
            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's an overview of your resume analysis activity
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Analyses
                </h2>
                <Link
                  to="/history"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {recentAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <div
                      key={analysis._id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            analysis.score >= 70
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : analysis.score >= 50
                              ? 'bg-yellow-100 dark:bg-yellow-900/30'
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}
                        >
                          <span
                            className={`font-bold ${
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
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {analysis.jobTitle || 'Resume Analysis'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {analysis.company || 'General'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileSearch className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No analyses yet
                  </p>
                  <Link to="/analyze" className="btn-primary mt-4 inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Start Analysis
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/analyze"
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <FileSearch className="w-5 h-5" />
                  New Analysis
                </Link>
                <Link
                  to="/builder"
                  className="w-full btn-outline flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Build Resume
                </Link>
                <Link
                  to="/saved-resumes"
                  className="w-full btn-ghost flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  My Resumes
                </Link>
              </div>

              {user?.subscription.plan === 'free' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Upgrade to Pro
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Get unlimited analyses and advanced features.
                  </p>
                  <button className="w-full btn-secondary text-sm">
                    View Plans
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
