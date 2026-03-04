import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import { features, steps, testimonials } from "@/constants";

export default function Landing() {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <main>
          <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                  <Zap className="w-4 h-4" />
                  AI-Powered Resume Analysis
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Land Your Dream Job with{" "}
                  <span className="text-gradient bg-gradient-to-r from-primary via-secondary to-accent">
                    AI-Optimized Resumes
                  </span>
                </h1>

                <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Analyze your resume against job descriptions, get actionable
                  feedback, and generate ATS-friendly versions that stand out.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/login"
                    className="btn-primary text-lg px-8 py-3 flex items-center gap-2"
                  >
                    Start Free Analysis
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/login" className="btn-outline text-lg px-8 py-3">
                    Watch Demo
                  </Link>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Free to start
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    Secure & Private
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card text-center hover:-translate-y-1 transition-transform"
                  >
                    <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  How It Works
                </h2>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Three simple steps to improve your resume
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="text-8xl font-bold text-primary/10 absolute -top-4 left-0">
                      {step.number}
                    </div>
                    <div className="relative pt-8">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  What Our Users Say
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card"
                  >
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-warning text-warning"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Ready to Boost Your Career?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                  Join thousands of job seekers who have improved their resumes
                  with ResumeAI.
                </p>
                <Link
                  to="/login"
                  className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </section>
        </main>

        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ResumeAI</span>
              </div>
              <p className="text-gray-400 text-sm">
                © 2024 ResumeAI. All rights reserved.
              </p>
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

// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Flame,
//   FileSearch,
//   TrendingUp,
//   Download,
//   CheckCircle,
//   ArrowRight,
//   Star,
//   Zap,
//   Shield,
//   LogOut,
// } from "lucide-react";
// import { useState } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import ConfirmModal from "../components/ConfirmModal";

// const features = [
//   {
//     icon: FileSearch,
//     title: "AI-Powered Analysis",
//     description:
//       "Advanced AI analyzes your resume against job descriptions to identify gaps and opportunities.",
//   },
//   {
//     icon: TrendingUp,
//     title: "ATS Optimization",
//     description:
//       "Get detailed ATS compatibility scores and recommendations to pass automated screening.",
//   },
//   {
//     icon: Flame,
//     title: "Smart Suggestions",
//     description:
//       "Receive personalized improvements for skills, experience, and formatting.",
//   },
//   {
//     icon: Download,
//     title: "Multiple Export Formats",
//     description:
//       "Download your improved resume in PDF or DOCX while keeping the original layout.",
//   },
// ];

// const steps = [
//   {
//     number: "01",
//     title: "Upload Resume",
//     description: "Drag and drop your PDF or DOCX resume into the upload zone.",
//   },
//   {
//     number: "02",
//     title: "Add Job Description",
//     description:
//       "Paste the job description you want to target with your resume.",
//   },
//   {
//     number: "03",
//     title: "Get AI Analysis",
//     description:
//       "Receive comprehensive feedback with scores and actionable suggestions.",
//   },
// ];

// const testimonials = [
//   {
//     name: "Sarah Johnson",
//     role: "Software Engineer at Google",
//     content:
//       "ResumeAI helped me land my dream job! The AI suggestions were incredibly helpful.",
//     rating: 5,
//   },
//   {
//     name: "Michael Chen",
//     role: "Product Manager at Meta",
//     content:
//       "The ATS optimization feature is a game-changer. Got past screening every time.",
//     rating: 5,
//   },
//   {
//     name: "Emily Davis",
//     role: "Data Scientist at Netflix",
//     content:
//       "Love how easy it is to improve my resume for different positions.",
//     rating: 5,
//   },
// ];

// export default function Landing() {
//   const { user, logout } = useAuth();
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

//   const handleLogout = async () => {
//     setShowLogoutConfirm(false);
//     await logout();
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//         <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between h-16">
//               <Link to="/" className="flex items-center gap-2">
//                 {/* <div className="w-8 h-8 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg flex items-center justify-center"> */}
//                 <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
//                   <Flame className="w-5 h-5 text-white" />
//                 </div>
//                 <span className="text-xl font-bold text-gray-900 dark:text-white">
//                   CV<span className="text-cyan-500">Coach</span>
//                 </span>
//               </Link>

//               <div className="flex items-center gap-4">
//                 {user ? (
//                   <>
//                     <Link to="/dashboard" className="btn-primary">
//                       Go to Dashboard
//                     </Link>
//                     <button
//                       onClick={() => setShowLogoutConfirm(true)}
//                       className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium"
//                     >
//                       <LogOut className="w-5 h-5" />
//                       Logout
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <Link
//                       to="/login"
//                       className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
//                     >
//                       Login
//                     </Link>
//                     <Link to="/login" className="btn-primary">
//                       Get Started
//                     </Link>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </header>

//         <main>
//           <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-7xl mx-auto">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6 }}
//                 className="text-center"
//               >
//                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
//                   <Zap className="w-4 h-4" />
//                   AI-Powered Resume Analysis
//                 </div>

//                 <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
//                   Land Your Dream Job with{" "}
//                   <span className="text-gradient bg-gradient-to-r from-primary via-secondary to-accent">
//                     AI-Optimized Resumes
//                   </span>
//                 </h1>

//                 <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//                   Analyze your resume against job descriptions, get actionable
//                   feedback, and generate ATS-friendly versions that stand out.
//                 </p>

//                 <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
//                   <Link
//                     to="/login"
//                     className="btn-primary text-lg px-8 py-3 flex items-center gap-2"
//                   >
//                     Start Free Analysis
//                     <ArrowRight className="w-5 h-5" />
//                   </Link>
//                   <Link to="/login" className="btn-outline text-lg px-8 py-3">
//                     Watch Demo
//                   </Link>
//                 </div>

//                 <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
//                   <div className="flex items-center gap-2">
//                     <CheckCircle className="w-4 h-4 text-success" />
//                     Free to start
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <CheckCircle className="w-4 h-4 text-success" />
//                     No credit card required
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Shield className="w-4 h-4 text-success" />
//                     Secure & Private
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </section>

//           <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
//             <div className="max-w-7xl mx-auto">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//                 {features.map((feature, index) => (
//                   <motion.div
//                     key={feature.title}
//                     initial={{ opacity: 0, y: 20 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: index * 0.1 }}
//                     viewport={{ once: true }}
//                     className="card text-center hover:-translate-y-1 transition-transform"
//                   >
//                     <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
//                       <feature.icon className="w-7 h-7 text-primary" />
//                     </div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//                       {feature.title}
//                     </h3>
//                     <p className="text-gray-600 dark:text-gray-400 text-sm">
//                       {feature.description}
//                     </p>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           </section>

//           <section className="py-20 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-7xl mx-auto">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 className="text-center mb-16"
//               >
//                 <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
//                   How It Works
//                 </h2>
//                 <p className="mt-4 text-gray-600 dark:text-gray-400">
//                   Three simple steps to improve your resume
//                 </p>
//               </motion.div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                 {steps.map((step, index) => (
//                   <motion.div
//                     key={step.number}
//                     initial={{ opacity: 0, y: 20 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: index * 0.15 }}
//                     viewport={{ once: true }}
//                     className="relative"
//                   >
//                     <div className="text-8xl font-bold text-primary/10 absolute -top-4 left-0">
//                       {step.number}
//                     </div>
//                     <div className="relative pt-8">
//                       <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                         {step.title}
//                       </h3>
//                       <p className="text-gray-600 dark:text-gray-400">
//                         {step.description}
//                       </p>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           </section>

//           <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
//             <div className="max-w-7xl mx-auto">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 className="text-center mb-16"
//               >
//                 <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
//                   What Our Users Say
//                 </h2>
//               </motion.div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                 {testimonials.map((testimonial, index) => (
//                   <motion.div
//                     key={testimonial.name}
//                     initial={{ opacity: 0, y: 20 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: index * 0.1 }}
//                     viewport={{ once: true }}
//                     className="card"
//                   >
//                     <div className="flex items-center gap-1 mb-4">
//                       {[...Array(testimonial.rating)].map((_, i) => (
//                         <Star
//                           key={i}
//                           className="w-4 h-4 fill-warning text-warning"
//                         />
//                       ))}
//                     </div>
//                     <p className="text-gray-600 dark:text-gray-400 mb-4">
//                       "{testimonial.content}"
//                     </p>
//                     <div>
//                       <p className="font-semibold text-gray-900 dark:text-white">
//                         {testimonial.name}
//                       </p>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         {testimonial.role}
//                       </p>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           </section>

//           <section className="py-20 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-4xl mx-auto text-center">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//               >
//                 <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
//                   Ready to Boost Your Career?
//                 </h2>
//                 <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
//                   Join thousands of job seekers who have improved their resumes
//                   with ResumeAI.
//                 </p>
//                 <Link
//                   to="/login"
//                   className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
//                 >
//                   Get Started for Free
//                   <ArrowRight className="w-5 h-5" />
//                 </Link>
//               </motion.div>
//             </div>
//           </section>
//         </main>

//         <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-7xl mx-auto">
//             <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-8 h-8 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg flex items-center justify-center">
//                   <Flame className="w-5 h-5 text-white" />
//                 </div>
//                 <span className="text-xl font-bold">ResumeAI</span>
//               </div>
//               <p className="text-gray-400 text-sm">
//                 © 2024 ResumeAI. All rights reserved.
//               </p>
//             </div>
//           </div>
//         </footer>
//       </div>

//       <ConfirmModal
//         isOpen={showLogoutConfirm}
//         title="Logout"
//         message="Are you sure you want to logout?"
//         confirmText="Logout"
//         cancelText="Cancel"
//         onConfirm={handleLogout}
//         onCancel={() => setShowLogoutConfirm(false)}
//         type="warning"
//       />
//     </>
//   );
// }
