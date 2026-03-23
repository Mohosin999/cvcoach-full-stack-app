import { Trash2, Plus } from 'lucide-react';
import { ResumeContent } from '../../types';

interface AchievementsEditorProps {
  achievements: ResumeContent['achievements'];
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

export default function AchievementsEditor({ achievements, onAdd, onUpdate, onRemove }: AchievementsEditorProps) {
  return (
    <div className="space-y-4">
      {(achievements || []).map((ach, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Achievement {index + 1}</span>
            <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-600 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input type="text" value={ach.title} onChange={(e) => onUpdate(index, 'title', e.target.value)} className="input" placeholder="Achievement Title" />
            <textarea value={ach.description} onChange={(e) => onUpdate(index, 'description', e.target.value)} className="input" style={{ minHeight: '200px', height: 'auto' }} placeholder="Description (optional)" />
            <input type="text" value={ach.date || ''} onChange={(e) => onUpdate(index, 'date', e.target.value)} className="input" placeholder="Date (optional)" />
          </div>
        </div>
      ))}
      <button onClick={onAdd} className="btn-outline w-full flex items-center justify-center gap-2 py-2">
        <Plus className="w-4 h-4" /> Add Achievement
      </button>
    </div>
  );
}
