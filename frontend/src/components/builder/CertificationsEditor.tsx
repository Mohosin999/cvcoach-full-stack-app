import { Trash2, Plus } from 'lucide-react';
import { ResumeContent } from '../../types';

interface CertificationsEditorProps {
  certifications: ResumeContent['certifications'];
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

export default function CertificationsEditor({ certifications, onAdd, onUpdate, onRemove }: CertificationsEditorProps) {
  return (
    <div className="space-y-4">
      {(certifications || []).map((cert, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Certification {index + 1}</span>
            <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-600 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" value={cert.title} onChange={(e) => onUpdate(index, 'title', e.target.value)} className="input" placeholder="Certification Title" />
            <input type="text" value={cert.link || ''} onChange={(e) => onUpdate(index, 'link', e.target.value)} className="input" placeholder="Certification Link" />
            <input type="text" value={cert.date || ''} onChange={(e) => onUpdate(index, 'date', e.target.value)} className="input" placeholder="Date" />
          </div>
        </div>
      ))}
      <button onClick={onAdd} className="btn-outline w-full flex items-center justify-center gap-2 py-2">
        <Plus className="w-4 h-4" /> Add Certification
      </button>
    </div>
  );
}
