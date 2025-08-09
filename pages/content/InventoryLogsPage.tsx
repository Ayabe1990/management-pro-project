import React, { useState, useEffect } from 'react';
import { InventoryLog } from '../../types.ts';

const InventoryLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<InventoryLog[]>([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('inventory_logs') || '[]') as InventoryLog[];
        setLogs(data);
    }, []);

    return (
        <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display mb-6">Inventory Movement Logs</h2>
            <div className="flex-grow bg-dark-card border border-dark-border rounded-2xl p-4 overflow-hidden">
                <div className="h-full overflow-auto hide-scrollbar">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="sticky top-0 bg-dark-card">
                            <tr className="border-b border-dark-border">
                                <th className="p-3">Timestamp</th>
                                <th className="p-3">Item Name</th>
                                <th className="p-3">Action</th>
                                <th className="p-3 text-right">Change</th>
                                <th className="p-3">User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="p-3 font-semibold">{log.itemName}</td>
                                    <td className="p-3">{log.action}</td>
                                    <td className="p-3 text-right font-mono">{log.quantityChange}</td>
                                    <td className="p-3">{log.responsibleUser}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryLogsPage;