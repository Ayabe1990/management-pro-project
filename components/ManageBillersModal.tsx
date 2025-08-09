import React, { useState, useEffect } from 'react';
import { Biller } from '../types.ts';
import { XMarkIcon } from './icons.tsx';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

interface ManageBillersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ManageBillersModal: React.FC<ManageBillersModalProps> = ({ isOpen, onClose }) => {
    const [billers, setBillers] = useState<Biller[]>([]);
    const [newBillerName, setNewBillerName] = useState('');
    const [newBillerCategory, setNewBillerCategory] = useState<Biller['category']>('Other');
    
    useEffect(() => {
        if(isOpen) {
            setBillers(JSON.parse(localStorage.getItem('billers') || '[]'));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddBiller = () => {
        if (!newBillerName) return;
        const newBiller: Biller = { id: `biller-${uuidv4()}`, name: newBillerName, category: newBillerCategory };
        const updatedBillers = [...billers, newBiller];
        setBillers(updatedBillers);
        localStorage.setItem('billers', JSON.stringify(updatedBillers));
        setNewBillerName('');
    };

    const handleRemoveBiller = (id: string) => {
        const updatedBillers = billers.filter(b => b.id !== id);
        setBillers(updatedBillers);
        localStorage.setItem('billers', JSON.stringify(updatedBillers));
    };

    const handleClose = () => {
        document.dispatchEvent(new CustomEvent('finance_updated'));
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border"><h2 className="text-xl font-bold">Manage Billers & Suppliers</h2><button onClick={handleClose}><XMarkIcon /></button></div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {billers.map(biller => (
                        <div key={biller.id} className="flex justify-between items-center bg-dark-bg p-2 rounded-md">
                            <p>{biller.name} <span className="text-xs text-medium-text">({biller.category})</span></p>
                            <button onClick={() => handleRemoveBiller(biller.id)} className="text-danger"><XMarkIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-dark-border space-y-2">
                    <h3 className="text-lg font-semibold">Add New Biller</h3>
                    <div className="flex gap-2">
                        <input type="text" value={newBillerName} onChange={e => setNewBillerName(e.target.value)} placeholder="Biller Name" className="flex-grow bg-dark-bg p-2 rounded-md border border-dark-border" />
                        <select value={newBillerCategory} onChange={e => setNewBillerCategory(e.target.value as Biller['category'])} className="bg-dark-bg p-2 rounded-md border border-dark-border">
                            <option>Utilities</option><option>Rent</option><option>Supplier</option><option>Government</option><option>Salaries</option><option>Other</option>
                        </select>
                        <button onClick={handleAddBiller} className="bg-success text-white font-bold px-4 rounded-md">Add</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageBillersModal;
