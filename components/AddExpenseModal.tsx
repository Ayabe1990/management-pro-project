import React, { useState } from 'react';
import { Biller, Expense, Department } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { XMarkIcon } from './icons.tsx';
import { logActivity } from '../utils/activityLogger.ts';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    billers: Biller[];
}

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, billers }) => {
    const { user } = useAuth();
    const [billerId, setBillerId] = useState('');
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [department, setDepartment] = useState<Department>('General');

    if (!isOpen) return null;

    const handleSave = () => {
        const selectedBiller = billers.find(b => b.id === billerId);
        if (!user || !selectedBiller || amount <= 0) {
            alert("Please fill all fields correctly.");
            return;
        }

        const newExpense: Expense = {
            id: `exp-${uuidv4()}`,
            date: new Date(date).toISOString(),
            billerId,
            billerName: selectedBiller.name,
            category: selectedBiller.category,
            description,
            amount,
            loggedBy: user.id,
            department,
        };
        
        const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        localStorage.setItem('expenses', JSON.stringify([newExpense, ...allExpenses]));
        
        logActivity(`Logged new expense for ${newExpense.billerName}: ₱${newExpense.amount.toFixed(2)}`, user);
        
        document.dispatchEvent(new CustomEvent('finance_updated'));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border"><h2 className="text-xl font-bold">Log New Expense</h2><button onClick={onClose}><XMarkIcon /></button></div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <select value={billerId} onChange={e => setBillerId(e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border"><option value="">-- Select Biller --</option>{billers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} placeholder="Amount" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                         <select value={department} onChange={e => setDepartment(e.target.value as Department)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border">
                            <option value="General">General</option>
                            <option value="Bar">Bar</option>
                            <option value="Kitchen">Kitchen</option>
                         </select>
                    </div>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (e.g., May electricity bill)" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                </div>
                <div className="p-4 border-t border-dark-border flex justify-end"><button onClick={handleSave} className="bg-success font-bold py-2 px-6 rounded-lg">Save Expense</button></div>
            </div>
        </div>
    );
};

export default AddExpenseModal;