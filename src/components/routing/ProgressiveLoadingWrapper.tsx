import React, { useEffect } from 'react';

// Enhanced routing infrastructure
import { ProgressiveLoadingIndicator } from './RouteLoadingComponents';

// Props interface for ProgressiveLoadingWrapper
interface ProgressiveLoadingWrapperProps {
  children: React.ReactNode;
  stages: string[];
  route: string;
}

// Progressive loading wrapper for complex trading workflows
export const ProgressiveLoadingWrapper: React.FC<ProgressiveLoadingWrapperProps> = ({ children, stages, route }) => {
  const [currentStage, setCurrentStage] = React.useState(0);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadStage = (stageIndex: number) => {
      if (stageIndex < stages.length) {
        setCurrentStage(stageIndex);
        timerRef.current = setTimeout(() => loadStage(stageIndex + 1), 200);
      }
    };

    loadStage(0);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [stages.length]);

  if (currentStage < stages.length) {
    return (
      <ProgressiveLoadingIndicator
        stage={stages[currentStage] ?? ''}
        currentStage={currentStage + 1}
        totalStages={stages.length}
      />
    );
  }

  return <>{children}</>;
};