import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileSearch,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  FileText,
  Crown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { logoutUser } from "../store/slices/authSlice";
import ConfirmModal from "../components/ConfirmModal";

export default function Navbar() {
  const { user, loading } = useAppSelector((state) => ({
    user: state.auth.user,
    loading: state.auth.loading,
  }));
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/analyze", label: "Analyze", icon: FileSearch },
    { path: "/history", label: "History", icon: History },
    { path: "/builder", label: "Builder", icon: FileText },
    { path: "/my-resumes", label: "My Resumes", icon: FileText },
  ];

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 py-1 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                CV<span className="text-green-500">Coach</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === link.path
                            ? "bg-green-500/20 text-green-400"
                            : "text-gray-300 hover:bg-gray-800"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <Link
                    to="/plans"
                    className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade
                  </Link>

                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
                    <span className="text-sm font-medium text-green-400">
                      {user.subscription.credits} credits
                    </span>
                  </div>

                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </button>

                    <AnimatePresence>
                      {profileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-sm font-semibold text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-1" title={user.email}>
                              {user.email}
                            </p>
                          </div>
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              setShowLogoutConfirm(true);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white font-medium"
                  >
                    Login
                  </Link>
                  <Link to="/login" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900 border-t border-gray-800"
            >
              <div className="px-4 py-3 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                      location.pathname === link.path
                        ? "bg-green-500/20 text-green-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/plans"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-orange-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Upgrade Plan
                </Link>
                <div className="px-3 py-2 text-sm text-gray-400">
                  {user.subscription.credits} credits
                </div>
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
