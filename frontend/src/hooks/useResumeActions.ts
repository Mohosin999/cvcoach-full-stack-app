/* ===================================
Custom Hook: useResumeActions
=================================== */
import { useState } from "react";
import { Resume, ResumeContent } from "../types";
import { resumeBuildHistoryApi } from "../api/api";
import { useAppDispatch } from "./redux";
import { setUserCredits } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
  skills: [],
};

export function useResumeActions() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent>(defaultContent);
  const [saving, setSaving] = useState(false);

  const handleSelectResume = (resume: Resume) => {
    setSelectedResume(resume);
    setContent(resume.content);
  };

  const handleSaveResume = async () => {
    setSaving(true);
    try {
      const response = await resumeBuildHistoryApi.save({
        resumeContent: content,
        resumeName: content.personalInfo?.fullName || 'Untitled Resume',
      });
      toast.success("Resume saved to history successfully!");
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to save resume";
      toast.error(errorMessage);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleNewResume = () => {
    setSelectedResume(null);
    setContent(defaultContent);
  };

  return {
    selectedResume,
    content,
    setContent,
    saving,
    setSelectedResume,
    handleSelectResume,
    handleSaveResume,
    handleNewResume,
  };
}
