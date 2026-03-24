/* ===================================
Resume Projects Component
=================================== */
import { ExternalLink } from "lucide-react";
import { Project } from "../../types";

interface ResumeProjectsProps {
  projects: Project[];
  forPdf?: boolean;
  formatDescription: (desc: string) => React.ReactNode;
}

export default function ResumeProjects({ projects, forPdf, formatDescription }: ResumeProjectsProps) {
  const textColor = forPdf ? "text-gray-500" : "text-gray-500 dark:text-gray-400";
  const titleColor = forPdf ? "text-black" : "text-gray-900 dark:text-white";
  const linkColor = forPdf ? "text-blue-600" : "text-blue-600 dark:text-blue-400";
  const borderColor = forPdf ? "border-gray-600" : "border-gray-300 dark:border-gray-600";

  return (
    <div className="mb-4">
      <h2 className={`text-sm font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-2 mb-3`}>
        PROJECTS
      </h2>
      {projects.map((proj, index) => (
        <div key={index} className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold ${titleColor} text-sm`}>{proj.name}</span>
            {(proj.links?.live || proj.links?.github) && (
              <div className={`flex gap-3 text-xs ${linkColor}`}>
                {proj.links.live && (
                  <span onClick={() => window.open(proj.links!.live!.startsWith("http") ? proj.links!.live : `https://${proj.links!.live}`, '_blank')} className="hover:underline cursor-pointer">Live</span>
                )}
                {proj.links.github && (
                  <span onClick={() => window.open(proj.links!.github!.startsWith("http") ? proj.links!.github : `https://${proj.links!.github}`, '_blank')} className="hover:underline cursor-pointer">GitHub</span>
                )}
              </div>
            )}
          </div>
          {proj.technologies && proj.technologies.length > 0 && (
            <p className={`text-xs ${textColor} mt-1 italic`}>{proj.technologies.join(", ")}</p>
          )}
          <div className={`${forPdf ? "text-gray-700" : "text-gray-700 dark:text-gray-300"} text-xs mt-1`}>
            {formatDescription(proj.description)}
          </div>
        </div>
      ))}
    </div>
  );
}
