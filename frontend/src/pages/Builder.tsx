import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Save,
  User,
  Briefcase,
  Code,
  Award,
  GraduationCap,
  Wrench,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { setUserCredits } from "../store/slices/authSlice";
import { resumeApi } from "../services/api";
import { Resume, ResumeContent } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  PersonalInfoEditor,
  SummaryEditor,
  ExperienceEditor,
  ProjectsEditor,
  AchievementsEditor,
  CertificationsEditor,
  EducationEditor,
  SkillsEditor,
  ResumePreview,
  SectionCard,
} from "../components/builder";
import { ReactNode } from "react";
import BackButton from "@/components/BackButton";

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  completed: boolean;
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
  certifications: [],
  education: [],
  skills: [],
};

export default function Builder() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [sections, setSections] = useState<Section[]>([
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
    {
      id: "achievements",
      title: "Achievements",
      icon: Award,
      completed: false,
    },
    {
      id: "certifications",
      title: "Certifications",
      icon: Award,
      completed: false,
    },
    {
      id: "education",
      title: "Education",
      icon: GraduationCap,
      completed: false,
    },
    { id: "skills", title: "Skills", icon: Wrench, completed: false },
  ]);

  useEffect(() => {
    const passedResume = location.state?.resume as Resume | undefined;
    if (passedResume) {
      setSelectedResume(passedResume);
      setContent(passedResume.content);
      window.history.replaceState({}, document.title);
    }
    fetchResumes();
  }, [location.state]);

  const fetchResumes = async () => {
    try {
      const response = await resumeApi.getAll(1, 50);
      setSavedResumes(response.data.data || []);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (resume: Resume) => {
    setSelectedResume(resume);
    setContent(resume.content);
    setCurrentStep(0);
  };

  const handleSaveResume = async () => {
    setSaving(true);
    try {
      if (selectedResume) {
        // Updating existing resume - no credit deduction
        await resumeApi.update(selectedResume._id, { content });
        toast.success("Resume updated successfully");
      } else {
        // Creating new resume - will deduct 1 credit automatically on backend
        const response = await resumeApi.createFromContent(content);
        setSelectedResume(response.data.data);
        
        // Update user credits in Redux store
        const remainingCredits = response.data.remainingCredits;
        if (remainingCredits !== undefined) {
          dispatch(setUserCredits(remainingCredits));
        }
        
        toast.success("Resume saved successfully! 1 credit used.");
      }
      // Mark current section as complete when saving
      markCurrentSectionComplete();
      await fetchResumes();
    } catch (error: any) {
      console.error("Save error:", error);
      const errorMessage = error.response?.data?.message || "Failed to save resume";
      
      // Check if it's an insufficient credits error
      if (errorMessage.includes("Insufficient credits")) {
        toast.error("Insufficient credits! Please upgrade your plan or add more credits.");
        navigate("/plans");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNewResume = () => {
    setSelectedResume(null);
    setContent(defaultContent);
    setCurrentStep(0);
    setSections(sections.map((s) => ({ ...s, completed: false })));
  };

  const updatePersonalInfo = (field: string, value: any) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setContent({
        ...content,
        personalInfo: {
          ...content.personalInfo,
          address: { ...content.personalInfo.address, [addressField]: value },
        },
      });
    } else if (field.startsWith("socialLinks.")) {
      const socialField = field.split(".")[1];
      setContent({
        ...content,
        personalInfo: {
          ...content.personalInfo,
          socialLinks: {
            ...content.personalInfo.socialLinks,
            [socialField]: value,
          },
        },
      });
    } else {
      setContent({
        ...content,
        personalInfo: { ...content.personalInfo, [field]: value },
      });
    }
  };

  const addExperience = () => {
    setContent({
      ...content,
      experience: [
        ...content.experience,
        {
          company: "",
          title: "",
          startDate: "",
          endDate: "",
          description: "",
          current: false,
        },
      ],
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...content.experience];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, experience: updated });
  };

  const removeExperience = (index: number) => {
    setContent({
      ...content,
      experience: content.experience.filter((_, i) => i !== index),
    });
  };

  const addProject = () => {
    setContent({
      ...content,
      projects: [
        ...(content.projects || []),
        { name: "", description: "", technologies: [], links: {} },
      ],
    });
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...(content.projects || [])];
    if (field.startsWith("links.")) {
      const linkField = field.split(".")[1];
      updated[index] = {
        ...updated[index],
        links: { ...updated[index].links, [linkField]: value },
      };
    } else if (field === "technologies") {
      updated[index] = { ...updated[index], technologies: value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setContent({ ...content, projects: updated });
  };

  const removeProject = (index: number) => {
    setContent({
      ...content,
      projects: content.projects?.filter((_, i) => i !== index) || [],
    });
  };

  const addAchievement = () => {
    setContent({
      ...content,
      achievements: [
        ...(content.achievements || []),
        { title: "", description: "", date: "" },
      ],
    });
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    const updated = [...(content.achievements || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, achievements: updated });
  };

  const removeAchievement = (index: number) => {
    setContent({
      ...content,
      achievements: content.achievements?.filter((_, i) => i !== index) || [],
    });
  };

  const addCertification = () => {
    setContent({
      ...content,
      certifications: [
        ...(content.certifications || []),
        { title: "", link: "", date: "" },
      ],
    });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...(content.certifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, certifications: updated });
  };

  const removeCertification = (index: number) => {
    setContent({
      ...content,
      certifications:
        content.certifications?.filter((_, i) => i !== index) || [],
    });
  };

  const addEducation = () => {
    setContent({
      ...content,
      education: [
        ...content.education,
        { institution: "", degree: "", date: "" },
      ],
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...content.education];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, education: updated });
  };

  const removeEducation = (index: number) => {
    setContent({
      ...content,
      education: content.education.filter((_, i) => i !== index),
    });
  };

  const addSkill = (skill: string) => {
    if (skill && !content.skills.includes(skill)) {
      setContent({ ...content, skills: [...content.skills, skill] });
    }
  };

  const removeSkill = (skill: string) => {
    setContent({
      ...content,
      skills: content.skills.filter((s) => s !== skill),
    });
  };

  const goToNextStep = () => {
    // Mark current section as completed if it has data
    const currentSection = sections[currentStep];
    const isCompleted = checkSectionCompletion(currentSection.id);

    if (isCompleted) {
      const updated = [...sections];
      updated[currentStep] = { ...updated[currentStep], completed: true };
      setSections(updated);
    }

    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const markCurrentSectionComplete = () => {
    const currentSection = sections[currentStep];
    const isCompleted = checkSectionCompletion(currentSection.id);

    if (isCompleted) {
      const updated = [...sections];
      updated[currentStep] = { ...updated[currentStep], completed: true };
      setSections(updated);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const checkSectionCompletion = (sectionId: string): boolean => {
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
      case "certifications":
        return !!(content.certifications && content.certifications.length > 0);
      case "education":
        return content.education.length > 0;
      case "skills":
        return content.skills.length > 0;
      default:
        return false;
    }
  };

  const handleExportPDF = async () => {
    try {
      // Create PDF version component data
      const pdfContent: ResumeContent = content;

      // Create a temporary container with the PDF version
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "-9999px";
      container.style.zIndex = "-9999";
      container.style.width = "794px";
      container.style.backgroundColor = "#ffffff";
      document.body.appendChild(container);

      // Helper function to format bullet points - matches preview style
      const formatBullets = (text: string): string => {
        if (!text) return "";
        const cleanText = text
          .replace(/<[^>]+>/g, "")
          .replace(/<br\s*\/?>/gi, "\n");
        const lines = cleanText.split("\n").filter((line) => line.trim());
        if (lines.length === 0) return "";

        return lines
          .map((line) => {
            const cleanLine = line.replace(/^[•\-\*\+]\s*/, "").trim();
            if (!cleanLine) return "";
            return `<li style="margin-bottom: 4px; padding-left: 16px; list-style-position: outside; font-size: 14px; color: #374151; line-height: 1.5;">${cleanLine}</li>`;
          })
          .join("");
      };

      // Build the PDF content HTML manually for better control
      const htmlContent = `
        <div style="
          background: #ffffff;
          color: #000000;
          padding: 20px 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          width: 794px;
        ">
          <!-- Personal Info -->
          <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">
            <h1 style="font-size: 28px; font-weight: 700; color: #000000; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
              ${pdfContent.personalInfo.fullName || "RESUME"}
            </h1>
            ${pdfContent.personalInfo.jobTitle ? `<p style="font-size: 15px; font-weight: 500; color: #2563eb; margin: 6px 0 0 0;">${pdfContent.personalInfo.jobTitle}</p>` : ""}
            <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 10px; font-size: 12px; color: #6b7280;">
              ${pdfContent.personalInfo.address?.city ? `<span style="display: flex; align-items: center; gap: 4px;">📍 ${[pdfContent.personalInfo.address.city, pdfContent.personalInfo.address.division, pdfContent.personalInfo.address.zipCode].filter(Boolean).join(" ")}</span>` : ""}
              ${pdfContent.personalInfo.whatsapp ? `<span style="display: flex; align-items: center; gap: 4px;">📞 ${pdfContent.personalInfo.whatsapp}</span>` : ""}
              ${pdfContent.personalInfo.email ? `<span style="display: flex; align-items: center; gap: 4px;">✉️ ${pdfContent.personalInfo.email}</span>` : ""}
              ${pdfContent.personalInfo.linkedIn ? `<span style="display: flex; align-items: center; gap: 4px;">🔗 ${pdfContent.personalInfo.linkedIn}</span>` : ""}
            </div>
          </div>

          <!-- Summary -->
          ${
            pdfContent.summary
              ? `
            <div style="margin-bottom: 18px;">
              <h2 style="font-size: 15px; font-weight: 700; color: #000000; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">SUMMARY</h2>
              <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.6;">${pdfContent.summary.replace(/<[^>]+>/g, "")}</p>
            </div>
          `
              : ""
          }

          <!-- Experience -->
          ${
            pdfContent.experience.length > 0
              ? `
            <div style="margin-bottom: 18px;">
              <h2 style="font-size: 15px; font-weight: 700; color: #000000; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">EXPERIENCE</h2>
              ${pdfContent.experience
                .map(
                  (exp) => `
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 4px;">
                    <span style="font-size: 15px; font-weight: 700; color: #000000;">${exp.title}</span>
                    <span style="font-size: 12px; color: #6b7280; white-space: nowrap; font-weight: 500;">${exp.startDate} — ${exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <p style="font-size: 14px; color: #2563eb; margin: 0 0 6px 0; font-weight: 500;">${exp.company}</p>
                  ${exp.description ? `<ul style="margin: 4px 0 0 0; padding-left: 16px; list-style-type: disc;">${formatBullets(exp.description)}</ul>` : ""}
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }

          <!-- Projects -->
          ${
            pdfContent.projects && pdfContent.projects.length > 0
              ? `
            <div style="margin-bottom: 18px;">
              <h2 style="font-size: 15px; font-weight: 700; color: #000000; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">PROJECTS</h2>
              ${pdfContent.projects
                .map(
                  (proj) => `
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 4px;">
                    <span style="font-size: 15px; font-weight: 700; color: #000000;">${proj.name}</span>
                  </div>
                  ${proj.technologies && proj.technologies.length > 0 ? `<p style="font-size: 12px; color: #6b7280; margin: 0 0 6px 0; font-style: italic;">${proj.technologies.join(", ")}</p>` : ""}
                  ${proj.description ? `<ul style="margin: 4px 0 0 0; padding-left: 16px; list-style-type: disc;">${formatBullets(proj.description)}</ul>` : ""}
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }

          <!-- Achievements -->
          ${
            pdfContent.achievements && pdfContent.achievements.length > 0
              ? `
            <div style="margin-bottom: 18px;">
              <h2 style="font-size: 15px; font-weight: 700; color: #000000; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">ACHIEVEMENTS</h2>
              <ul style="margin: 4px 0 0 0; padding-left: 16px; list-style-type: disc;">
                ${pdfContent.achievements.map((ach) => `<li style="margin-bottom: 4px; padding-left: 16px; list-style-position: outside; font-size: 14px; color: #374151; line-height: 1.5;">${ach.title}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }

          <!-- Certifications -->
          ${
            pdfContent.certifications && pdfContent.certifications.length > 0
              ? `
            <div style="margin-bottom: 18px;">
              <h2 style="font-size: 15px; font-weight: 700; color: #000000; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">CERTIFICATIONS</h2>
              <ul style="margin: 4px 0 0 0; padding-left: 16px; list-style-type: disc;">
                ${pdfContent.certifications.map((cert) => `<li style="margin-bottom: 4px; padding-left: 16px; list-style-position: outside; font-size: 14px; color: #374151; line-height: 1.5;">${cert.title}${cert.date ? ` <span style="color: #9ca3af;">(${cert.date})</span>` : ""}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }

          <!-- Education -->
          ${
            pdfContent.education.length > 0
              ? `
            <div style="margin-bottom: 18px;">
              <h2 style="font-size: 15px; font-weight: 700; color: #000000; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">EDUCATION</h2>
              ${pdfContent.education
                .map(
                  (edu) => `
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 2px;">
                    <span style="font-size: 15px; font-weight: 700; color: #000000;">${edu.degree}</span>
                    <span style="font-size: 12px; color: #6b7280; white-space: nowrap; font-weight: 500;">${edu.date}</span>
                  </div>
                  <p style="font-size: 14px; color: #6b7280; margin: 0;">${edu.institution}</p>
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }

          <!-- Skills -->
          ${
            pdfContent.skills.length > 0
              ? `
            <div style="margin-bottom: 18px;">
              <h2 style="font-size: 15px; font-weight: 700; color: #000000; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">SKILLS</h2>
              <div style="font-size: 14px; color: #374151; margin: 0; line-height: 1.8;">
                <span style="font-weight: 600; color: #000000;">Technical Skills:</span> ${pdfContent.skills.join("  |  ")}
              </div>
            </div>
          `
              : ""
          }
        </div>
      `;

      container.innerHTML = htmlContent;

      // Wait for content to render
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: container.scrollHeight,
      });

      // Clean up
      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = (pdfWidth - 16) / imgWidth;
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const imgX = (pdfWidth - finalWidth) / 2;
      const imgY = 10;

      pdf.addImage(imgData, "PNG", imgX, imgY, finalWidth, finalHeight);
      pdf.save(`${pdfContent.personalInfo.fullName || "resume"}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const renderSectionEditor = (section: Section): ReactNode => {
    switch (section.id) {
      case "personal":
        return (
          <PersonalInfoEditor
            content={content}
            updateField={updatePersonalInfo}
          />
        );
      case "summary":
        return (
          <SummaryEditor
            value={content.summary || ""}
            onChange={(val: string) => setContent({ ...content, summary: val })}
          />
        );
      case "experience":
        return (
          <ExperienceEditor
            experience={content.experience}
            onAdd={addExperience}
            onUpdate={updateExperience}
            onRemove={removeExperience}
          />
        );
      case "projects":
        return (
          <ProjectsEditor
            projects={content.projects}
            onAdd={addProject}
            onUpdate={updateProject}
            onRemove={removeProject}
          />
        );
      case "achievements":
        return (
          <AchievementsEditor
            achievements={content.achievements}
            onAdd={addAchievement}
            onUpdate={updateAchievement}
            onRemove={removeAchievement}
          />
        );
      case "certifications":
        return (
          <CertificationsEditor
            certifications={content.certifications}
            onAdd={addCertification}
            onUpdate={updateCertification}
            onRemove={removeCertification}
          />
        );
      case "education":
        return (
          <EducationEditor
            education={content.education}
            onAdd={addEducation}
            onUpdate={updateEducation}
            onRemove={removeEducation}
          />
        );
      case "skills":
        return (
          <SkillsEditor
            skills={content.skills}
            onAdd={addSkill}
            onRemove={removeSkill}
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const currentSection = sections[currentStep];
  const isLastStep = currentStep === sections.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mt-6 mb-1">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Resume Builder
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Create your professional resume step by step
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedResumes.length > 0 && (
                <select
                  value={selectedResume?._id || ""}
                  onChange={(e) => {
                    const resume = savedResumes.find(
                      (r) => r._id === e.target.value,
                    );
                    if (resume) handleSelectResume(resume);
                  }}
                  className="input w-full sm:w-40 text-sm"
                >
                  <option value="">Load saved...</option>
                  {savedResumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.content.personalInfo.jobTitle || "No Job Title"}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={handleNewResume}
                className="btn-outline text-sm px-3 sm:px-4"
              >
                New
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreviewModal(true)}
                className="btn-primary flex items-center gap-2 text-sm px-3 sm:px-4"
              >
                <Eye className="w-4 h-4" /> <span>Preview</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps - Scrollable on mobile */}
        <div className="mb-6 sm:mb-8">
          <div className="flex overflow-x-auto pb-4 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 sm:overflow-visible">
            <div className="flex items-center justify-between min-w-max sm:min-w-0 sm:flex-wrap">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = index === currentStep;
                const isCompleted = section.completed;
                const isPast = index < currentStep;

                return (
                  <div key={section.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center w-full">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/50"
                            : isCompleted || isPast
                              ? "bg-green-600 text-white"
                              : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {isCompleted || isPast ? (
                          <svg
                            className="w-5 h-5"
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
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 text-center truncate w-full ${
                          isActive ? "text-white font-medium" : "text-gray-400"
                        }`}
                      >
                        {section.title.split(" ")[0]}
                      </span>
                    </div>
                    {index < sections.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          isPast ? "bg-green-600" : "bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden"
          >
            {/* Section Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <currentSection.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-white">
                    {currentSection.title}
                  </h2>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    Step {currentStep + 1} of {sections.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Content */}
            <div className="p-3 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderSectionEditor(currentSection)}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="p-3 sm:p-6 border-t border-gray-700 bg-gray-800/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
                <motion.button
                  whileHover={{ scale: isFirstStep ? 1 : 1.02 }}
                  whileTap={{ scale: isFirstStep ? 1 : 0.98 }}
                  onClick={goToPreviousStep}
                  disabled={isFirstStep}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    isFirstStep
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={isLastStep ? handleExportPDF : goToNextStep}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/30 text-sm sm:text-base"
                >
                  {isLastStep ? (
                    <>
                      <Download className="w-4 h-4" />{" "}
                      <span className="hidden sm:inline">Download PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </>
                  ) : (
                    <>
                      Next <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveResume}
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all border border-gray-700 text-sm sm:text-base"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all border border-gray-700 text-sm sm:text-base"
            >
              <Download className="w-4 h-4" /> Export PDF
            </motion.button>
          </div>
        </div>
      </div>

      {/* Preview Modal - Full screen on mobile */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gray-900 w-full sm:rounded-2xl sm:shadow-2xl sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden border-0 sm:border border-gray-700 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  <h2 className="text-base sm:text-xl font-bold text-white">
                    Resume Preview
                  </h2>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleExportPDF}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all text-xs sm:text-sm whitespace-nowrap"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
                    <span className="hidden xs:inline">Download PDF</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPreviewModal(false)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Content - Preview (Dark Mode) */}
              <div className="flex-1 overflow-y-auto bg-gray-800 dark p-3 sm:p-6">
                <div className="transform scale-90 sm:scale-100 origin-top">
                  <ResumePreview content={content} forPdf={false} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
