import React, { useState } from 'react';
import { TimeClockEntry, OvertimeRequest } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { XMarkIcon } from './icons.tsx';

interface OvertimeRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: TimeClockEntry;
}

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const OvertimeRequestModal: React.FC<OvertimeRequestModalProps> = ({ isOpen, onClose, entry }) => {
    const { user } = useAuth();
    const [reason, setReason] = useState('');
    const standardShiftMinutes = 8 * 60; // 8 hours
    const overtimeMinutes = Math.max(0, (entry.durationMinutes || 0) - standardShiftMinutes);

    if (!isOpen || !user) return null;

    const handleSubmit = () => {
        if (!reason) {
            alert('A reason is required for overtime requests.');
            return;
        }

        const newRequest: OvertimeRequest = {
            id: `ot-${uuidv4()}`,
            userId: user.id,
            userName: user.name,
            timeClockEntryId: entry.id,
            date: entry.clockInTime,
            requestedMinutes: overtimeMinutes,
            reason,
            status: 'Pending',
        };

        const existingRequests = JSON.parse(localStorage.getItem('overtime_requests') || '[]') as OvertimeRequest[];
        localStorage.setItem('overtime_requests', JSON.stringify([newRequest, ...existingRequests]));
        
        alert('Overtime request submitted successfully.');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h2 className="text-xl font-bold">File Overtime Request</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <p>Shift Date: {new Date(entry.clockInTime).toLocaleDateString()}</p>
                    <p>Total Duration: {Math.floor((entry.durationMinutes || 0) / 60)}h {(entry.durationMinutes || 0) % 60}m</p>
                    <p className="font-bold text-primary">Overtime to Request: {Math.floor(overtimeMinutes / 60)}h {overtimeMinutes % 60}m</p>
                    <div>
                        <label className="text-sm text-medium-text">Reason for Overtime</label>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 mt-1 h-24"
                            placeholder="Please provide a reason for the overtime..."
                            required
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-dark-border flex justify-end">
                    <button onClick={handleSubmit} className="bg-success font-bold py-2 px-6 rounded-lg">Submit Request</button>
                </div>
            </div>
        </div>
    );
};

export default OvertimeRequestModal;