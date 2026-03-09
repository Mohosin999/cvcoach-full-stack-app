import { Trash2 } from 'lucide-react';

interface SkillsEditorProps {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
}

export default function SkillsEditor({ skills, onAdd, onRemove }: SkillsEditorProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((skill) => (
          <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
            {skill}
            <button onClick={() => onRemove(skill)} className="hover:text-red-500">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAdd((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = '';
          }
        }}
        className="input"
        placeholder="Type a skill and press Enter..."
      />
    </div>
  );
}
