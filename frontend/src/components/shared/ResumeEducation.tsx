/* ===================================
Resume Education Component
=================================== */
import { Education } from "../../types";

interface ResumeEducationProps {
  education: Education[];
  forPdf?: boolean;
}

export default function ResumeEducation({ education, forPdf }: ResumeEducationProps) {
  const textColor = forPdf ? "text-gray-600" : "text-gray-600 dark:text-gray-400";
  const titleColor = forPdf ? "text-black" : "text-gray-900 dark:text-white";
  const borderColor = forPdf ? "border-gray-600" : "border-gray-300 dark:border-gray-600";

  return (
    <div className="mb-4">
      <h2 className={`text-sm font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-2 mb-3`}>
        EDUCATION
      </h2>
      {education.map((edu, index) => (
        <div key={index} className="mb-2">
          <div className="flex justify-between items-start gap-2">
            <span className={`font-bold ${titleColor} text-sm`}>{edu.degree}</span>
            <span className={`text-xs ${textColor} flex-shrink-0`}>{edu.date}</span>
          </div>
          <p className={`${textColor} text-xs mt-0.5`}>{edu.institution}</p>
        </div>
      ))}
    </div>
  );
}
