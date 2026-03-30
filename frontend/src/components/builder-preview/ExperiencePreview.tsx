import { ResumeContent } from "@/types";

export function ExperiencePreview({
  experience,
  formatDescription,
}: {
  experience: ResumeContent["experience"];
  forPdf: boolean;
  formatDescription: (desc: string) => React.ReactNode;
}) {
  return (
    <div className="mb-3 px-6">
      <h2 className="text-[10px] font-bold text-black uppercase tracking-wide border-b border-gray-700 mb-1.5">
        EXPERIENCE
      </h2>
      {experience.map((exp, index) => (
        <div key={index} className="mb-2.5 last:mb-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[10px] font-bold text-black">
                {exp.company}
              </h3>
              <p className="text-[9px] text-black font-medium">
                {exp.title}
                {exp.topSkills && exp.topSkills.length > 0 && (
                  <span className="font-normal text-black">
                    {" - "}
                    {exp.topSkills.map((skill, i) => (
                      <span key={i} className="italic">
                        {skill}
                        {i < exp.topSkills!.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-black">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate || ""}
              </p>
              {exp.location && (
                <p className="text-[9px] text-black">{exp.location}</p>
              )}
            </div>
          </div>
          {exp.description && (
            <div className="mt-1">{formatDescription(exp.description)}</div>
          )}
        </div>
      ))}
    </div>
  );
}
