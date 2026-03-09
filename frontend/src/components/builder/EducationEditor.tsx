import { Trash2, Plus } from 'lucide-react';
import { ResumeContent } from '../../types';

interface EducationEditorProps {
  education: ResumeContent['education'];
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

export default function EducationEditor({ education, onAdd, onUpdate, onRemove }: EducationEditorProps) {
  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Education {index + 1}</span>
            <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-600 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" value={edu.institution} onChange={(e) => onUpdate(index, 'institution', e.target.value)} className="input" placeholder="School / University Name" />
            <input type="text" value={edu.degree} onChange={(e) => onUpdate(index, 'degree', e.target.value)} className="input" placeholder="Degree" />
            <input type="text" value={edu.date} onChange={(e) => onUpdate(index, 'date', e.target.value)} className="input" placeholder="Date / Duration" />
          </div>
        </div>
      ))}
      <button onClick={onAdd} className="btn-outline w-full flex items-center justify-center gap-2 py-2">
        <Plus className="w-4 h-4" /> Add Education
      </button>
    </div>
  );
}
