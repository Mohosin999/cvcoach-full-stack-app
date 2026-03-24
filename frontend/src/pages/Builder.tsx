/* ===================================
Builder Page - Redesigned with Two-Panel Layout
=================================== */
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  FileText,
  Briefcase,
  Code,
  Award,
  GraduationCap,
  Wrench,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppSelector } from "../hooks/redux";
import { useResumeBuilder, useResumeContent } from "../hooks/useResumeBuilder";
import { Resume, ResumeContent } from "../types";
import { exportToPdf } from "../utils/pdfExport";
import { BackButton } from "../components/ui";
import { resumeBuildHistoryApi } from "../api/api";
import {
  PersonalInfoEditor,
  SummaryEditorAI,
  ExperienceEditorAI,
  ProjectsEditorAI,
  AchievementsEditor,
  EducationEditor,
  SkillsEditorAI,
} from "../components/shared";

const STORAGE_KEY = "resume_builder_state";

interface BuilderState {
  content: ResumeContent;
  currentStep: number;
  resumeId: string | null;
}

const defaultContent: ResumeContent = {
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    whatsapp: "",
    address: { city: "", division: "", zipCode: "" },
    linkedIn: "",
    socialLinks: { github: "", portfolio: "", website: "" },
  },
  summary: "",
  experience: [],
  projects: [],
  achievements: [],
  education: [],
  technicalSkills: [],
  softSkills: [],
};

const saveToStorage = (state: BuilderState) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save to sessionStorage:", e);
  }
};

const loadFromStorage = (): BuilderState | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load from sessionStorage:", e);
  }
  return null;
};

const clearStorage = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  completed: boolean;
}

const SECTIONS: Section[] = [
  {
    id: "personal",
    title: "Personal Information",
    icon: User,
    completed: false,
  },
  {
    id: "summary",
    title: "Professional Summary",
    icon: FileText,
    completed: false,
  },
  {
    id: "experience",
    title: "Work Experience",
    icon: Briefcase,
    completed: false,
  },
  { id: "projects", title: "Projects", icon: Code, completed: false },
  { id: "achievements", title: "Achievements", icon: Award, completed: false },
  {
    id: "education",
    title: "Education",
    icon: GraduationCap,
    completed: false,
  },
  { id: "skills", title: "Skills", icon: Wrench, completed: false },
];

