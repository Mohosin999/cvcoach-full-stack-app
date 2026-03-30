import { ResumeContent } from "@/types";

export function EducationPreview({
  education,
}: {
  education: ResumeContent["education"];
  forPdf: boolean;
}) {
  return (
    <div className="mb-3 px-6">
      <h2 className="text-[10px] font-bold text-black uppercase tracking-wide border-b border-gray-700 mb-1.5">
        EDUCATION
      </h2>
      {education.map((edu, index) => (
        <div key={index} className="flex items-start mb-1.5 last:mb-0">
          <div>
            <h3 className="text-[10px] font-bold text-black">
              {edu.institution}
            </h3>
            <p className="text-[9px] text-black">{edu.degree}</p>
          </div>
          <div className="ml-auto">
            {edu.date && <p className="text-[9px] text-black">{edu.date}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
