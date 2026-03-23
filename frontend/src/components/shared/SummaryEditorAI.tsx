import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { resumeBuilderApi } from "../../api/api";
import { AISectionSuggestion } from "../../types";

interface SummaryEditorProps {
  value: string;
  onChange: (value: string) => void;
  personalInfo?: {
    jobTitle?: string;
    fullName?: string;
  };
  skills?: string[];
}

export default function SummaryEditor({
  value,
  onChange,
  personalInfo,
  skills,
}: SummaryEditorProps) {
  const [generating, setGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!personalInfo?.jobTitle?.trim()) {
      toast.error(
        "Please provide a Professional Title first to generate summary.",
      );
      return;
    }

    try {
      setGenerating(true);
      const response = await resumeBuilderApi.generateSection({
        section: "Professional Summary",
        context: {
          jobTitle: personalInfo?.jobTitle,
          skills: skills,
        },
      });

      const suggestion = response.data.data as AISectionSuggestion;
      onChange(suggestion.content);
      toast.success("Summary generated successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate summary",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          Professional Summary
        </label>
        <button
          type="button"
          onClick={handleAIGenerate}
          disabled={generating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 text-white text-sm rounded-lg transition-all disabled:cursor-not-allowed"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {generating ? "Generating..." : "AI Generate"}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full"
        style={{ minHeight: "200px", height: "auto" }}
      />
      <p className="text-xs text-gray-400">
        Tip: Include your years of experience, key skills, and notable
        achievements
      </p>
    </div>
  );
}
