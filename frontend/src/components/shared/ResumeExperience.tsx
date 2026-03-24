/* ===================================
Resume Experience Component
=================================== */
import { Experience } from "../../types";

interface ResumeExperienceProps {
  experience: Experience[];
  forPdf?: boolean;
  formatDescription: (desc: string) => React.ReactNode;
}

export default function ResumeExperience({ experience, forPdf, formatDescription }: ResumeExperienceProps) {
  const textColor = forPdf ? "text-gray-600" : "text-gray-600 dark:text-gray-400";
  const titleColor = forPdf ? "text-black" : "text-gray-900 dark:text-white";
  const borderColor = forPdf ? "border-gray-600" : "border-gray-300 dark:border-gray-600";

  return (
    <div className="mb-4">
      <h2 className={`text-sm font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-2 mb-3`}>
        EXPERIENCE
      </h2>
      {experience.map((exp, index) => (
        <div key={index} className="mb-3">
          <div className="flex justify-between items-start gap-2">
            <span className={`font-bold ${titleColor} text-sm`}>{exp.title}</span>
            <span className={`text-xs ${textColor} flex-shrink-0`}>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
          </div>
          <p className={`${textColor} text-xs font-medium mt-0.5`}>{exp.company}</p>
          <div className={`${forPdf ? "text-gray-700" : "text-gray-700 dark:text-gray-300"} text-xs mt-1`}>
            {formatDescription(exp.description)}
          </div>
        </div>
      ))}
    </div>
  );
}
