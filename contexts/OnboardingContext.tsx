import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface OnboardingContextType {
  hasCompleted: boolean;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasCompleted, setHasCompleted] = useState(() => {
    const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
    return settings.hasCompletedOnboarding === true;
  });

  const completeOnboarding = useCallback(() => {
    setHasCompleted(true);
    // The actual localStorage update happens in the wizard component
  }, []);

  return (
    <OnboardingContext.Provider value={{ hasCompleted, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
