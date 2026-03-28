import { ResumeContent } from "../../types";
import {
  ResumePersonalInfo,
  ResumeSummary,
  ResumeExperience,
  ResumeProjects,
  ResumeAchievements,
  ResumeEducation,
  ResumeSkills,
} from "../../components/shared";

interface ResumePreviewProps {
  content: ResumeContent;
  forPdf?: boolean;
}

const formatDescription = (desc: string, forPdf?: boolean): React.ReactNode => {
  if (!desc) return null;
  if (desc.includes("<") && desc.includes(">")) {
    return (
      <div
        className="ql-editor"
        style={{ padding: 0, color: forPdf ? '#374151' : undefined }}
        dangerouslySetInnerHTML={{ __html: desc }}
      />
    );
  }
  const lines = desc.split("\n").filter((line) => line.trim());
  return (
    <ul className={`list-outside list-disc pl-4 space-y-0.5 text-sm ${forPdf ? 'text-gray-900' : 'text-gray-900 dark:text-gray-100'}`}>
      {lines.map((line, i) => {
        const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
        if (!cleanLine) return null;
        return <li key={i}>{cleanLine}</li>;
      })}
    </ul>
  );
};

export default function ResumePreview({
  content,
  forPdf = false,
}: ResumePreviewProps) {
  const bgColor = forPdf ? "bg-white" : "bg-white dark:bg-gray-800";
  const textColor = forPdf ? "text-gray-900" : "text-gray-900 dark:text-gray-100 text-sm font-sans";

  return (
    <div
      className={`${bgColor} rounded-lg shadow-lg p-6 min-h-[800px] ${textColor}`}
    >
      <ResumePersonalInfo content={content} forPdf={forPdf} />
      <ResumeSummary content={content} forPdf={forPdf} />
      {content.experience.length > 0 && (
        <ResumeExperience
          experience={content.experience}
          forPdf={forPdf}
          formatDescription={(desc) => formatDescription(desc, forPdf)}
        />
      )}
      {content.projects && content.projects.length > 0 && (
        <ResumeProjects
          projects={content.projects}
          forPdf={forPdf}
          formatDescription={(desc) => formatDescription(desc, forPdf)}
        />
      )}
      {content.achievements && content.achievements.length > 0 && (
        <ResumeAchievements
          achievements={content.achievements}
          forPdf={forPdf}
        />
      )}
      {content.education.length > 0 && (
        <ResumeEducation education={content.education} forPdf={forPdf} />
      )}
      {(content.technicalSkills?.length > 0 ||
        content.softSkills?.length > 0) && (
        <ResumeSkills content={content} forPdf={forPdf} />
      )}
    </div>
  );
}
