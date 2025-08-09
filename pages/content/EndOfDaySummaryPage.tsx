
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { WastageLog, BatchLog, EndOfDaySummary } from '../../types.ts';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const EndOfDaySummaryPage: React.FC = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState('');

    const todaySummary = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        
        const allWasteLogs = JSON.parse(localStorage.getItem('waste_logs') || '[]') as WastageLog[];
        const todayWasteLogs = allWasteLogs.filter(log => log.date.startsWith(today));
        const totalWastageCost = todayWasteLogs.reduce((acc, log) => acc + log.cost, 0);

        const allBatchLogs = JSON.parse(localStorage.getItem('batch_logs') || '[]') as BatchLog[];
        const todayBatchLogs = allBatchLogs.filter(log => log.date.startsWith(today));
        
        return {
            totalWastageCost,
            batchSummary: todayBatchLogs
        };
    }, []);
    
    const handleSubmit = () => {
        if (!user) return;
        
        const newSummary: EndOfDaySummary = {
            id: `eod-${uuidv4()}`,
            date: new Date().toISOString(),
            submittedBy: user.id,
            salesData: {}, // This would be populated from a sales system
            wastageSummary: { count: todaySummary.totalWastageCost > 0 ? 1 : 0, totalCost: todaySummary.totalWastageCost },
            batchSummary: { count: todaySummary.batchSummary.length, items: todaySummary.batchSummary },
            notes,
            status: 'Pending',
        };

        const allSummaries = JSON.parse(localStorage.getItem('eod_summaries') || '[]') as EndOfDaySummary[];
        localStorage.setItem('eod_summaries', JSON.stringify([newSummary, ...allSummaries]));
        
        alert('End of Day Summary submitted for approval.');
        setNotes('');
    };

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-display">End of Day Summary</h2>
                 <button 
                    onClick={handleSubmit} 
                    className="bg-success hover:bg-success/80 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                    Submit for Approval
                </button>
            </div>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-primary">Today's Automated Summary ({new Date().toLocaleDateString()})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-dark-bg p-4 rounded-lg">
                            <h4 className="font-semibold">Total Wastage Cost</h4>
                            <p className="text-2xl font-mono text-danger">₱{todaySummary.totalWastageCost.toFixed(2)}</p>
                        </div>
                        <div className="bg-dark-bg p-4 rounded-lg">
                            <h4 className="font-semibold">Batch Productions</h4>
                            <p className="text-2xl font-mono">{todaySummary.batchSummary.length} items</p>
                            <ul className="text-xs mt-1 text-medium-text">
                                {todaySummary.batchSummary.map(b => <li key={b.id}>{b.recipeId} - {b.yield} units</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
                 <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-primary">Notes & Handover</h3>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Add any notes for the next shift or for management review (e.g., customer feedback, equipment issues, etc.)..."
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 h-32"
                    />
                </div>
            </div>
        </div>
    );
};

export default EndOfDaySummaryPage;