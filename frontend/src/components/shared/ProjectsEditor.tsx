import { Trash2, Plus } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ResumeContent } from '../../types';

interface ProjectsEditorProps {
  projects: ResumeContent['projects'];
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['clean']
  ],
};

const quillFormats = [
  'bold', 'italic', 'underline',
  'list', 'bullet'
];

export default function ProjectsEditor({ projects, onAdd, onUpdate, onRemove }: ProjectsEditorProps) {
  return (
    <div className="space-y-4">
      {(projects || []).map((proj, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project {index + 1}</span>
            <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-600 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input type="text" value={proj.name} onChange={(e) => onUpdate(index, 'name', e.target.value)} className="input" placeholder="Project Title" />
            <input type="text" value={proj.technologies?.join(', ') || ''} onChange={(e) => onUpdate(index, 'technologies', e.target.value.split(',').map(t => t.trim()))} className="input" placeholder="Technologies (comma separated)" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input type="text" value={proj.links?.live || ''} onChange={(e) => onUpdate(index, 'links.live', e.target.value)} className="input" placeholder="Live URL" />
            <input type="text" value={proj.links?.github || ''} onChange={(e) => onUpdate(index, 'links.github', e.target.value)} className="input" placeholder="GitHub Repository" />
            <input type="text" value={proj.links?.caseStudy || ''} onChange={(e) => onUpdate(index, 'links.caseStudy', e.target.value)} className="input" placeholder="Case Study" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-md">
            <ReactQuill
              theme="snow"
              value={proj.description}
              onChange={(value) => onUpdate(index, 'description', value)}
              modules={quillModules}
              formats={quillFormats}
              className="h-32 mb-8"
              placeholder="Project description..."
            />
          </div>
        </div>
      ))}
      <button onClick={onAdd} className="w-full inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300">
        <Plus className="w-4 h-4" /> Add Project
      </button>
    </div>
  );
}
