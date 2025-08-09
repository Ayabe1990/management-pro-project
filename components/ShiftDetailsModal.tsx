import React, { useState } from 'react';
import { Shift, Break } from '../types.ts';
import { XMarkIcon } from './icons.tsx';

interface ShiftDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    shift: Shift;
    onSave: (updatedShift: Shift) => void;
}

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const formatTimeForInput = (isoString: string) => {
    try {
        const date = new Date(isoString);
        return isNaN(date.getTime()) ? '' : date.toTimeString().substring(0, 5);
    } catch {
        return '';
    }
};

const updateIsoTime = (isoString: string, timeValue: string) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDate = new Date(isoString);
    newDate.setHours(hours, minutes);
    return newDate.toISOString();
};

const ShiftDetailsModal: React.FC<ShiftDetailsModalProps> = ({ isOpen, onClose, shift, onSave }) => {
    const [localShift, setLocalShift] = useState<Shift>({ ...shift, breaks: shift.breaks ? [...shift.breaks] : [] });

    if (!isOpen) return null;

    const handleAddBreak = () => {
        const newBreak: Break = {
            id: uuidv4(),
            name: 'New Break',
            startTime: new Date(new Date(localShift.startTime).setHours(12, 0, 0, 0)).toISOString(),
            endTime: new Date(new Date(localShift.startTime).setHours(13, 0, 0, 0)).toISOString(),
        };
        setLocalShift(prev => ({ ...prev, breaks: [...(prev.breaks || []), newBreak] }));
    };

    const handleRemoveBreak = (breakId: string) => {
        setLocalShift(prev => ({ ...prev, breaks: prev.breaks?.filter(b => b.id !== breakId) }));
    };

    const handleBreakChange = (breakId: string, field: keyof Break, value: string) => {
        setLocalShift(prev => ({
            ...prev,
            breaks: prev.breaks?.map(b => {
                if (b.id === breakId) {
                    const newValue = (field === 'startTime' || field === 'endTime') ? updateIsoTime(b[field], value) : value;
                    return { ...b, [field]: newValue };
                }
                return b;
            })
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h2 className="text-xl font-bold">Shift Details for {shift.userName}</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">Breaks</h3>
                        <div className="space-y-2">
                            {localShift.breaks?.map(b => (
                                <div key={b.id} className="grid grid-cols-12 gap-2 items-center bg-dark-bg p-2 rounded-md">
                                    <input 
                                        type="text"
                                        value={b.name}
                                        onChange={e => handleBreakChange(b.id, 'name', e.target.value)}
                                        className="col-span-4 bg-dark-border p-1 rounded"
                                    />
                                    <input 
                                        type="time"
                                        value={formatTimeForInput(b.startTime)}
                                        onChange={e => handleBreakChange(b.id, 'startTime', e.target.value)}
                                        className="col-span-3 bg-dark-border p-1 rounded"
                                    />
                                    <span className="col-span-1 text-center">-</span>
                                     <input 
                                        type="time"
                                        value={formatTimeForInput(b.endTime)}
                                        onChange={e => handleBreakChange(b.id, 'endTime', e.target.value)}
                                        className="col-span-3 bg-dark-border p-1 rounded"
                                    />
                                    <button onClick={() => handleRemoveBreak(b.id)} className="col-span-1 text-danger text-center">
                                        <XMarkIcon className="w-5 h-5 mx-auto"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddBreak} className="mt-4 w-full bg-primary/20 text-primary font-semibold py-2 rounded-lg hover:bg-primary/40 transition">
                            + Add Break
                        </button>
                    </div>
                </div>
                <div className="p-4 border-t border-dark-border flex justify-end">
                    <button onClick={() => onSave(localShift)} className="bg-success hover:bg-success/80 text-white font-bold py-2 px-6 rounded-lg transition">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShiftDetailsModal;
