/* ===================================
Landing Page - Main Component
=================================== */
import { useState } from "react";
import { useAppDispatch } from "../hooks/redux";
import { logoutUser } from "../store/slices/authSlice";
import { ConfirmModal } from "../components/ui";
import { allFeatures, analysisSteps, creationSteps, jobMatchSteps, testimonials } from "../constants/landingData";
import {
  FloatingOrbs, HeroSection, StatsSection, FeaturesSection,
  HowItWorksSection, TestimonialsSection, CTASection,
} from "../components/shared";
import Footer from "../components/Footer";

export default function Landing() {
  const dispatch = useAppDispatch();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "creation" | "jobmatch">("analysis");

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await dispatch(logoutUser());
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/95 to-gray-900 overflow-hidden relative">
        <FloatingOrbs />
        <main className="relative z-10">
          <HeroSection user={undefined} onLogout={() => setShowLogoutConfirm(true)} />
          <StatsSection />
          <FeaturesSection features={allFeatures} />
          <HowItWorksSection activeTab={activeTab} setActiveTab={setActiveTab} steps={activeTab === "analysis" ? analysisSteps : activeTab === "creation" ? creationSteps : jobMatchSteps} />
          <TestimonialsSection testimonials={testimonials} />
          <CTASection />
        </main>
        <Footer />
      </div>
      <ConfirmModal isOpen={showLogoutConfirm} title="Logout" message="Are you sure you want to logout?" confirmText="Logout" cancelText="Cancel" onConfirm={handleLogout} onCancel={() => setShowLogoutConfirm(false)} type="warning" />
    </>
  );
}
