import { useState } from 'react';
import { Sparkles, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { resumeBuilderApi } from '../../api/api';
import { AISectionSuggestion } from '../../types';

interface SkillsEditorProps {
  technicalSkills: string[];
  softSkills: string[];
  onAddTechnicalSkill: (skill: string) => void;
  onRemoveTechnicalSkill: (skill: string) => void;
  onAddSoftSkill: (skill: string) => void;
  onRemoveSoftSkill: (skill: string) => void;
  jobTitle?: string;
}

export default function SkillsEditorAI({
  technicalSkills,
  softSkills,
  onAddTechnicalSkill,
  onRemoveTechnicalSkill,
  onAddSoftSkill,
  onRemoveSoftSkill,
  jobTitle,
}: SkillsEditorProps) {
  const [newTechnicalSkill, setNewTechnicalSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleAddTechnicalSkill = () => {
    if (newTechnicalSkill.trim()) {
      onAddTechnicalSkill(newTechnicalSkill.trim());
      setNewTechnicalSkill('');
    }
  };

  const handleAddSoftSkill = () => {
    if (newSoftSkill.trim()) {
      onAddSoftSkill(newSoftSkill.trim());
      setNewSoftSkill('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handler();
    }
  };

  const handleAISuggest = async () => {
    try {
      setGenerating(true);
      const response = await resumeBuilderApi.generateSection({
        section: 'Technical Skills',
        context: {
          jobTitle,
        },
      });

      const suggestion = response.data.data as AISectionSuggestion;
      const suggestedSkills = suggestion.content
        .split(/[,\n•-]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0 && s.length < 50);

      suggestedSkills.slice(0, 5).forEach((skill: string) => {
        if (!technicalSkills.includes(skill)) {
          onAddTechnicalSkill(skill);
        }
      });

      toast.success(`${Math.min(5, suggestedSkills.length)} technical skills added!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to suggest skills');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Technical Skills Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Technical Skills</label>
          <button
            type="button"
            onClick={handleAISuggest}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white text-sm rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating ? 'Generating...' : 'AI Suggest'}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTechnicalSkill}
            onChange={(e) => setNewTechnicalSkill(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleAddTechnicalSkill)}
            className="input flex-1 text-sm"
            placeholder="e.g., React, Node.js, Python"
          />
          <button
            type="button"
            onClick={handleAddTechnicalSkill}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {technicalSkills.length === 0 ? (
          <p className="text-gray-400 text-sm">No technical skills added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {technicalSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => onRemoveTechnicalSkill(skill)}
                  className="hover:text-emerald-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">
          Tip: Add programming languages, frameworks, tools, and technologies
        </p>
      </div>

      {/* Soft Skills Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Soft Skills</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSoftSkill}
            onChange={(e) => setNewSoftSkill(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleAddSoftSkill)}
            className="input flex-1 text-sm"
            placeholder="e.g., Communication, Leadership"
          />
          <button
            type="button"
            onClick={handleAddSoftSkill}
            className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {softSkills.length === 0 ? (
          <p className="text-gray-400 text-sm">No soft skills added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-900/30 border border-violet-500/30 text-violet-300 rounded-lg text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => onRemoveSoftSkill(skill)}
                  className="hover:text-violet-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">
          Tip: Add interpersonal skills like communication, teamwork, problem-solving
        </p>
      </div>
    </div>
  );
}
