import React from "react";
import { Loader2, CheckCircle, Circle } from "lucide-react";

export type AnalysisStep =
  | "uploading"
  | "parsing"
  | "keywords"
  | "skills"
  | "formatting"
  | "experience"
  | "achievements"
  | "grammar"
  | "matching"
  | "complete";

interface AnalysisProgressProps {
  currentStep: AnalysisStep;
  showDetails?: boolean;
}

interface StepInfo {
  id: AnalysisStep;
  label: string;
  description: string;
}

const STEPS: StepInfo[] = [
  {
    id: "uploading",
    label: "Uploading",
    description: "Processing resume file",
  },
  { id: "parsing", label: "Parsing", description: "Extracting resume content" },
  {
    id: "keywords",
    label: "Analyzing Keywords",
    description: "Matching job description keywords",
  },
  {
    id: "skills",
    label: "Evaluating Skills",
    description: "Comparing required skills",
  },
  {
    id: "formatting",
    label: "Checking Format",
    description: "Verifying ATS compatibility",
  },
  {
    id: "experience",
    label: "Reviewing Experience",
    description: "Assessing relevance",
  },
  {
    id: "achievements",
    label: "Quantifying Impact",
    description: "Finding measurable achievements",
  },
  {
    id: "grammar",
    label: "Checking Quality",
    description: "Evaluating readability",
  },
  {
    id: "matching",
    label: "Computing Match",
    description: "Calculating final scores",
  },
  { id: "complete", label: "Complete", description: "Analysis finished!" },
];

const getStepIndex = (step: AnalysisStep): number => {
  return STEPS.findIndex((s) => s.id === step);
};

interface StepItemProps {
  step: StepInfo;
  isActive: boolean;
  isComplete: boolean;
}

const StepItem: React.FC<StepItemProps> = ({ step, isActive, isComplete }) => {
  return (
    <div
      className={`flex items-center gap-3 py-2 transition-opacity duration-200 ${
        isActive || isComplete ? "opacity-100" : "opacity-40"
      }`}
    >
      <div className="flex-shrink-0">
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : isActive ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            isActive
              ? "text-primary"
              : isComplete
                ? "text-green-600 dark:text-green-400"
                : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {step.label}
        </p>
        {isActive && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {step.description}
          </p>
        )}
      </div>
    </div>
  );
};

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentStep,
  showDetails = true,
}) => {
  const currentIndex = getStepIndex(currentStep);
  const progressPercent = Math.round(((currentIndex + 1) / STEPS.length) * 100);
  const currentStepInfo = STEPS[currentIndex];

  return (
    <div className="card py-8">
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <svg className="absolute inset-0 w-20 h-20 -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={226}
              strokeDashoffset={226 - (226 * progressPercent) / 100}
              strokeLinecap="round"
              className="text-primary"
            />
          </svg>
        </div>

        <p className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          {currentStepInfo?.label || "Analyzing..."}
        </p>

        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {currentStepInfo?.description || "Please wait"}
        </p>
      </div>

      {showDetails && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="space-y-1">
            {STEPS.map((step, index) => (
              <StepItem
                key={step.id}
                step={step}
                isActive={step.id === currentStep}
                isComplete={index < currentIndex}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;
