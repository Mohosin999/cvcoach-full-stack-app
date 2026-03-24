/* ===================================
Resume Achievements Component
=================================== */
import { Achievement } from "../../types";

interface ResumeAchievementsProps {
  achievements: Achievement[];
  forPdf?: boolean;
}

export default function ResumeAchievements({ achievements, forPdf }: ResumeAchievementsProps) {
  const textColor = forPdf ? "text-gray-700" : "text-gray-700 dark:text-gray-300";
  const titleColor = forPdf ? "text-black" : "text-gray-900 dark:text-white";
  const borderColor = forPdf ? "border-gray-600" : "border-gray-300 dark:border-gray-600";

  return (
    <div className="mb-4">
      <h2 className={`text-sm font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-2 mb-3`}>
        ACHIEVEMENTS
      </h2>
      <div className="space-y-1">
        {achievements.map((ach, index) => (
          <div key={index} className={`${textColor} text-xs`}>• {ach.title}</div>
        ))}
      </div>
    </div>
  );
}
