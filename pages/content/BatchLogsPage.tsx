import React, { useState, useEffect } from 'react';
import { BatchLog } from '../../types.ts';

const BatchLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<BatchLog[]>([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('batch_logs') || '[]') as BatchLog[];
        setLogs(data);
    }, []);

    return (
        <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display">Batch Production Logs</h2>
            <div className="flex-grow bg-dark-card border border-dark-border rounded-2xl p-4 overflow-hidden">
                <div className="h-full overflow-auto hide-scrollbar">
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="sticky top-0 bg-dark-card">
                            <tr className="border-b border-dark-border">
                                <th className="p-3">Date</th>
                                <th className="p-3">Recipe</th>
                                <th className="p-3 text-right">Yield</th>
                                <th className="p-3 text-right">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-white/5">
                                    <td className="p-3">{new Date(log.date).toLocaleString()}</td>
                                    <td className="p-3 font-semibold">{log.recipeId}</td>
                                    <td className="p-3 text-right font-mono">{log.yield}</td>
                                    <td className="p-3 text-right font-mono">₱{log.totalCost.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BatchLogsPage;