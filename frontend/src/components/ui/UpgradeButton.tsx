import { Link } from "react-router-dom";
import { Crown } from "lucide-react";

export default function UpgradeButton() {
  return (
    <Link to="/plans" className="hidden md:flex gradient-btn">
      <Crown className="w-4 h-4 mr-2" /> Upgrade
    </Link>
  );
}
