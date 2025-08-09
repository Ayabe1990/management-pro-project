import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../../types';
import { useAuth } from '../../contexts/AuthContext.tsx';

const ActivityLogPage: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const { users } = useAuth();

    useEffect(() => {
        let storedLogs = JSON.parse(localStorage.getItem('activity_logs') || '[]') as ActivityLog[];
        
        // Add user names to logs if they don't have them
        storedLogs = storedLogs.map(log => {
            if (!log.userName) {
                const user = users.find(u => u.id === log.userId);
                log.userName = user ? user.name : 'Unknown User';
            }
            return log;
        });

        setLogs(storedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, [users]);

    return (
        <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display">Manager Activity Log</h2>
            <div className="flex-grow bg-dark-card border border-dark-border rounded-2xl p-4 overflow-hidden">
                <div className="h-full overflow-auto hide-scrollbar">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="sticky top-0 bg-dark-card border-b border-dark-border">
                            <tr>
                                <th className="p-3">Timestamp</th>
                                <th className="p-3">User</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-white/5">
                                    <td className="p-3 text-medium-text text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="p-3 font-semibold">{log.userName}</td>
                                    <td className="p-3">{log.action}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr><td colSpan={3} className="text-center p-8 text-medium-text">No manager activities have been logged yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogPage;