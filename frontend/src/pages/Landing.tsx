import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield,
  FileText,
  Brain,
  Target,
  Sparkles,
  Users,
  TrendingUp,
  Award,
  ChevronRight,
  Play,
  FileUp,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import {
  allFeatures,
  analysisSteps,
  creationSteps,
  testimonials,
} from "@/constants/landingData";
import { fadeInUp, floatAnimation, staggerContainer } from "../animations";

export default function Landing() {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "creation">(
    "analysis",
  );

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  return (
    <>
      {/* Animated Background */}
      <div
        className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/95 to-gray-900 overflow-hidden relative darkreader-lock"
        data-darkreader-lock
      >
        {/* Floating Orbs Background - Green/Dark Theme */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-400/8 rounded-full blur-3xl"
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -40, 40, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <main className="relative z-10">
          {/* Hero Section */}
          <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-left"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-full text-green-400 text-sm font-semibold mb-8 border border-green-700/50"
                  >
                    <Sparkles className="w-4 h-4" />
                    Powered by Advanced AI
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight"
                  >
                    Land Your Dream Job with{" "}
                    <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                      AI-Optimized Resumes
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-8 text-xl text-gray-300 max-w-xl"
                  >
                    Analyze your resume against job descriptions, get actionable
                    feedback, and generate ATS-friendly versions that stand out.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="mt-10 flex flex-col sm:flex-row gap-4"
                  >
                    <Link
                      to="/login"
                      className="group btn-primary text-lg px-8 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 shadow-xl shadow-green-500/40 hover:shadow-green-500/60 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Start Free Analysis
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/login"
                      className="group text-lg px-8 py-4 border-2 border-green-700 text-green-400 rounded-lg hover:bg-green-900/30 transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
                    >
                      <Play className="w-5 h-5" />
                      Watch Demo
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="mt-12 flex items-center gap-8"
                  >
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold"
                        >
                          <Users className="w-5 h-5" />
                        </motion.div>
                      ))}
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-white">10,000+</p>
                      <p className="text-gray-400">Happy Users</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="mt-10 flex flex-wrap gap-6"
                  >
                    {[
                      { icon: CheckCircle, text: "Free to start" },
                      { icon: Shield, text: "Secure & Private" },
                      { icon: Zap, text: "Instant Results" },
                    ].map((item, i) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 + i * 0.1 }}
                        className="flex items-center gap-2 text-sm text-gray-400"
                      >
                        <item.icon className="w-4 h-4 text-green-500" />
                        {item.text}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Right Content - Animated Cards */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative hidden lg:block"
                >
                  <div className="relative h-[600px]">
                    {/* Main Card */}
                    <motion.div
                      variants={floatAnimation}
                      animate="animate"
                      className="absolute top-10 left-0 right-0 bg-gray-800/90 backdrop-blur rounded-3xl shadow-2xl shadow-green-500/20 p-8 border border-green-700/30"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                          <Brain className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            AI Analysis
                          </h3>
                          <p className="text-sm text-gray-400">
                            Real-time scoring
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            ATS Score
                          </span>
                          <span className="text-lg font-bold text-green-400">
                            92%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "92%" }}
                            transition={{ duration: 1.5, delay: 1 }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            Match Rate
                          </span>
                          <span className="text-lg font-bold text-emerald-400">
                            88%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "88%" }}
                            transition={{ duration: 1.5, delay: 1.2 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Floating Badge 1 */}
                    <motion.div
                      variants={floatAnimation}
                      animate="animate"
                      transition={{ delay: 0.5 }}
                      className="absolute top-40 -right-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-5 shadow-xl"
                    >
                      <Target className="w-8 h-8 mb-2" />
                      <p className="text-2xl font-bold">95%</p>
                      <p className="text-sm opacity-90">Success Rate</p>
                    </motion.div>

                    {/* Floating Badge 2 */}
                    <motion.div
                      variants={floatAnimation}
                      animate="animate"
                      transition={{ delay: 1 }}
                      className="absolute bottom-32 -left-4 bg-gray-800/90 backdrop-blur rounded-2xl p-5 shadow-xl border border-green-700/30"
                    >
                      <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold text-white">4.9/5</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 fill-amber-400 text-amber-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Floating Badge 3 */}
                    <motion.div
                      variants={floatAnimation}
                      animate="animate"
                      transition={{ delay: 1.5 }}
                      className="absolute bottom-10 right-10 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-2xl p-5 shadow-xl"
                    >
                      <TrendingUp className="w-8 h-8 mb-2" />
                      <p className="text-2xl font-bold">3x</p>
                      <p className="text-sm opacity-90">More Interviews</p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700"
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                {[
                  { value: "10K+", label: "Active Users" },
                  { value: "50K+", label: "Resumes Analyzed" },
                  { value: "95%", label: "Success Rate" },
                  { value: "4.9/5", label: "User Rating" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeInUp}
                    className="text-center"
                  >
                    <motion.p
                      initial={{ scale: 0.5 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: "spring", delay: index * 0.1 }}
                      className="text-4xl sm:text-5xl font-bold text-white"
                    >
                      {stat.value}
                    </motion.p>
                    <p className="mt-2 text-green-100 font-medium">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Features Section */}
          <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/50 rounded-full text-green-400 text-sm font-semibold mb-4 border border-green-700/50"
                >
                  <Zap className="w-4 h-4" />
                  Powerful Features
                </motion.div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white">
                  Why Choose{" "}
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ResumeAI?
                  </span>
                </h2>
                <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
                  Everything you need to analyze, create, and optimize your
                  resume for success
                </p>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {allFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    whileHover={{
                      y: -10,
                      transition: { duration: 0.3 },
                    }}
                    className="group relative bg-gray-800/50 backdrop-blur rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 border border-gray-700 hover:border-green-600 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 text-center">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-center leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* How It Works Section - Tabs for Analysis & Creation */}
          <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-800/50 via-green-900/10 to-gray-800/50">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-green-400 text-sm font-semibold mb-4 border border-gray-700"
                >
                  <FileText className="w-4 h-4" />
                  Simple Process
                </motion.div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">
                  How It{" "}
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Works
                  </span>
                </h2>

                {/* Tab Switcher */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex bg-gray-800 rounded-xl p-1 border border-gray-700"
                >
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                      activeTab === "analysis"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <FileUp className="w-4 h-4" />
                    Resume Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab("creation")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                      activeTab === "creation"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Wand2 className="w-4 h-4" />
                    Resume Creation
                  </button>
                </motion.div>
              </motion.div>

              <motion.div
                key={activeTab}
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-12"
              >
                {(activeTab === "analysis" ? analysisSteps : creationSteps).map(
                  (step, index) => (
                    <motion.div
                      key={step.number}
                      variants={fadeInUp}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: "spring", delay: index * 0.2 }}
                          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl shadow-green-500/30 group-hover:scale-110 transition-transform duration-300"
                        >
                          <span className="text-4xl font-bold text-white">
                            {step.number}
                          </span>
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                      {index < 2 && (
                        <div className="hidden md:block absolute top-12 left-2/3 w-full">
                          <ChevronRight className="w-8 h-8 text-green-700 mx-auto" />
                        </div>
                      )}
                    </motion.div>
                  ),
                )}
              </motion.div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/50 rounded-full text-green-400 text-sm font-semibold mb-4 border border-green-700/50"
                >
                  <Star className="w-4 h-4" />
                  Success Stories
                </motion.div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white">
                  Loved by{" "}
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Thousands
                  </span>
                </h2>
                <p className="mt-4 text-xl text-gray-400">
                  See what our users have to say
                </p>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.name}
                    variants={fadeInUp}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.3 },
                    }}
                    className="group bg-gray-800/50 backdrop-blur rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 border border-gray-700 hover:border-green-600 transition-all duration-300"
                  >
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + i * 0.05 }}
                        >
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-24 px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 rounded-3xl p-12 overflow-hidden shadow-2xl shadow-green-500/40"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                </div>

                <div className="relative text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-semibold mb-6 backdrop-blur-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Your Journey Today
                  </motion.div>

                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                    Ready to Boost Your Career?
                  </h2>
                  <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
                    Join thousands of job seekers who have transformed their
                    resumes and landed their dream jobs with ResumeAI.
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/login"
                      className="group inline-flex items-center gap-3 bg-white text-green-600 px-10 py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      Get Started for Free
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-green-100 text-sm"
                  >
                    No credit card required • Free to start • Cancel anytime
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ResumeAI
                  </span>
                </div>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  AI-powered resume analysis and generation platform helping job
                  seekers land their dream careers with optimized, ATS-friendly
                  resumes.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4 text-green-400">
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {["Features", "How It Works", "Testimonials", "Pricing"].map(
                    (item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-gray-400 hover:text-green-400 transition-colors"
                        >
                          {item}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4 text-green-400">Legal</h4>
                <ul className="space-y-3">
                  {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                    (item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-gray-400 hover:text-green-400 transition-colors"
                        >
                          {item}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © 2024 ResumeAI. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        type="warning"
      />
    </>
  );
}
