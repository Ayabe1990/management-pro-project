import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserRole, Department, User } from '../types.ts';
import { XMarkIcon } from './icons.tsx';

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose }) => {
    const { adminRegisterUser } = useAuth();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Waiter);
    const [department, setDepartment] = useState<Department>('General');
    const [pin, setPin] = useState('');
    const [basicSalary, setBasicSalary] = useState(0);
    const [error, setError] = useState('');

    const allRoles = Object.values(UserRole).filter(r => r !== UserRole.SuperDeveloper);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (pin.length !== 4) {
            setError('PIN must be 4 digits.');
            return;
        }

        const payload: Partial<User> = {
            name,
            username,
            role,
            department,
            pin,
            basicSalary,
            email: `${username.toLowerCase()}@managementpro.app`
        };

        const newUser = adminRegisterUser(payload);

        if (newUser) {
            alert(`User ${name} created successfully.`);
            onClose();
        } else {
            setError('Failed to create user. Username or email might already exist.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h2 className="text-xl font-bold">Add New Staff Member</h2>
                    <button type="button" onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-medium-text">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1" required />
                        </div>
                         <div>
                            <label className="text-sm text-medium-text">Username</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1" required />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-medium-text">Role</label>
                            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1">
                                {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-sm text-medium-text">Department</label>
                            <select value={department} onChange={e => setDepartment(e.target.value as Department)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1">
                                <option value="General">General</option>
                                <option value="Kitchen">Kitchen</option>
                                <option value="Bar">Bar</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-medium-text">4-Digit Login PIN</label>
                            <input type="password" value={pin} maxLength={4} onChange={e => setPin(e.target.value.replace(/\D/g,''))} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1 tracking-[1em]" required />
                        </div>
                        <div>
                           <label className="text-sm text-medium-text">Basic Salary (Monthly)</label>
                           <input type="number" value={basicSalary} onChange={e => setBasicSalary(parseFloat(e.target.value) || 0)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1" />
                        </div>
                    </div>
                    {error && <p className="text-danger text-sm text-center">{error}</p>}
                </div>
                <div className="p-4 border-t border-dark-border text-right">
                    <button type="submit" className="bg-success hover:bg-success/80 text-white font-bold py-2 px-6 rounded-lg transition">Create User</button>
                </div>
            </form>
        </div>
    );
};

export default AddStaffModal;
