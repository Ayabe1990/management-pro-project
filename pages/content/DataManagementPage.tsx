import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { DeletedDataLog } from '../../types.ts';
import { logActivity } from '../../utils/activityLogger.ts';

const dataKeys = [
    'users', 'inventory', 'recipes', 'tables_data', 'tabs_data', 'equipment_inventory',
    'market_list', 'billers', 'expenses', 'stock_requests', 'activity_logs',
    'time_clock_entries', 'time_clock_break_entries', 'eod_summaries',
    'schedule_approvals', 'service_charge_release_requests', 'incident_reports',
    'waste_logs', 'batch_logs', 'inventory_logs', 'sale_logs', 'vouchers',
    'event_tickets', 'notifications', 'overtime_requests',
];

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});


const DataManagementPage: React.FC = () => {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [deletionLogs, setDeletionLogs] = useState<DeletedDataLog[]>([]);
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        const logs = JSON.parse(localStorage.getItem('deleted_data_logs') || '[]') as DeletedDataLog[];
        setDeletionLogs(logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, []);

    const handleKeyToggle = (key: string) => {
        setSelectedKeys(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleExport = () => {
        const dataToExport: Record<string, any> = {};
        const keysToExport = selectedKeys.length > 0 ? selectedKeys : dataKeys;

        keysToExport.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key) || 'null');
                if (Array.isArray(data) && startDate && endDate) {
                    dataToExport[key] = data.filter(item => {
                        const itemDateStr = item.date || item.timestamp || item.clockInTime || item.dateRun;
                        if (!itemDateStr) return true; // Include items without a date
                        const itemDate = new Date(itemDateStr);
                        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
                    });
                } else {
                    dataToExport[key] = data;
                }
            } catch (e) {
                console.error(`Could not export data for key: ${key}`, e);
            }
        });
        
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `management_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        logActivity(`Exported data for keys: ${keysToExport.join(', ')}`, user);
    };

    const handleDelete = () => {
        if (confirmText !== 'DELETE DATA' || selectedKeys.length === 0 || !startDate || !endDate) {
            alert('Please type "DELETE DATA" to confirm, and select at least one data type and a valid date range.');
            return;
        }

        const keysToDelete = selectedKeys;
        let deletedCounts: Record<string, number> = {};

        keysToDelete.forEach(key => {
            try {
                let data = JSON.parse(localStorage.getItem(key) || 'null');
                if (Array.isArray(data)) {
                    const originalLength = data.length;
                    const dataToKeep = data.filter(item => {
                        const itemDateStr = item.date || item.timestamp || item.clockInTime || item.dateRun || item.submittedAt;
                        if (!itemDateStr) return true; // Keep items without a date
                        const itemDate = new Date(itemDateStr);
                        return itemDate < new Date(startDate) || itemDate > new Date(endDate);
                    });
                    deletedCounts[key] = originalLength - dataToKeep.length;
                    localStorage.setItem(key, JSON.stringify(dataToKeep));
                } else {
                    console.warn(`Skipping deletion for non-array key: ${key}`);
                }
            } catch (e) {
                console.error(`Could not delete data for key: ${key}`, e);
            }
        });

        const newLog: DeletedDataLog = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            deletedBy: user?.name || 'Unknown',
            userId: user?.id || 'Unknown',
            dateRange: [startDate, endDate],
            dataType: keysToDelete,
            recordCounts: deletedCounts,
        };

        const existingLogs = JSON.parse(localStorage.getItem('deleted_data_logs') || '[]') as DeletedDataLog[];
        existingLogs.unshift(newLog);
        localStorage.setItem('deleted_data_logs', JSON.stringify(existingLogs));
        setDeletionLogs(existingLogs);
        
        logActivity(`DELETED data for keys: ${keysToDelete.join(', ')} in range ${startDate} to ${endDate}`, user);
        
        alert('Data successfully deleted.');
        setConfirmText('');
        setSelectedKeys([]);
    };


    return (
        <div className="h-full space-y-6">
            <h2 className="text-3xl font-bold font-display">Data Management (Owner)</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
                    <h3 className="text-xl font-bold text-primary">Export & Delete Data</h3>
                    <p className="text-sm text-medium-text">Select data types and a date range to export or delete records. If no types are selected, all data will be exported.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                    </div>
                     <div className="max-h-60 overflow-y-auto bg-dark-bg p-2 rounded-md border border-dark-border space-y-1">
                        {dataKeys.map(key => (
                            <label key={key} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedKeys.includes(key) ? 'bg-primary' : 'hover:bg-white/10'}`}>
                                <input type="checkbox" checked={selectedKeys.includes(key)} onChange={() => handleKeyToggle(key)} className="hidden" />
                                <span className="text-sm font-mono">{key}</span>
                            </label>
                        ))}
                    </div>
                     <button onClick={handleExport} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded-lg">Export Selected Data</button>
                    <div className="border-t border-danger/50 pt-4 space-y-3">
                         <h4 className="text-lg font-bold text-danger">Danger Zone: Delete Data</h4>
                         <p className="text-xs text-danger">This action is permanent and cannot be undone. A log will be created.</p>
                         <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder='Type "DELETE DATA" to confirm' className="w-full bg-dark-bg p-2 rounded-md border border-danger placeholder:text-danger/50" />
                         <button onClick={handleDelete} className="w-full bg-danger hover:bg-danger/80 text-white font-bold py-2 rounded-lg">Delete Selected Data in Range</button>
                    </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-primary mb-4">Deletion Log</h3>
                    <div className="flex-grow overflow-y-auto hide-scrollbar space-y-4">
                        {deletionLogs.length === 0 && <p className="text-center text-medium-text">No data has been deleted yet.</p>}
                        {deletionLogs.map(log => (
                            <div key={log.id} className="bg-dark-bg p-3 rounded-lg">
                                <p className="font-bold">{log.deletedBy} on {new Date(log.timestamp).toLocaleString()}</p>
                                <p className="text-xs text-medium-text">Range: {log.dateRange[0]} to {log.dateRange[1]}</p>
                                <p className="text-sm font-mono mt-1">{log.dataType.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataManagementPage;
