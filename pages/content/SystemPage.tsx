
import React from 'react';

const SystemPage: React.FC = () => {
    const handleReset = () => {
        if (window.confirm('ARE YOU ABSOLUTELY SURE? This will wipe all application data and cannot be undone.')) {
            if (window.prompt('To confirm, type "RESET" in the box below:') === 'RESET') {
                localStorage.clear();
                alert('Factory reset initiated. The application will now reload with default settings.');
                window.location.reload();
            } else {
                alert('Confirmation failed. Reset cancelled.');
            }
        }
    };

    return (
        <div className="h-full">
            <h2 className="text-3xl font-bold font-display mb-6">System & Developer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4">System Status</h3>
                    <p className="text-success">All Systems Operational</p>
                </div>
                 <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Error Logs</h3>
                    <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition">View Error Logs</button>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                     <h3 className="text-xl font-semibold">Maintenance</h3>
                     <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition">Initiate Manual Backup</button>
                     <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition">Rollback to Functioning Version</button>
                </div>
                <div className="bg-danger/20 border border-danger rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-danger">Danger Zone</h3>
                    <button onClick={handleReset} className="w-full bg-danger hover:bg-danger/80 text-white font-bold py-2 px-4 rounded-lg transition">Reset Factory Settings</button>
                </div>
            </div>
        </div>
    );
};

export default SystemPage;