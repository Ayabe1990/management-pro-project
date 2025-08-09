import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { User, UserRole } from '../types.ts';
import Login from './Login.tsx';
import PinLoginModal from '../components/PinLoginModal.tsx';
import AdminAuthModal from '../components/AdminAuthModal.tsx';
import AddUserModal from '../components/AddUserModal.tsx';
import { UserCircleIcon } from '../components/icons.tsx';
import NeonStatusIcon from '../components/NeonStatusIcon.tsx';

const MultiUserLobby: React.FC = () => {
    const { users, removeUser } = useAuth();
    const [view, setView] = useState<'lobby' | 'manager_login'>('lobby');

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    
    const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [userToRemove, setUserToRemove] = useState<User | null>(null);
    const [businessStatus, setBusinessStatus] = useState<'Open' | 'Closed'>('Closed');

    useEffect(() => {
        const storedSettings = localStorage.getItem('app_settings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            setBusinessStatus(parsed.businessStatus || 'Closed');
        }
    }, []);

    const operationalStaff = useMemo(() => {
        const roles = [UserRole.Waiter, UserRole.Bartender, UserRole.Kitchen, UserRole.Security];
        return users.filter(u => roles.includes(u.role));
    }, [users]);
    
    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setIsPinModalOpen(true);
    };
    
    const handleRemoveClick = (user: User) => {
        if(window.confirm(`Are you sure you want to remove ${user.name}? This action cannot be undone.`)) {
            removeUser(user.id);
        }
    };

    const onAdminLoginSuccess = () => {
        setIsAdminAuthOpen(false);
        setIsAdminMode(true);
    };
    
    const onAddUserClick = () => {
        if (isAdminMode) {
            setIsAddUserOpen(true);
        } else {
            setIsAdminAuthOpen(true);
        }
    };

    if (view === 'manager_login') {
        return <Login />;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-dark-bg/50">
            <h1 className="text-5xl font-bold font-display text-white mb-2">Welcome</h1>
             <div className="flex items-center gap-2 mb-4">
                <p className="text-medium-text">Status:</p>
                <NeonStatusIcon status={businessStatus} />
            </div>
            <p className="text-medium-text mb-8">Please select your profile to log in.</p>
            
            <div className="w-full max-w-4xl flex-grow overflow-y-auto hide-scrollbar p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {operationalStaff.map(user => (
                        <div key={user.id} className="relative">
                            <button 
                                onClick={() => handleUserClick(user)}
                                className="w-full aspect-square bg-dark-card border border-dark-border rounded-2xl flex flex-col items-center justify-center gap-3 p-4 hover:bg-primary/20 hover:border-primary transition-all text-center"
                            >
                                <UserCircleIcon className="w-16 h-16 text-medium-text" />
                                <div className="flex flex-col">
                                  <span className="font-semibold text-light-text">{user.name}</span>
                                  <span className="text-xs text-accent font-mono">{user.role}</span>
                                </div>
                            </button>
                            {isAdminMode && (
                                <button 
                                    onClick={() => handleRemoveClick(user)}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-danger rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                     <button 
                        onClick={onAddUserClick}
                        className="w-full aspect-square bg-transparent border-2 border-dashed border-dark-border rounded-2xl flex flex-col items-center justify-center gap-3 p-4 text-medium-text hover:bg-dark-card hover:text-white transition-all"
                    >
                        <span className="text-4xl">+</span>
                        <span className="font-semibold">Add New User</span>
                    </button>
                </div>
            </div>

            <div className="py-4 flex-shrink-0 flex items-center gap-6">
                <button onClick={() => setView('manager_login')} className="bg-dark-card hover:bg-dark-border text-white font-bold py-3 px-6 rounded-lg transition">
                    Manager/Owner Login
                </button>
                {isAdminMode ? (
                    <button onClick={() => setIsAdminMode(false)} className="bg-danger hover:bg-danger/80 text-white font-bold py-3 px-6 rounded-lg transition">
                        Exit Admin Mode
                    </button>
                ) : (
                    <button onClick={() => setIsAdminAuthOpen(true)} className="bg-warning hover:bg-warning/80 text-black font-bold py-3 px-6 rounded-lg transition">
                        Manage Users
                    </button>
                )}
            </div>

            {isPinModalOpen && selectedUser && (
                <PinLoginModal 
                    isOpen={isPinModalOpen} 
                    onClose={() => setIsPinModalOpen(false)} 
                    user={selectedUser} 
                />
            )}
            
            {isAdminAuthOpen && (
                <AdminAuthModal 
                    isOpen={isAdminAuthOpen}
                    onClose={() => setIsAdminAuthOpen(false)}
                    onSuccess={onAdminLoginSuccess}
                />
            )}

            {isAddUserOpen && (
                 <AddUserModal
                    isOpen={isAddUserOpen}
                    onClose={() => setIsAddUserOpen(false)}
                 />
            )}
        </div>
    );
};

export default MultiUserLobby;