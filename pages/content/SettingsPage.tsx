import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { UserRole } from '../../types.ts';


const ToggleSwitch: React.FC<{ label: string; enabled: boolean; setEnabled: (e: boolean) => void, disabled?: boolean }> = ({ label, enabled, setEnabled, disabled=false }) => (
    <div className="flex items-center justify-between">
        <span className={`text-lg ${disabled ? 'text-medium-text' : 'text-light-text'}`}>{label}</span>
        <button onClick={() => !disabled && setEnabled(!enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-dark-border'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`} disabled={disabled}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [businessName, setBusinessName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [multiUserMode, setMultiUserMode] = useState(false);
    const [operatingHours, setOperatingHours] = useState({ open: '09:00', close: '23:00' });
    const [managerCanEditServiceCharge, setManagerCanEditServiceCharge] = useState(true);
    const [hrModuleEnabled, setHrModuleEnabled] = useState(true);
    
    const canManageDevice = user?.role === UserRole.Owner || user?.role === UserRole.Manager;
    const isOwnerOrDev = user?.role === UserRole.Owner || user?.role === UserRole.Developer || user?.role === UserRole.SuperDeveloper;

    useEffect(() => {
        const storedSettings = localStorage.getItem('app_settings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            setBusinessName(parsed.businessName || '');
            setLogoUrl(parsed.logoUrl || '');
            setMultiUserMode(parsed.multiUserMode || false);
            setOperatingHours(parsed.operatingHours || { open: '09:00', close: '23:00' });
            setManagerCanEditServiceCharge(parsed.managerCanEditServiceCharge !== false);
            setHrModuleEnabled(parsed.hrModuleEnabled !== false);
        }
    }, []);

    const handleSave = () => {
        const storedSettings = JSON.parse(localStorage.getItem('app_settings') || '{}');
        const settings = {
            ...storedSettings, // preserve existing module settings
            businessName, logoUrl, multiUserMode,
            operatingHours, managerCanEditServiceCharge,
            hrModuleEnabled,
        };
        localStorage.setItem('app_settings', JSON.stringify(settings));
        alert('Settings saved successfully! Some changes may require an app reload to take effect.');
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <div className="h-full">
            <h2 className="text-3xl font-bold font-display mb-6">System Settings</h2>
            <div className="max-w-2xl mx-auto space-y-8">

                 <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-6">Business Details</h3>
                    <div className="space-y-4">
                         <div>
                            <label className="text-sm text-medium-text">Business Name</label>
                            <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g., The Corner Bistro" className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 mt-1" />
                        </div>
                        <div>
                            <label className="text-sm text-medium-text">Logo URL</label>
                            <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://your-domain.com/logo.png" className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 mt-1" />
                        </div>
                    </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-6">Operational Settings</h3>
                    <div className="space-y-6">
                        <ToggleSwitch label="Multi-User Mode" enabled={multiUserMode} setEnabled={setMultiUserMode} disabled={!canManageDevice} />
                        <p className="text-xs text-medium-text -mt-4">Enable this for shared devices. Turns on PIN-based login for staff.</p>
                        
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-medium-text">Opening Time</label>
                                <input type="time" value={operatingHours.open} onChange={e => setOperatingHours(p => ({...p, open: e.target.value}))} className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 mt-1" />
                            </div>
                             <div>
                                <label className="text-sm text-medium-text">Closing Time</label>
                                <input type="time" value={operatingHours.close} onChange={e => setOperatingHours(p => ({...p, close: e.target.value}))} className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 mt-1" />
                            </div>
                        </div>

                        {isOwnerOrDev && (
                            <>
                                <hr className="border-dark-border" />
                                <ToggleSwitch label="Managers can edit Service Charge" enabled={managerCanEditServiceCharge} setEnabled={setManagerCanEditServiceCharge} />
                                {user?.role === UserRole.Owner && (
                                    <>
                                        <ToggleSwitch label="Enable HR Role/Functions" enabled={hrModuleEnabled} setEnabled={setHrModuleEnabled} />
                                        <p className="text-xs text-medium-text -mt-4">When disabled, Managers will assume HR responsibilities.</p>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {isOwnerOrDev && (
                     <div className="bg-dark-card border border-primary/30 rounded-2xl p-6 text-center">
                        <h3 className="text-xl font-semibold mb-4 text-primary">Advanced Function Control</h3>
                        <p className="text-medium-text mb-4">Enable or disable entire application modules from the Function Control panel.</p>
                        <p className="text-sm font-bold text-accent">This has been moved to its own page for easier management.</p>
                    </div>
                )}


                 <button onClick={handleSave} className="w-full bg-success hover:bg-success/80 text-white font-bold py-3 px-4 rounded-lg transition">Save Settings</button>
            </div>
        </div>
    );
};

export default SettingsPage;