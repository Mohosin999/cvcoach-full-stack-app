/* ===================================
Auth Buttons Component
=================================== */
import { Link } from "react-router-dom";

export default function AuthButtons() {
  return (
    <>
      <Link to="/login" className="text-gray-300 hover:text-white font-medium">Login</Link>
      <Link to="/login" className="inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white hover:from-emerald-700 hover:to-emerald-500 shadow-lg shadow-emerald-700/30">Get Started</Link>
    </>
  );
}
