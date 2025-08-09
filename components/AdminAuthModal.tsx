import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { XMarkIcon } from './icons.tsx';
import { UserRole } from '../types.ts';

interface AdminAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { login, users } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const userToLogin = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!userToLogin || (userToLogin.role !== UserRole.Manager && userToLogin.role !== UserRole.Owner && userToLogin.role !== UserRole.Developer)) {
            setError('Access denied. Not a manager or owner account.');
            return;
        }

        const success = login(email, password);
        if (success) {
            onSuccess();
        } else {
            setError('Invalid credentials.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Admin Authentication</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <p className="text-sm text-medium-text mb-6">Enter Manager or Owner credentials to proceed.</p>
                <form onSubmit={handleAdminLogin}>
                    <div className="mb-4">
                        <label className="block text-medium-text text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 text-white"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-medium-text text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 text-white"
                            required
                        />
                    </div>
                    {error && <p className="text-danger text-xs text-center mb-4">{error}</p>}
                    <button type="submit" className="w-full bg-success hover:bg-success/80 text-white font-bold py-3 px-4 rounded-lg transition">
                        Authorize
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminAuthModal;