import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { TimeClockEntry, OvertimeRequest } from '../../types.ts';
import FaceAuth from '../../components/FaceAuth.tsx';
import OvertimeRequestModal from '../../components/OvertimeRequestModal.tsx';

const formatDuration = (minutes: number | null): string => {
    if (minutes === null || minutes < 0) return '-';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

const TimeClockPage: React.FC = () => {
    const { user, clockIn, clockOut, startBreak, endBreak } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userEntries, setUserEntries] = useState<TimeClockEntry[]>([]);
    const [isFaceAuthOpen, setIsFaceAuthOpen] = useState(false);
    const [actionToAuth, setActionToAuth] = useState<'in' | 'out' | null>(null);

    const [isOvertimeModalOpen, setOvertimeModalOpen] = useState(false);
    const [selectedEntryForOT, setSelectedEntryForOT] = useState<TimeClockEntry | null>(null);

    const overtimeRequests = useMemo(() => {
        // This is a bit inefficient to parse on every render, but simple for this context.
        // A context or state management library would be better for a real app.
        return JSON.parse(localStorage.getItem('overtime_requests') || '[]') as OvertimeRequest[];
    }, [userEntries]); // Re-calculate when entries change to force re-render
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const loadEntries = useCallback(() => {
        if (user) {
            const allEntries: TimeClockEntry[] = JSON.parse(localStorage.getItem('time_clock_entries') || '[]');
            setUserEntries(
                allEntries
                    .filter(e => e.userId === user.id)
                    .sort((a,b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime())
            );
        }
    }, [user]);

    useEffect(() => {
        loadEntries();
        const handleAuthChange = () => loadEntries();
        document.addEventListener('auth_change', handleAuthChange);
        return () => document.removeEventListener('auth_change', handleAuthChange);
    }, [loadEntries]);


    const handleClockAction = () => {
        if (user?.isClockedIn) {
            setActionToAuth('out');
        } else {
            setActionToAuth('in');
        }
        setIsFaceAuthOpen(true);
    };

    const handleAuthSuccess = () => {
        if (actionToAuth === 'in') {
            clockIn();
        } else if (actionToAuth === 'out') {
            clockOut();
        }
        setIsFaceAuthOpen(false);
        setActionToAuth(null);
    };
    
    const getStatusText = () => {
        if (user?.isClockedIn) {
            return user.isOnBreak ? "On Break" : "Clocked In";
        }
        return "Clocked Out";
    };

    const getStatusColor = () => {
        if (user?.isClockedIn) {
            return user.isOnBreak ? "text-warning" : "text-success";
        }
        return "text-danger";
    };

    const handleFileOvertime = (entry: TimeClockEntry) => {
        setSelectedEntryForOT(entry);
        setOvertimeModalOpen(true);
    };
    
    return (
        <>
            <div className="h-full flex flex-col items-center justify-start pt-10">
                <div className="w-full max-w-4xl bg-dark-card border border-dark-border rounded-2xl p-8 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-4">
                         <div className={`w-4 h-4 rounded-full ${user?.isClockedIn ? (user.isOnBreak ? 'bg-warning' : 'bg-success animate-pulse') : 'bg-danger'}`}></div>
                        <p className={`text-2xl font-semibold ${getStatusColor()}`}>
                           You are currently {getStatusText()}
                        </p>
                    </div>

                    <h1 className="text-7xl font-display font-bold tracking-widest">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </h1>
                    <p className="text-medium-text mt-2">{currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <div className="mt-8 w-full max-w-lg flex flex-col items-center gap-4">
                        {user?.isClockedIn ? (
                             <div className="w-full flex gap-4">
                                {user.isOnBreak ? (
                                    <button onClick={endBreak} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg transition text-2xl">
                                        End Break
                                    </button>
                                ) : (
                                     <button onClick={startBreak} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg transition text-2xl">
                                        Start Break
                                    </button>
                                )}
                                <button
                                    onClick={handleClockAction}
                                    disabled={user.isOnBreak}
                                    className="w-full bg-danger hover:bg-danger/80 text-white font-bold py-4 rounded-lg transition text-2xl disabled:bg-danger/50 disabled:cursor-not-allowed"
                                >
                                    Clock Out
                                </button>
                            </div>
                        ) : (
                             <button
                                onClick={handleClockAction}
                                className="w-full bg-success hover:bg-success/80 text-white font-bold py-4 rounded-lg transition text-2xl"
                            >
                                Clock In
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="w-full max-w-4xl bg-dark-card border border-dark-border rounded-2xl p-4 mt-6">
                    <h3 className="text-xl font-semibold p-2">My Recent Shifts</h3>
                     <div className="overflow-y-auto max-h-64 hide-scrollbar">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-dark-card">
                                <tr className="border-b border-dark-border">
                                    <th className="p-3 text-sm">Date</th>
                                    <th className="p-3 text-sm">Clock In</th>
                                    <th className="p-3 text-sm">Clock Out</th>
                                    <th className="p-3 text-sm text-right">Duration</th>
                                    <th className="p-3 text-sm text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {userEntries.length === 0 && (
                                    <tr><td colSpan={5} className="text-center p-8 text-medium-text">No shift history found.</td></tr>
                                )}
                                {userEntries.map(entry => {
                                    const otRequest = overtimeRequests.find(req => req.timeClockEntryId === entry.id);
                                    return (
                                        <tr key={entry.id}>
                                            <td className="p-3">{new Date(entry.clockInTime).toLocaleDateString()}</td>
                                            <td className="p-3 font-mono">{new Date(entry.clockInTime).toLocaleTimeString()}</td>
                                            <td className="p-3 font-mono">{entry.clockOutTime ? new Date(entry.clockOutTime).toLocaleTimeString() : 'Active'}</td>
                                            <td className="p-3 text-right font-mono font-bold">{formatDuration(entry.durationMinutes)}</td>
                                            <td className="p-3 text-center">
                                                {entry.clockOutTime && (entry.durationMinutes || 0) > 480 && !otRequest && (
                                                    <button onClick={() => handleFileOvertime(entry)} className="text-xs bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-md">
                                                        File OT
                                                    </button>
                                                )}
                                                {otRequest && (
                                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                                        {Pending: 'bg-warning/20 text-warning', Approved: 'bg-success/20 text-success', Rejected: 'bg-danger/20 text-danger'}[otRequest.status]
                                                    }`}>
                                                        OT {otRequest.status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isFaceAuthOpen && (
                <FaceAuth 
                    onSuccess={handleAuthSuccess}
                    onClose={() => setIsFaceAuthOpen(false)}
                />
            )}
             {isOvertimeModalOpen && selectedEntryForOT && (
                <OvertimeRequestModal
                    isOpen={isOvertimeModalOpen}
                    onClose={() => { setOvertimeModalOpen(false); setSelectedEntryForOT(null); loadEntries(); }}
                    entry={selectedEntryForOT}
                />
            )}
        </>
    );
};

export default TimeClockPage;