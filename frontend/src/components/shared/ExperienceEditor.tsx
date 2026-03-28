import { Trash2, Plus } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ResumeContent } from '../../types';

interface ExperienceEditorProps {
  experience: ResumeContent['experience'];
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

export default function ExperienceEditor({ experience, onAdd, onUpdate, onRemove }: ExperienceEditorProps) {
  return (
    <div className="space-y-4">
      {experience.map((exp, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Position {index + 1}</span>
            <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-600 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input type="text" value={exp.title} onChange={(e) => onUpdate(index, 'title', e.target.value)} className="input" placeholder="Job Title" />
            <input type="text" value={exp.company} onChange={(e) => onUpdate(index, 'company', e.target.value)} className="input" placeholder="Company" />
            <input type="text" value={exp.startDate} onChange={(e) => onUpdate(index, 'startDate', e.target.value)} className="input" placeholder="Start Date (e.g., Jan 2020)" />
            <div className="flex gap-2">
              <input type="text" value={exp.endDate || ''} onChange={(e) => onUpdate(index, 'endDate', e.target.value)} className="input flex-1" placeholder="End Date" disabled={exp.current} />
              <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                <input type="checkbox" checked={exp.current} onChange={(e) => onUpdate(index, 'current', e.target.checked)} />
                Present
              </label>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-md">
            <ReactQuill
              theme="snow"
              value={exp.description}
              onChange={(value) => onUpdate(index, 'description', value)}
              modules={quillModules}
              formats={quillFormats}
              className="h-32 mb-8"
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </div>
      ))}
      <button onClick={onAdd} className="w-full inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300">
        <Plus className="w-4 h-4" /> Add Experience
      </button>
    </div>
  );
}
