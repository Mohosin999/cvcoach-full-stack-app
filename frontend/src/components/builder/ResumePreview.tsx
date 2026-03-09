import {
  ResumeContent,
  Experience,
  Project,
  Achievement,
  Certification,
  Education,
} from "../../types";
import {
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Link as LinkIcon,
} from "lucide-react";

interface ResumePreviewProps {
  content: ResumeContent;
  forPdf?: boolean;
}

export default function ResumePreview({ content, forPdf = false }: ResumePreviewProps) {
  const formatDescription = (desc: string): React.ReactNode => {
    if (!desc) return null;

    if (desc.includes("<") && desc.includes(">")) {
      return (
        <div
          className="ql-editor"
          style={{ padding: 0 }}
          dangerouslySetInnerHTML={{ __html: desc }}
        />
      );
    }

    const lines = desc.split("\n").filter((line) => line.trim());
    return (
      <ul className="list-disc pl-4 space-y-1 text-xs">
        {lines.map((line, i) => {
          const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
          if (!cleanLine) return null;
          return <li key={i}>{cleanLine}</li>;
        })}
      </ul>
    );
  };

  if (forPdf) {
    // PDF Version - White background, black text only
    return (
      <div className="bg-white rounded-lg p-6 min-h-[800px] text-sm font-sans text-gray-900" id="resume-preview-content">
        {/* Personal Information */}
        <div className="border-b border-gray-300 pb-3 mb-4">
          <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
            {content.personalInfo.fullName || "MOHOSIN HASAN AKASH"}
          </h1>

          {content.personalInfo.jobTitle && (
            <p className="text-sm text-gray-700 font-medium mt-1">
              {content.personalInfo.jobTitle}
            </p>
          )}

          {/* Contact Information */}
          <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
            {content.personalInfo.address?.city && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>
                  {[
                    content.personalInfo.address.city,
                    content.personalInfo.address.division,
                    content.personalInfo.address.zipCode,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </span>
              </div>
            )}

            {content.personalInfo.whatsapp && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{content.personalInfo.whatsapp}</span>
              </div>
            )}

            {content.personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>{content.personalInfo.email}</span>
              </div>
            )}

            {content.personalInfo.linkedIn && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                <span>{content.personalInfo.linkedIn}</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {content.summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
              SUMMARY
            </h2>
            {content.summary.includes("<") && content.summary.includes(">") ? (
              <div
                className="text-gray-700 text-xs ql-editor leading-relaxed"
                style={{ padding: 0 }}
                dangerouslySetInnerHTML={{ __html: content.summary }}
              />
            ) : (
              <p className="text-gray-700 text-xs leading-relaxed">
                {content.summary}
              </p>
            )}
          </div>
        )}

        {/* Experience */}
        {content.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
              EXPERIENCE
            </h2>
            {content.experience.map((exp: Experience, index: number) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-black text-sm">
                    {exp.title}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <p className="text-gray-600 text-xs font-medium mt-0.5">
                  {exp.company}
                </p>
                <div className="text-gray-700 text-xs mt-1">
                  {formatDescription(exp.description)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {content.projects && content.projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
              PROJECTS
            </h2>
            {content.projects.map((proj: Project, index: number) => (
              <div key={index} className="mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-black text-sm">
                    {proj.name}
                  </span>
                </div>

                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {proj.technologies.join(", ")}
                  </p>
                )}

                <div className="text-gray-700 text-xs mt-1">
                  {formatDescription(proj.description)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {content.achievements && content.achievements.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
              ACHIEVEMENTS
            </h2>
            <div className="space-y-1">
              {content.achievements.map((ach: Achievement, index: number) => (
                <div
                  key={index}
                  className="text-gray-700 text-xs"
                >
                  • {ach.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {content.certifications && content.certifications.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
              CERTIFICATIONS
            </h2>
            <div className="space-y-1">
              {content.certifications.map(
                (cert: Certification, index: number) => (
                  <div
                    key={index}
                    className="text-gray-700 text-xs"
                  >
                    {cert.title}
                    {cert.date && (
                      <span className="text-gray-500"> ({cert.date})</span>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {content.education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
              EDUCATION
            </h2>
            {content.education.map((edu: Education, index: number) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-black text-sm">
                    {edu.degree}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">{edu.date}</span>
                </div>
                <p className="text-gray-600 text-xs mt-0.5">
                  {edu.institution}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {content.skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
              SKILLS
            </h2>
            <div className="text-gray-700 text-xs">
              <div>
                <span className="font-semibold">Technical Skills: </span>
                <span>
                  {Array.isArray(content.skills)
                    ? content.skills.join(", ")
                    : content.skills}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Preview Version - Dark mode support
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-h-[800px] text-sm font-sans">
      {/* Personal Information */}
      <div className="border-b border-gray-300 dark:border-gray-600 pb-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
          {content.personalInfo.fullName || "MOHOSIN HASAN AKASH"}
        </h1>

        {content.personalInfo.jobTitle && (
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-1">
            {content.personalInfo.jobTitle}
          </p>
        )}

        {/* Contact Information */}
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
          {content.personalInfo.address?.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>
                {[
                  content.personalInfo.address.city,
                  content.personalInfo.address.division,
                  content.personalInfo.address.zipCode,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </span>
            </div>
          )}

          {content.personalInfo.whatsapp && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{content.personalInfo.whatsapp}</span>
            </div>
          )}

          {content.personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{content.personalInfo.email}</span>
            </div>
          )}

          {content.personalInfo.linkedIn && (
            <div className="flex items-center gap-1">
              <LinkIcon className="w-3 h-3" />
              <span>{content.personalInfo.linkedIn}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {content.summary && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-300 dark:border-gray-600 pb-1 mb-2">
            SUMMARY
          </h2>
          {content.summary.includes("<") && content.summary.includes(">") ? (
            <div
              className="text-gray-700 dark:text-gray-300 text-xs ql-editor leading-relaxed"
              style={{ padding: 0 }}
              dangerouslySetInnerHTML={{ __html: content.summary }}
            />
          ) : (
            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
              {content.summary}
            </p>
          )}
        </div>
      )}

      {/* Experience */}
      {content.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-300 dark:border-gray-600 pb-1 mb-2">
            EXPERIENCE
          </h2>
          {content.experience.map((exp: Experience, index: number) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-sm">
                  {exp.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mt-0.5">
                {exp.company}
              </p>
              <div className="text-gray-700 dark:text-gray-300 text-xs mt-1">
                {formatDescription(exp.description)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {content.projects && content.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-300 dark:border-gray-600 pb-1 mb-2">
            PROJECTS
          </h2>
          {content.projects.map((proj: Project, index: number) => (
            <div key={index} className="mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900 dark:text-white text-sm">
                  {proj.name}
                </span>
                {(proj.links?.live || proj.links?.github) && (
                  <div className="flex gap-3 text-xs text-blue-600 dark:text-blue-400">
                    {proj.links.live && (
                      <a
                        href={proj.links.live.startsWith("http") ? proj.links.live : `https://${proj.links.live}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Preview
                      </a>
                    )}
                    {proj.links.github && (
                      <a
                        href={proj.links.github.startsWith("http") ? proj.links.github : `https://${proj.links.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Repo
                      </a>
                    )}
                  </div>
                )}
              </div>

              {proj.technologies && proj.technologies.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                  {proj.technologies.join(", ")}
                </p>
              )}

              <div className="text-gray-700 dark:text-gray-300 text-xs mt-1">
                {formatDescription(proj.description)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {content.achievements && content.achievements.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-300 dark:border-gray-600 pb-1 mb-2">
            ACHIEVEMENTS
          </h2>
          <div className="space-y-1">
            {content.achievements.map((ach: Achievement, index: number) => (
              <div
                key={index}
                className="text-gray-700 dark:text-gray-300 text-xs"
              >
                • {ach.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {content.certifications && content.certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-300 dark:border-gray-600 pb-1 mb-2">
            CERTIFICATIONS
          </h2>
          <div className="space-y-1">
            {content.certifications.map(
              (cert: Certification, index: number) => (
                <div
                  key={index}
                  className="text-gray-700 dark:text-gray-300 text-xs"
                >
                  {cert.link ? (
                    <a
                      href={
                        cert.link.startsWith("http")
                          ? cert.link
                          : `https://${cert.link}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 inline-flex"
                    >
                      {cert.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span>{cert.title}</span>
                  )}
                  {cert.date && (
                    <span className="text-gray-500 dark:text-gray-400"> ({cert.date})</span>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Education */}
      {content.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-300 dark:border-gray-600 pb-1 mb-2">
            EDUCATION
          </h2>
          {content.education.map((edu: Education, index: number) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-sm">
                  {edu.degree}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{edu.date}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                {edu.institution}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {content.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-300 dark:border-gray-600 pb-1 mb-2">
            SKILLS
          </h2>
          <div className="text-gray-700 dark:text-gray-300 text-xs">
            <div>
              <span className="font-semibold">Technical Skills: </span>
              <span>
                {Array.isArray(content.skills)
                  ? content.skills.join(", ")
                  : content.skills}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
