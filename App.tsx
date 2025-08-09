import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext.tsx';
import Login from './pages/Login.tsx';
import DashboardRouter from './pages/DashboardRouter.tsx';
import MultiUserLobby from './pages/MultiUserLobby.tsx';
import { EditModeProvider } from './contexts/EditModeContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext.tsx';
import OnboardingWizard from './components/OnboardingWizard.tsx';
import SplashScreen from './components/SplashScreen.tsx';

/**
 * This component contains the core application logic and can access contexts
 * provided by the main App component.
 */
const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { hasCompleted } = useOnboarding();

  // State for multi-user mode is managed separately from onboarding status.
  const [isMultiUserMode, setIsMultiUserMode] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
      return settings.multiUserMode === true;
    } catch (e) {
      // Default to single-user mode on error
      return false;
    }
  });

  // Listen for changes from other tabs to keep device mode in sync.
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const newSettings = JSON.parse(localStorage.getItem('app_settings') || '{}');
        if (newSettings.multiUserMode !== isMultiUserMode) {
          setIsMultiUserMode(newSettings.multiUserMode === true);
        }
      } catch (e) {
        console.error("Failed to parse app_settings on storage change:", e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isMultiUserMode]);

  // If onboarding is not complete, show the wizard.
  if (!hasCompleted) {
    return (
      <div className="h-screen w-screen bg-dark-bg flex items-center justify-center font-sans">
        <OnboardingWizard />
      </div>
    );
  }

  // After onboarding, show the appropriate login screen based on device mode.
  if (isMultiUserMode) {
    return user ? <DashboardRouter /> : <MultiUserLobby />;
  }

  return user ? <DashboardRouter /> : <Login />;
};

/**
 * The main App component is responsible for setting up all the context providers
 * that the rest of the application will use.
 */
const App: React.FC = () => {
  const [isVideoFinished, setIsVideoFinished] = useState(() => {
    // Only show splash screen once per session
    return sessionStorage.getItem('splash_played') === 'true';
  });

  const handleVideoEnd = () => {
    sessionStorage.setItem('splash_played', 'true');
    setIsVideoFinished(true);
  };

  // If video hasn't played this session, show it.
  if (!isVideoFinished) {
    return <SplashScreen onVideoEnd={handleVideoEnd} />;
  }

  // After video, render the main app with its providers.
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <EditModeProvider>
          <AppContent />
        </EditModeProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
};

export default App;