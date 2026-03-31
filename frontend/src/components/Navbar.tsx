import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, Menu } from "lucide-react";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { logoutUser } from "../store/slices/authSlice";
import ConfirmModal from "./ui/ConfirmModal";
import HistoryDropdown from "./ui/HistoryDropdown";
import {
  NavLinks,
  UpgradeButton,
  CreditsBadge,
  ProfileMenu,
  MobileMenuButton,
  MobileMenu,
  AuthButtons,
} from "./shared";

interface NavLink {
  path: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/ats-score", label: "ATS Score" },
  { path: "/job-match", label: "Job Match" },
  { path: "/builder", label: "Builder" },
];

export default function Navbar() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 py-1 bg-gray-900/80 backdrop-blur-md border-b border-gray-600">
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                CV<span className="text-primary">Coach</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <NavLinks navLinks={NAV_LINKS} />
                  <div className="hidden lg:flex">
                    <HistoryDropdown />
                  </div>
                  <div className="hidden lg:flex">
                    <UpgradeButton />
                  </div>
                  <div className="hidden lg:flex">
                    <CreditsBadge user={user} />
                  </div>
                  <ProfileMenu
                    user={user}
                    profileMenuOpen={profileMenuOpen}
                    setProfileMenuOpen={setProfileMenuOpen}
                    onLogout={() => setShowLogoutConfirm(true)}
                  />
                  <MobileMenuButton
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                  />
                </>
              ) : (
                <>
                  <div className="hidden md:flex items-center gap-4">
                    <AuthButtons />
                  </div>
                  <button
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? (
                      <X className="w-6 h-6 text-white" />
                    ) : (
                      <Menu className="w-6 h-6 text-white" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && user && (
            <MobileMenu
              navLinks={NAV_LINKS}
              user={user}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          )}
          {mobileMenuOpen && !user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 py-6 px-4"
            >
              <div className="flex flex-col gap-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-all duration-200 gradient-btn-outline"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gradient-btn"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
