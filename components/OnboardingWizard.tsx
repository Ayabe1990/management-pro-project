import React, { useState } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext.tsx';
import { ChevronRightIcon } from './icons.tsx';

const OnboardingWizard: React.FC = () => {
    const { completeOnboarding } = useOnboarding();
    const [step, setStep] = useState(1);
    const [businessName, setBusinessName] = useState('My Restaurant');
    const [isMultiUserMode, setIsMultiUserMode] = useState(false);
    
    const handleFinish = () => {
        const settings = {
            businessName,
            multiUserMode: isMultiUserMode,
            hasCompletedOnboarding: true,
        };
        const existingSettings = JSON.parse(localStorage.getItem('app_settings') || '{}');
        localStorage.setItem('app_settings', JSON.stringify({ ...existingSettings, ...settings }));
        completeOnboarding();
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h2 className="text-3xl font-bold text-primary">Welcome to ManagementPro!</h2>
                        <p className="text-medium-text mt-2 mb-8">Let's configure your business settings with a few quick steps.</p>
                        <div>
                            <label className="block text-medium-text text-sm font-bold mb-2">What is the name of your establishment?</label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary transition"
                                placeholder="e.g., The Corner Bistro"
                            />
                        </div>
                        <button onClick={() => setStep(2)} className="w-full mt-8 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2">
                            Continue <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </>
                );
            case 2:
                 return (
                    <>
                        <h2 className="text-3xl font-bold text-primary">Device Mode Configuration</h2>
                        <p className="text-medium-text mt-2 mb-8">How will this specific device be utilized by your team?</p>
                        <div className="space-y-4">
                            <button onClick={() => setIsMultiUserMode(false)} className={`w-full text-left p-4 rounded-lg border-2 transition ${!isMultiUserMode ? 'bg-primary/20 border-primary shadow-glow-sm-primary' : 'bg-dark-bg border-dark-border'}`}>
                                <h3 className="font-bold">Single-User Mode</h3>
                                <p className="text-sm text-medium-text">One dedicated user logs in with a password. Ideal for back-office or personal manager devices.</p>
                            </button>
                             <button onClick={() => setIsMultiUserMode(true)} className={`w-full text-left p-4 rounded-lg border-2 transition ${isMultiUserMode ? 'bg-primary/20 border-primary shadow-glow-sm-primary' : 'bg-dark-bg border-dark-border'}`}>
                                <h3 className="font-bold">Shared (POS) Mode</h3>
                                <p className="text-sm text-medium-text">Multiple staff (e.g., waiters, bartenders) share this device, logging in with a secure 4-digit PIN.</p>
                            </button>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(1)} className="w-1/2 bg-dark-border text-white font-bold py-3 px-4 rounded-lg">Back</button>
                            <button onClick={handleFinish} className="w-1/2 bg-success text-dark-bg font-bold py-3 px-4 rounded-lg shadow-lg shadow-success/30">Finish Setup</button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    }

    return (
        <div className="w-full max-w-lg mx-auto">
             <div className="bg-dark-card/80 backdrop-blur-md border border-dark-border rounded-2xl p-8 shadow-2xl shadow-primary/10 animate-fade-in">
                {renderStep()}
            </div>
        </div>
    );
};

export default OnboardingWizard;