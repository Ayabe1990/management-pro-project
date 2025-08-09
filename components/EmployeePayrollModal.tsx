import React, { useState } from 'react';
import { User, Allowance } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { XMarkIcon, PlusCircleIcon } from './icons.tsx';

interface EmployeePayrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit: User;
}

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const ToggleSwitch: React.FC<{ enabled: boolean; setEnabled: (e: boolean) => void }> = ({ enabled, setEnabled }) => (
    <button type="button" onClick={() => setEnabled(!enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-dark-border'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const EmployeePayrollModal: React.FC<EmployeePayrollModalProps> = ({ isOpen, onClose, userToEdit }) => {
    const { updateUser } = useAuth();
    const [basicSalary, setBasicSalary] = useState(userToEdit.basicSalary || 0);
    const [allowances, setAllowances] = useState<Allowance[]>(userToEdit.allowances || []);

    if (!isOpen) return null;

    const handleAllowanceChange = (id: string, field: 'name' | 'amount' | 'enabled', value: string | number | boolean) => {
        setAllowances(current => current.map(allowance => {
            if (allowance.id === id) {
                return { ...allowance, [field]: value };
            }
            return allowance;
        }));
    };

    const handleAddAllowance = () => {
        const newAllowance: Allowance = {
            id: uuidv4(),
            name: 'New Allowance',
            amount: 0,
            enabled: true,
        };
        setAllowances(current => [...current, newAllowance]);
    };

    const handleRemoveAllowance = (id: string) => {
        setAllowances(current => current.filter(a => a.id !== id));
    };

    const handleSave = () => {
        updateUser(userToEdit.id, {
            basicSalary,
            allowances,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h2 className="text-xl font-bold">Manage Payroll for <span className="text-primary">{userToEdit.name}</span></h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="text-sm font-semibold text-medium-text mb-2 block">Basic Salary (Monthly)</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-medium-text">₱</span>
                           <input 
                                type="number"
                                value={basicSalary}
                                onChange={e => setBasicSalary(parseFloat(e.target.value) || 0)}
                                className="w-full bg-dark-bg border-dark-border border p-2 pl-7 rounded-md"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                           <label className="text-sm font-semibold text-medium-text">Allowances</label>
                           <button onClick={handleAddAllowance} className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover">
                               <PlusCircleIcon className="w-4 h-4"/>
                               Add Allowance
                           </button>
                        </div>
                        <div className="space-y-2">
                           {allowances.map(allowance => (
                               <div key={allowance.id} className="grid grid-cols-12 gap-x-3 items-center p-2 bg-dark-bg/50 rounded-md">
                                   <div className="col-span-5">
                                       <input 
                                            type="text"
                                            value={allowance.name}
                                            onChange={e => handleAllowanceChange(allowance.id, 'name', e.target.value)}
                                            className="w-full bg-dark-border p-1 rounded-md text-sm"
                                            placeholder="Allowance Name"
                                        />
                                   </div>
                                    <div className="col-span-4">
                                         <input 
                                            type="number"
                                            value={allowance.amount}
                                            onChange={e => handleAllowanceChange(allowance.id, 'amount', parseFloat(e.target.value) || 0)}
                                            className="w-full bg-dark-border p-1 rounded-md text-sm"
                                            placeholder="Amount"
                                        />
                                   </div>
                                   <div className="col-span-2 flex justify-center">
                                       <ToggleSwitch enabled={allowance.enabled} setEnabled={(val) => handleAllowanceChange(allowance.id, 'enabled', val)} />
                                   </div>
                                   <div className="col-span-1 text-right">
                                       <button onClick={() => handleRemoveAllowance(allowance.id)} className="text-danger/70 hover:text-danger">
                                            <XMarkIcon className="w-5 h-5"/>
                                       </button>
                                   </div>
                               </div>
                           ))}
                           {allowances.length === 0 && <p className="text-center text-sm text-medium-text py-4">No allowances configured.</p>}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-dark-border flex justify-end gap-4">
                    <button onClick={onClose} className="bg-medium-text/30 hover:bg-medium-text/50 text-white font-bold py-2 px-6 rounded-lg transition">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="bg-success hover:bg-success/80 text-white font-bold py-2 px-6 rounded-lg transition">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeePayrollModal;