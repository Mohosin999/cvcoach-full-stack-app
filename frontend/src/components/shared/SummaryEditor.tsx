interface SummaryEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SummaryEditor({ value, onChange }: SummaryEditorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">
        Professional Summary
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full"
        style={{ minHeight: '200px', height: 'auto' }}
        placeholder="Write a brief professional summary..."
      />
    </div>
  );
}
