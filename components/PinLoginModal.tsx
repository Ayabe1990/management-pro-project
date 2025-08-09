import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { User } from '../types.ts';
import { XMarkIcon } from './icons.tsx';

interface PinLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

const PinKey: React.FC<{ value: string; onClick: (v: string) => void; }> = ({ value, onClick }) => (
    <button onClick={() => onClick(value)} className="bg-dark-bg hover:bg-dark-border rounded-lg text-2xl font-semibold transition-colors aspect-square flex items-center justify-center">
        {value}
    </button>
);

const PinLoginModal: React.FC<PinLoginModalProps> = ({ isOpen, onClose, user }) => {
    const { loginWithPin } = useAuth();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleKeyClick = (value: string) => {
        if (success) return;
        setError('');
        if (value === 'del') {
            setPin(p => p.slice(0, -1));
        } else if (pin.length < 4) {
            setPin(p => p + value);
        }
    };
    
    useEffect(() => {
        const attemptLogin = async () => {
            if (pin.length === 4) {
                const loginSuccess = loginWithPin(pin);
                if (loginSuccess) {
                    setSuccess(true);
                    setError('');
                    setTimeout(() => {
                        onClose();
                    }, 500);
                } else {
                    setError('Invalid PIN');
                    setTimeout(() => {
                         setPin('');
                         setError('');
                    }, 1000)
                }
            }
        };
        attemptLogin();
    }, [pin, loginWithPin, onClose]);
    
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isOpen) return;
            if (!isNaN(parseInt(event.key, 10))) {
                handleKeyClick(event.key);
            } else if (event.key === 'Backspace') {
                handleKeyClick('del');
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-xs p-6 text-center animate-fade-in" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Enter PIN for {user.name}</h2>
                    <button onClick={onClose} className="text-medium-text hover:text-white"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="flex justify-center items-center gap-4 mb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 transition-all ${error ? 'border-danger animate-shake' : success ? 'bg-success border-success' : pin.length > i ? 'bg-primary border-primary' : 'border-dark-border'}`}></div>
                    ))}
                </div>

                <div className="h-5 mb-4">
                    {error && <p className="text-danger text-sm animate-pulse">{error}</p>}
                    {success && <p className="text-success text-sm">Success! Logging in...</p>}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                    <PinKey value="1" onClick={handleKeyClick} />
                    <PinKey value="2" onClick={handleKeyClick} />
                    <PinKey value="3" onClick={handleKeyClick} />
                    <PinKey value="4" onClick={handleKeyClick} />
                    <PinKey value="5" onClick={handleKeyClick} />
                    <PinKey value="6" onClick={handleKeyClick} />
                    <PinKey value="7" onClick={handleKeyClick} />
                    <PinKey value="8" onClick={handleKeyClick} />
                    <PinKey value="9" onClick={handleKeyClick} />
                    <div />
                    <PinKey value="0" onClick={handleKeyClick} />
                    <button onClick={() => handleKeyClick('del')} className="bg-dark-bg hover:bg-dark-border rounded-lg text-lg font-semibold transition-colors flex items-center justify-center">DEL</button>
                </div>
            </div>
        </div>
    );
};

export default PinLoginModal;