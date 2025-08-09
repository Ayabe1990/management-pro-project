import React, { useState, useEffect } from 'react';

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; setEnabled: (e: boolean) => void, disabled?: boolean }> = ({ label, enabled, setEnabled, disabled = false }) => (
    <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
        <span className={`text-lg ${disabled ? 'text-medium-text' : 'text-light-text'}`}>{label}</span>
        <button onClick={() => !disabled && setEnabled(!enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-dark-border'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`} disabled={disabled}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

interface ModuleSettings {
    inventorySystem: boolean;
    posSystem: boolean;
    batchProduction: boolean;
    procurement: boolean;
    marketList: boolean;
    barcodeScanner: boolean;
    loggingAndReports: boolean;
    payrollSystem: boolean;
    financeSystem: boolean;
}

const FunctionControlPage: React.FC = () => {
    const [moduleSettings, setModuleSettings] = useState<ModuleSettings>({
        inventorySystem: true,
        posSystem: true,
        batchProduction: true,
        procurement: true,
        marketList: true,
        barcodeScanner: true,
        loggingAndReports: true,
        payrollSystem: true,
        financeSystem: true,
    });

    useEffect(() => {
        const storedSettings = localStorage.getItem('app_settings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            if (parsed.modules) {
                setModuleSettings(prev => ({...prev, ...parsed.modules}));
            }
        }
    }, []);
    
    const handleSave = () => {
        const storedSettings = JSON.parse(localStorage.getItem('app_settings') || '{}');
        const settings = {
            ...storedSettings,
            modules: moduleSettings,
        };
        localStorage.setItem('app_settings', JSON.stringify(settings));
        alert('Module settings saved! App may need to be reloaded for all changes to take effect.');
        window.dispatchEvent(new Event('storage'));
    };
    
    const handleModuleToggle = (module: keyof ModuleSettings, value: boolean) => {
        setModuleSettings(prev => ({ ...prev, [module]: value }));
    };

    return (
        <div className="h-full">
            <h2 className="text-3xl font-bold font-display mb-6">Function Control Panel</h2>
             <div className="max-w-2xl mx-auto space-y-8">
                 <div className="bg-dark-card border border-primary/30 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-6 text-primary">Core Modules (Owner/Dev)</h3>
                    <div className="space-y-4">
                        <ToggleSwitch label="Inventory System" enabled={moduleSettings.inventorySystem} setEnabled={(val) => handleModuleToggle('inventorySystem', val)} />
                        <ToggleSwitch label="POS System" enabled={moduleSettings.posSystem} setEnabled={(val) => handleModuleToggle('posSystem', val)} />
                        <ToggleSwitch label="Batch Production" enabled={moduleSettings.batchProduction} setEnabled={(val) => handleModuleToggle('batchProduction', val)} />
                        <ToggleSwitch label="Procurement Workflow" enabled={moduleSettings.procurement} setEnabled={(val) => handleModuleToggle('procurement', val)} />
                        <ToggleSwitch label="Market List" enabled={moduleSettings.marketList} setEnabled={(val) => handleModuleToggle('marketList', val)} />
                        <ToggleSwitch label="Barcode & QR Scanner" enabled={moduleSettings.barcodeScanner} setEnabled={(val) => handleModuleToggle('barcodeScanner', val)} />
                        <ToggleSwitch label="Logging & Reports" enabled={moduleSettings.loggingAndReports} setEnabled={(val) => handleModuleToggle('loggingAndReports', val)} />
                        <ToggleSwitch label="Payroll Center" enabled={moduleSettings.payrollSystem} setEnabled={(val) => handleModuleToggle('payrollSystem', val)} />
                        <ToggleSwitch label="Finance Center" enabled={moduleSettings.financeSystem} setEnabled={(val) => handleModuleToggle('financeSystem', val)} />
                    </div>
                </div>
                 <button onClick={handleSave} className="w-full bg-success hover:bg-success/80 text-white font-bold py-3 px-4 rounded-lg transition">Save Module Settings</button>
            </div>
        </div>
    );
};

export default FunctionControlPage;