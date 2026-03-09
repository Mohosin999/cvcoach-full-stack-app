import React from "react";
import { FileText, X } from "lucide-react";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  maxLength?: number;
}

const MAX_JD_LENGTH = 10000;

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  onClear,
  maxLength = MAX_JD_LENGTH,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value.slice(0, maxLength));
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Job Description <span className="text-red-500">*</span>
        </h2>
        {value && (
          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste the job description here..."
        className="input min-h-[200px]"
      />

      <div className="flex justify-between mt-2">
        <span className="text-sm text-gray-500">
          {value.length} / {maxLength} characters
        </span>
      </div>
    </div>
  );
};

export default JobDescriptionInput;
