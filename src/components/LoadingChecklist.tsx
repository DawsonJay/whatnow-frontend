import { useState, useEffect } from 'react';
import { getThemeClasses } from '../theme';

interface LoadingChecklistProps {
  message?: string;
  onComplete?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  duration: number; // in milliseconds
}

export default function LoadingChecklist({ 
  message = 'Preparing your personalized recommendations...',
  onComplete 
}: LoadingChecklistProps) {
  const theme = getThemeClasses();
  const [currentStep, setCurrentStep] = useState(0);
  const [allCompleted, setAllCompleted] = useState(false);

  const checklistItems: ChecklistItem[] = [
    { id: 'embeddings', label: 'Loading activity embeddings', completed: false, duration: 1500 },
    { id: 'processing', label: 'Processing your preferences', completed: false, duration: 1200 },
    { id: 'ranking', label: 'Ranking activities for you', completed: false, duration: 1000 },
    { id: 'preparing', label: 'Preparing your first comparison', completed: false, duration: 800 },
  ];

  useEffect(() => {
    if (currentStep >= checklistItems.length) {
      setAllCompleted(true);
      onComplete?.();
      return;
    }

    const currentItem = checklistItems[currentStep];
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, currentItem.duration);

    return () => clearTimeout(timer);
  }, [currentStep, checklistItems.length]);

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#D4A574]/30 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#D4A574] border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Main message */}
      <h2 className={`text-xl font-semibold ${theme.textPrimary} mb-6 text-center`}>
        {message}
      </h2>

      {/* Checklist */}
      <div className="w-full space-y-3">
        {checklistItems.map((item, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={item.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? `${theme.card} shadow-md` 
                  : isCompleted 
                    ? 'bg-[#8B9A6B]/20 border border-[#8B9A6B]/30' 
                    : 'bg-[#F8F4E6]/50 border border-[#E8E2D0]'
              }`}
            >
              {/* Checkbox/Icon */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {isCompleted ? (
                  <div className="w-5 h-5 bg-[#8B9A6B] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 border-2 border-[#D4A574] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#D4A574] rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-[#E8E2D0] rounded-full"></div>
                )}
              </div>

              {/* Label */}
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isActive 
                  ? theme.textPrimary 
                  : isCompleted 
                    ? 'text-[#8B9A6B]' 
                    : 'text-[#5A5A5A]'
              }`}>
                {item.label}
              </span>

              {/* Loading indicator for active item */}
              {isActive && (
                <div className="flex-shrink-0">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-[#D4A574] rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-[#D4A574] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-[#D4A574] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {allCompleted && (
        <div className="mt-6 text-center">
          <p className={`text-sm ${theme.textSecondary}`}>
            Almost ready! Starting your game...
          </p>
        </div>
      )}
    </div>
  );
}
