interface SummaryEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SummaryEditor({ value, onChange }: SummaryEditorProps) {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full"
        style={{ minHeight: '80px', height: 'auto' }}
        placeholder="Write a brief professional summary..."
      />
    </div>
  );
}
