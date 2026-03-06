import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AnalysisSectionProps {
  title: string;
  icon?: 'alert' | 'check' | 'info';
  children: React.ReactNode;
  defaultOpen?: boolean;
  score?: number;
  scoreLabel?: string;
}

const getIconClass = (icon?: 'alert' | 'check' | 'info') => {
  switch (icon) {
    case 'alert':
      return 'text-red-500';
    case 'check':
      return 'text-green-500';
    case 'info':
    default:
      return 'text-primary';
  }
};

const getIcon = (icon?: 'alert' | 'check' | 'info') => {
  switch (icon) {
    case 'alert':
      return AlertCircle;
    case 'check':
      return CheckCircle;
    case 'info':
    default:
      return Info;
  }
};

export const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  title,
  icon = 'info',
  children,
  defaultOpen = true,
  score,
  scoreLabel
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const Icon = getIcon(icon);

  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${getIconClass(icon)}`} />
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {score !== undefined && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {score}%
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
};

interface SuggestionItemProps {
  suggestion: string;
  type?: 'improvement' | 'strength' | 'warning';
}

const getSuggestionClasses = (type?: 'improvement' | 'strength' | 'warning') => {
  switch (type) {
    case 'strength':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    default:
      return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
  }
};

const getSuggestionIcon = (type?: 'improvement' | 'strength' | 'warning') => {
  switch (type) {
    case 'strength':
      return CheckCircle;
    case 'warning':
      return AlertCircle;
    default:
      return Info;
  }
};

export const SuggestionItem: React.FC<SuggestionItemProps> = ({
  suggestion,
  type = 'improvement'
}) => {
  const Icon = getSuggestionIcon(type);

  return (
    <li
      className={`flex items-start gap-3 p-3 rounded-lg border ${getSuggestionClasses(
        type
      )}`}
    >
      <Icon
        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
          type === 'strength'
            ? 'text-green-500'
            : type === 'warning'
            ? 'text-yellow-500'
            : 'text-purple-500'
        }`}
      />
      <p className="text-gray-700 dark:text-gray-300 text-sm">{suggestion}</p>
    </li>
  );
};

export default AnalysisSection;