export default function Builder() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: resumeId } = useParams<{ id: string }>();

  const builder = useResumeBuilder();
  const contentActions = useResumeContent(builder.content, builder.setContent);
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionStates, setSectionStates] = useState<Section[]>(SECTIONS);
  const [loadingResume, setLoadingResume] = useState(false);

  const loadResumeById = useCallback(async (id: string) => {
    setLoadingResume(true);
    try {
      const response = await resumeBuildHistoryApi.getById(id);
      const resume = response.data.data;
      if (resume) {
        builder.setSelectedResume(resume as Resume);
        builder.setContent(resume.resumeContent);
        saveToStorage({
          content: resume.resumeContent,
          currentStep: 0,
          resumeId: id,
        });
      }
    } catch (error) {
      toast.error("Failed to load resume");
      navigate("/builder");
    } finally {
      setLoadingResume(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (resumeId) {
      loadResumeById(resumeId);
    } else {
      const passedResume = location.state?.resume as Resume | undefined;
      if (passedResume) {
        builder.setSelectedResume(passedResume);
        builder.setContent(passedResume.content);
        window.history.replaceState({}, document.title);
      } else {
        clearStorage();
        builder.setContent(defaultContent);
        builder.setSelectedResume(null as any);
        setCurrentStep(0);
      }
    }
  }, [resumeId, location.state]);

  useEffect(() => {
    if (builder.content || currentStep > 0) {
      saveToStorage({
        content: builder.content,
        currentStep,
        resumeId: builder.selectedResume?._id || null,
      });
    }
  }, [builder.content, currentStep, builder.selectedResume?._id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const checkSectionCompletion = (sectionId: string): boolean => {
    const { content } = builder;
    switch (sectionId) {
      case "personal":
        return (
          !!content.personalInfo?.fullName && !!content.personalInfo?.email
        );
      case "summary":
        return !!content.summary && content.summary.length > 0;
      case "experience":
        return content.experience.length > 0;
      case "projects":
        return !!(content.projects && content.projects.length > 0);
      case "achievements":
        return !!(content.achievements && content.achievements.length > 0);
      case "education":
        return content.education.length > 0;
      case "skills":
        return content.technicalSkills.length > 0 || content.softSkills.length > 0;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    const isCompleted = checkSectionCompletion(sectionStates[currentStep].id);
    if (isCompleted) {
      const updated = [...sectionStates];
      updated[currentStep] = { ...updated[currentStep], completed: true };
      setSectionStates(updated);
    }
    if (currentStep < sectionStates.length - 1) setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleExportPDF = async () => {
    try {
      await exportToPdf("resume-preview-content");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const handleSave = async () => {
    const result = await builder.handleSaveResume();
    if (result?._id) {
      const newId = result._id;
      if (!builder.selectedResume?._id) {
        builder.setSelectedResume({ _id: newId } as Resume);
      }
      saveToStorage({
        content: builder.content,
        currentStep,
        resumeId: newId,
      });
    }
  };

  const renderSectionEditor = (section: Section) => {
    const { content, setContent } = builder;
    switch (section.id) {
      case "personal":
        return (
          <PersonalInfoEditor
            content={content}
            updateField={contentActions.updatePersonalInfo}
          />
        );
      case "summary":
        return (
          <SummaryEditorAI
            value={content.summary || ""}
            onChange={(val) => setContent({ ...content, summary: val })}
            personalInfo={content.personalInfo}
            skills={[...(content.technicalSkills || []), ...(content.softSkills || [])]}
          />
        );
      case "experience":
        return (
          <ExperienceEditorAI
            experience={content.experience}
            onAdd={contentActions.addExperience}
            onUpdate={contentActions.updateExperience}
            onRemove={contentActions.removeExperience}
          />
        );
      case "projects":
        return (
          <ProjectsEditorAI
            projects={content.projects}
            onAdd={contentActions.addProject}
            onUpdate={contentActions.updateProject}
            onRemove={contentActions.removeProject}
          />
        );
      case "achievements":
        return (
          <AchievementsEditor
            achievements={content.achievements}
            onAdd={contentActions.addAchievement}
            onUpdate={contentActions.updateAchievement}
            onRemove={contentActions.removeAchievement}
          />
        );
      case "education":
        return (
          <EducationEditor
            education={content.education}
            onAdd={contentActions.addEducation}
            onUpdate={contentActions.updateEducation}
            onRemove={contentActions.removeEducation}
          />
        );
      case "skills":
        return (
          <SkillsEditorAI
            technicalSkills={content.technicalSkills || []}
            softSkills={content.softSkills || []}
            onAddTechnicalSkill={contentActions.addTechnicalSkill}
            onRemoveTechnicalSkill={contentActions.removeTechnicalSkill}
            onAddSoftSkill={contentActions.addSoftSkill}
            onRemoveSoftSkill={contentActions.removeSoftSkill}
            jobTitle={content.personalInfo.jobTitle}
          />
        );
      default:
        return null;
    }
  };

  if (builder.loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );

  const currentSection = sectionStates[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === sectionStates.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 pt-20 pb-12 relative">
      {/* Ambient emerald glow effect */}
      <div className="fixed top-20 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mt-6 mb-4">
          <BackButton />
        </div>

        {/* Two-Panel Layout */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Panel - Form Wizard (48% width) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:w-[48%] flex-shrink-0"
          >
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-emerald-500/10 border border-emerald-500/20 overflow-hidden">
              {/* Progress Stepper - Green Gradient */}
              <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMODAgME0wIDBMODAgNDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 lg:mb-3">
                    <p className="text-emerald-100 text-xs">
                      Step {currentStep + 1}/{sectionStates.length}
                    </p>
                    <p className="hidden lg:block text-emerald-100 text-xs font-medium">
                      {currentSection.title}
                    </p>
                  </div>
                  <div className="hidden lg:flex items-center justify-between gap-1">
                    {sectionStates.map((section, index) => {
                      const Icon = section.icon;
                      const isActive = index === currentStep;
                      const isCompleted =
                        section.completed || index < currentStep;
                      const displayTitle =
                        section.id === "summary"
                          ? "Summary"
                          : section.title.split(" ")[0];

                      return (
                        <button
                          key={section.id}
                          onClick={() => setCurrentStep(index)}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 ${
                              isActive
                                ? "bg-white text-emerald-700 shadow-xl ring-2 ring-white/50"
                                : isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : "bg-white/20 text-white/60"
                            }`}
                          >
                            {isCompleted ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <span
                            className={`text-[9px] whitespace-nowrap ${
                              isActive
                                ? "text-white font-semibold"
                                : "text-emerald-100/70"
                            }`}
                          >
                            {displayTitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="lg:hidden flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 pt-2">
                    {sectionStates.map((section, index) => {
                      const Icon = section.icon;
                      const isActive = index === currentStep;
                      const isCompleted =
                        section.completed || index < currentStep;
                      const displayTitle =
                        section.id === "summary"
                          ? "Summary"
                          : section.title.split(" ")[0];

                      return (
                        <button
                          key={section.id}
                          onClick={() => setCurrentStep(index)}
                          className="flex flex-col items-center gap-1 flex-shrink-0"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                              isActive
                                ? "bg-white text-emerald-700 shadow-xl ring-2 ring-white/50 -mt-2"
                                : isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : "bg-white/20 text-white/60"
                            }`}
                          >
                            {isCompleted ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] whitespace-nowrap ${
                              isActive
                                ? "text-white font-semibold"
                                : "text-emerald-100/70"
                            }`}
                          >
                            {displayTitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Header - Green Theme */}
              <div className="bg-gradient-to-r from-emerald-800/20 via-emerald-700/10 to-emerald-600/20 p-4 border-b border-emerald-700/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <currentSection.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {currentSection.title}
                    </h2>
                    <p className="text-emerald-100 text-xs">
                      Fill in your details below
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <motion.div
                  key={currentSection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderSectionEditor(currentSection)}
                </motion.div>
              </div>

              {/* Form Footer - Navigation Buttons */}
              <div className="p-4 border-t border-emerald-700/20 bg-gray-900/50">
                <div className="flex items-center justify-between gap-3">
                  <motion.button
                    whileHover={{ scale: isFirstStep ? 1 : 1.02 }}
                    whileTap={{ scale: isFirstStep ? 1 : 0.98 }}
                    onClick={goToPreviousStep}
                    disabled={isFirstStep}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
                      isFirstStep
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                        : "bg-gray-800 text-white hover:bg-gray-700 border border-emerald-700/30"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </motion.button>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={builder.saving}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-700/30 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" /> Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={isLastStep ? handleExportPDF : goToNextStep}
                      disabled={builder.saving}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-700/30 transition-all font-medium text-sm"
                    >
                      {isLastStep ? (
                        <>
                          <ChevronRight className="w-4 h-4" /> Download PDF
                        </>
                      ) : (
                        <>
                          Next <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Live Resume Preview (52% width) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:w-[52%] flex-shrink-0"
          >
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-emerald-500/10 border border-emerald-500/20 overflow-hidden sticky top-24">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMODAgME0wIDBMODAgNDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Live Resume Preview
                      </h2>
                      <p className="text-emerald-100 text-xs">
                        Updates as you type
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 hover:shadow-lg hover:shadow-emerald-700/30 rounded-lg text-white transition-all text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export PDF
                  </motion.button>
                </div>
              </div>

              {/* Preview Content - No scrollbar, full width */}
              <div className="bg-gray-800/50">
                <div className="bg-white min-h-[800px]" id="resume-preview-content">
                  {/* Resume Personal Info */}
                  <ResumePreview content={builder.content} forPdf={true} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ===================================
Resume Preview Component (Inline for Preview Panel)
=================================== */

interface ResumePreviewProps {
  content: ResumeContent;
  forPdf?: boolean;
}

function ResumePreview({ content, forPdf = false }: ResumePreviewProps) {
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
      <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
        {lines.map((line, i) => {
          const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
          if (!cleanLine) return null;
          return <li key={i}>{cleanLine}</li>;
        })}
      </ul>
    );
  };

  const hasAnyContent =
    content.personalInfo?.fullName ||
    content.personalInfo?.jobTitle ||
    content.personalInfo?.email ||
    content.summary ||
    content.experience?.length > 0 ||
    (content.projects && content.projects.length > 0) ||
    (content.achievements && content.achievements.length > 0) ||
    content.education?.length > 0 ||
    (content.technicalSkills?.length > 0 || content.softSkills?.length > 0);

  return (
    <div className="text-gray-900 font-sans w-full">
      {/* Personal Info */}
      <PersonalInfoPreview content={content} forPdf={forPdf} />

      {/* Summary */}
      {content.summary && <SummaryPreview content={content} forPdf={forPdf} />}

      {/* Experience */}
      {content.experience.length > 0 && (
        <ExperiencePreview
          experience={content.experience}
          forPdf={forPdf}
          formatDescription={formatDescription}
        />
      )}

      {/* Projects */}
      {content.projects && content.projects.length > 0 && (
        <ProjectsPreview
          projects={content.projects}
          forPdf={forPdf}
          formatDescription={formatDescription}
        />
      )}

      {/* Achievements */}
      {content.achievements && content.achievements.length > 0 && (
        <AchievementsPreview
          achievements={content.achievements}
          forPdf={forPdf}
        />
      )}

      {/* Education */}
      {content.education.length > 0 && (
        <EducationPreview education={content.education} forPdf={forPdf} />
      )}

      {/* Skills */}
      {(content.technicalSkills?.length > 0 || content.softSkills?.length > 0) && (
        <SkillsPreview content={content} forPdf={forPdf} />
      )}

      {/* Empty State */}
      {!hasAnyContent && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-sm">
            Start filling out the form to see your resume preview
          </p>
        </div>
      )}
    </div>
  );
}

function PersonalInfoPreview({
  content,
  forPdf,
}: {
  content: ResumeContent;
  forPdf: boolean;
}) {
  // Format phone number with (+880) prefix
  const formatPhoneNumber = (phone: string) => {
    const cleanNumber = phone.replace(/^(\+880|880)/, "");
    return `(+880) ${cleanNumber}`;
  };

  // Format LinkedIn URL - just show the path
  const formatLinkedIn = (linkedIn: string) => {
    const clean = linkedIn.replace(/^https?:\/\//, "").replace(/^www\./, "");
    return clean.startsWith("linkedin.com/in/")
      ? clean
      : `linkedin.com/in/${linkedIn}`;
  };

  // Build location string (comma after city, then spaces)
  const locationParts = [
    content.personalInfo.address?.city,
    content.personalInfo.address?.division,
    content.personalInfo.address?.zipCode,
  ].filter(Boolean);
  const locationString =
    locationParts.length > 0
      ? locationParts[0] +
        (locationParts.length > 1 ? ", " : "") +
        locationParts.slice(1).join(" ")
      : "";

  return (
    <div className="px-6 pt-6 pb-6">
      <div className="flex justify-between items-start">
        {/* Left Side - Name and Title */}
        <div className="min-w-[220px]">
          <h1 className="text-base font-bold text-[#222222] uppercase tracking-wide leading-tight">
            {content.personalInfo.fullName || "Your Name"}
          </h1>
          {content.personalInfo.jobTitle && (
            <p className="text-xs font-medium text-[#222222] mt-1 leading-tight">
              {content.personalInfo.jobTitle}
            </p>
          )}
        </div>

        {/* Right Side - Contact Info */}
        <div className="mt-auto items-end text-right min-w-[200px]">
          {/* First Line: Location • Phone */}
          <div className="text-[10px] text-[#222222] leading-snug">
            <span>
              {[
                locationString || "",
                content.personalInfo.whatsapp
                  ? formatPhoneNumber(content.personalInfo.whatsapp)
                  : "",
              ]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </div>
          {/* Second Line: Email • LinkedIn */}
          <div className="text-[10px] text-[#222222] leading-snug mt-0.5">
            <span>
              {[
                content.personalInfo.email || "",
                content.personalInfo.linkedIn
                  ? formatLinkedIn(content.personalInfo.linkedIn)
                  : "",
              ]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryPreview({
  content,
  forPdf,
}: {
  content: ResumeContent;
  forPdf: boolean;
}) {
  const titleColor = "text-gray-900";

  if (!content.summary) return null;

  return (
    <div className="mb-3 px-6">
      <h2
        className={`text-[10px] font-bold ${titleColor} uppercase tracking-wide border-b ${forPdf ? "border-gray-300" : "border-gray-300"} pb-0.5 mb-1.5`}
      >
        SUMMARY
      </h2>
      {content.summary.includes("<") && content.summary.includes(">") ? (
        <div
          className={`text-gray-700 text-[10px] leading-relaxed ql-editor`}
          style={{ padding: 0 }}
          dangerouslySetInnerHTML={{ __html: content.summary }}
        />
      ) : (
        <p className={`text-gray-700 text-[10px] leading-relaxed`}>
          {content.summary}
        </p>
      )}
    </div>
  );
}

function ExperiencePreview({
  experience,
  forPdf,
  formatDescription,
}: {
  experience: ResumeContent["experience"];
  forPdf: boolean;
  formatDescription: (desc: string) => React.ReactNode;
}) {
  return (
    <div className="mb-3 px-6">
      <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-0.5 mb-1.5">
        EXPERIENCE
      </h2>
      {experience.map((exp, index) => (
        <div key={index} className="mb-2.5 last:mb-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[10px] font-bold text-gray-900">
                {exp.company}
              </h3>
              <p className="text-[9px] text-gray-700 font-medium">
                {exp.title}
                {exp.topSkills && exp.topSkills.length > 0 && (
                  <span className="font-normal text-gray-600">
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
              <p className="text-[9px] text-gray-600">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate || ""}
              </p>
              {exp.location && (
                <p className="text-[9px] text-gray-600">{exp.location}</p>
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

function ProjectsPreview({
  projects,
  forPdf,
  formatDescription,
}: {
  projects: ResumeContent["projects"];
  forPdf: boolean;
  formatDescription: (desc: string) => React.ReactNode;
}) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="mb-3 px-6">
      <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-0.5 mb-1.5">
        PROJECTS
      </h2>
      {projects.map((project, index) => (
        <div key={index} className="mb-2 last:mb-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-[10px] font-bold text-gray-900">
              {project.name || "Untitled Project"}
            </h3>
            <div className="flex items-center gap-2">
              {project.links?.live && (
                <span
                  onClick={() => window.open(project.links!.live, "_blank")}
                  className="text-[9px] text-emerald-600 hover:text-emerald-500 cursor-pointer"
                >
                  Live
                </span>
              )}
              {project.links?.github && (
                <span
                  onClick={() => window.open(project.links!.github, "_blank")}
                  className="text-[9px] text-gray-500 hover:text-gray-400 cursor-pointer"
                >
                  GitHub
                </span>
              )}
            </div>
          </div>
          {project.description && (
            <div className="mt-1">{formatDescription(project.description)}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function AchievementsPreview({
  achievements,
  forPdf,
}: {
  achievements: ResumeContent["achievements"];
  forPdf: boolean;
}) {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="mb-3 px-6">
      <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-0.5 mb-1.5">
        ACHIEVEMENTS
      </h2>
      {achievements.map((achievement, index) => (
        <div key={index} className="mb-1.5 last:mb-0">
          <div className="flex justify-between items-start">
            <h3 className="text-[10px] font-bold text-gray-900">
              {achievement.title}
            </h3>
            {achievement.date && (
              <p className="text-[9px] text-gray-600">{achievement.date}</p>
            )}
          </div>
          {achievement.description && (
            <p className="text-[10px] text-gray-700 mt-0.5">
              {achievement.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function EducationPreview({
  education,
  forPdf,
}: {
  education: ResumeContent["education"];
  forPdf: boolean;
}) {
  return (
    <div className="mb-3 px-6">
      <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-0.5 mb-1.5">
        EDUCATION
      </h2>
      {education.map((edu, index) => (
        <div key={index} className="flex items-start mb-1.5 last:mb-0">
          <div>
            <h3 className="text-[10px] font-bold text-gray-900">
              {edu.institution}
            </h3>
            <p className="text-[9px] text-gray-700">{edu.degree}</p>
          </div>
          <div className="ml-auto">
            {edu.date && <p className="text-[9px] text-gray-600">{edu.date}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsPreview({
  content,
  forPdf,
}: {
  content: ResumeContent;
  forPdf: boolean;
}) {
  const technicalSkills = content.technicalSkills || [];
  const softSkills = content.softSkills || [];

  return (
    <div className="mb-3 px-6 pb-6">
      <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-0.5 mb-1.5">
        SKILLS
      </h2>
      <div className="space-y-1.5">
        {technicalSkills.length > 0 && (
          <p className="text-[10px] text-gray-700">
            <span className="font-bold">• Technical Skills:</span>{" "}
            {technicalSkills.join(", ")}
          </p>
        )}
        {softSkills.length > 0 && (
          <p className="text-[10px] text-gray-700">
            <span className="font-bold">• Soft Skills:</span>{" "}
            {softSkills.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
