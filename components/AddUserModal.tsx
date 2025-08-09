import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserRole } from '../types.ts';
import { XMarkIcon } from './icons.tsx';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
    const { adminRegisterUser } = useAuth();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Waiter);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');

    const operationalRoles = [UserRole.Waiter, UserRole.Bartender, UserRole.Kitchen, UserRole.Security];

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (pin !== confirmPin) {
            setError('PINs do not match.');
            return;
        }
        if (pin.length !== 4) {
            setError('PIN must be 4 digits.');
            return;
        }

        const newUser = adminRegisterUser({
            name,
            username,
            role,
            pin,
        });

        if (newUser) {
            alert(`User ${name} created successfully.`);
            onClose();
        } else {
            setError('Failed to create user. Username or email might already exist.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h2 className="text-xl font-bold">Add New User</h2>
                    <button type="button" onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="text-sm text-medium-text">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1" required />
                    </div>
                    <div>
                        <label className="text-sm text-medium-text">Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1" required />
                    </div>
                    <div>
                        <label className="text-sm text-medium-text">Role</label>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1">
                            {operationalRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-medium-text">4-Digit PIN</label>
                            <input type="password" value={pin} maxLength={4} onChange={e => setPin(e.target.value.replace(/\D/g,''))} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1 tracking-[1em]" required />
                        </div>
                        <div>
                            <label className="text-sm text-medium-text">Confirm PIN</label>
                            <input type="password" value={confirmPin} maxLength={4} onChange={e => setConfirmPin(e.target.value.replace(/\D/g,''))} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1 tracking-[1em]" required />
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

export default AddUserModal;