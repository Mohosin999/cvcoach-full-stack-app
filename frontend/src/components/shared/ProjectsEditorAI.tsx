import { useState } from 'react';
import { Sparkles, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { resumeBuilderApi } from '../../api/api';
import { AISectionSuggestion, Project } from '../../types';

interface ProjectsEditorProps {
  projects: Project[] | undefined;
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

export default function ProjectsEditor({
  projects = [],
  onAdd,
  onUpdate,
  onRemove,
}: ProjectsEditorProps) {
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const handleAIGenerate = async (index: number) => {
    const project = projects[index];
    
    if (!project.name?.trim()) {
      toast.error('Please provide a Project Name first to generate description.');
      return;
    }

    try {
      setGeneratingIndex(index);
      const response = await resumeBuilderApi.generateSection({
        section: 'Project Description',
        context: {
          jobTitle: project.name,
          skills: project.technologies,
        },
      });

      const suggestion = response.data.data as AISectionSuggestion;
      onUpdate(index, 'description', suggestion.content);
      toast.success('Project description generated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate description');
    } finally {
      setGeneratingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Projects</label>
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-1.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 text-white text-sm rounded-lg transition-all"
        >
          + Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-400 text-sm">No projects added yet</p>
      ) : (
        projects.map((project, index) => (
          <div key={index} className="bg-gray-700/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">Project {index + 1}</h4>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400">Project Name *</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => onUpdate(index, 'name', e.target.value)}
                  className="input w-full text-sm"
                  placeholder="e.g., E-commerce Platform"
                />
              </div>
              <div className="flex items-end gap-2">
                {project.links?.live && (
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-600/30 text-emerald-400 text-xs rounded hover:bg-emerald-600/50 transition-colors"
                  >
                    Live
                  </a>
                )}
                {project.links?.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-600/50 text-gray-300 text-xs rounded hover:bg-gray-600 transition-colors"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Description *</label>
                <button
                  type="button"
                  onClick={() => handleAIGenerate(index)}
                  disabled={generatingIndex === index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 text-white text-xs rounded transition-all disabled:cursor-not-allowed"
                >
                  {generatingIndex === index ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  {generatingIndex === index ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <textarea
                value={project.description}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                className="input w-full text-sm"
                style={{ minHeight: '200px', height: 'auto' }}
                placeholder="Describe the project, your role, and technologies used..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Live Link</label>
                <input
                  type="url"
                  value={project.links?.live || ''}
                  onChange={(e) =>
                    onUpdate(index, 'links.live', e.target.value)
                  }
                  className="input w-full text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">GitHub Link</label>
                <input
                  type="url"
                  value={project.links?.github || ''}
                  onChange={(e) =>
                    onUpdate(index, 'links.github', e.target.value)
                  }
                  className="input w-full text-sm"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
