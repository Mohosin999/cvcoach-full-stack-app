/* ===================================
Resume Skills Component
=================================== */
import { ResumeContent } from "../../types";

interface ResumeSkillsProps {
  content: ResumeContent;
  forPdf?: boolean;
}

export default function ResumeSkills({ content, forPdf }: ResumeSkillsProps) {
  const textColor = forPdf ? "text-gray-700" : "text-gray-700 dark:text-gray-300";
  const titleColor = forPdf ? "text-black" : "text-gray-900 dark:text-white";
  const borderColor = forPdf ? "border-gray-600" : "border-gray-300 dark:border-gray-600";

  const technicalSkills = content.technicalSkills || [];
  const softSkills = content.softSkills || [];

  return (
    <div className="mb-4">
      <h2 className={`text-sm font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-2 mb-3`}>
        SKILLS
      </h2>
      <div className={`${textColor} text-xs space-y-1`}>
        {technicalSkills.length > 0 && (
          <div>
            <span className="font-semibold">• Technical Skills:</span> {technicalSkills.join(", ")}
          </div>
        )}
        {softSkills.length > 0 && (
          <div>
            <span className="font-semibold">• Soft Skills:</span> {softSkills.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
