/* ===================================
Custom Hook: useSavedResumes
=================================== */
import { useState, useEffect } from "react";
import { Resume } from "../types";
import { resumeApi } from "../api/api";

export function useSavedResumes() {
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async (silent: boolean = false, filterBuilder: boolean = true) => {
    try {
      const sourceType = filterBuilder ? 'builder' : undefined;
      const response = await resumeApi.getAll(1, 50, sourceType);
      setSavedResumes(response.data.data || []);
    } catch (error) {
      if (!silent) {
        console.error("Error fetching resumes:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  return { savedResumes, loading, fetchResumes };
}
