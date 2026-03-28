/* ===================================
Resume Skills Component
=================================== */
import { ResumeContent } from "../../types";

interface ResumeSkillsProps {
  content: ResumeContent;
  forPdf?: boolean;
}

export default function ResumeSkills({ content, forPdf }: ResumeSkillsProps) {
  const textColor = forPdf ? "text-gray-900" : "text-gray-900 dark:text-gray-100";
  const titleColor = forPdf ? "text-black" : "text-gray-900 dark:text-white";
  const borderColor = forPdf ? "border-gray-700" : "border-gray-700 dark:border-gray-600";

  const technicalSkills = content.technicalSkills || [];
  const softSkills = content.softSkills || [];

  return (
    <div className="mb-4">
      <h2 className={`text-base font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-1 mb-3`}>
        SKILLS
      </h2>
      <div className={`${textColor} text-sm space-y-1`}>
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
