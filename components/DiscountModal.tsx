import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { XMarkIcon } from './icons.tsx';
import { logActivity } from '../utils/activityLogger.ts';

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyDiscount: (discount: { type: 'percent' | 'fixed'; value: number; amount: number; authorizedBy: string; }) => void;
    currentTotal: number;
}

const PinKey: React.FC<{ value: string; onClick: (v: string) => void; }> = ({ value, onClick }) => (
    <button type="button" onClick={() => onClick(value)} className="bg-dark-bg hover:bg-dark-border rounded-lg text-2xl font-semibold transition-colors aspect-square flex items-center justify-center">
        {value}
    </button>
);

const DiscountModal: React.FC<DiscountModalProps> = ({ isOpen, onClose, onApplyDiscount, currentTotal }) => {
    const { users } = useAuth();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authorizingManager, setAuthorizingManager] = useState<User | null>(null);

    const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
    const [discountValue, setDiscountValue] = useState(0);
    
    if (!isOpen) return null;

    const handlePinAttempt = () => {
        const manager = users.find(u => u.pin === pin && (u.role === UserRole.Manager || u.role === UserRole.Owner));
        if (manager) {
            setAuthorizingManager(manager);
            setIsAuthorized(true);
            setError('');
        } else {
            setError('Invalid Manager/Owner PIN');
            setPin('');
            setTimeout(() => setError(''), 1500);
        }
    };

    const handleKeyClick = (value: string) => {
        setError('');
        if (value === 'del') {
            setPin(p => p.slice(0, -1));
        } else if (pin.length < 4) {
            const newPin = pin + value;
            setPin(newPin);
            if (newPin.length === 4) {
                // Automatically attempt login when PIN is 4 digits
                const manager = users.find(u => u.pin === newPin && (u.role === UserRole.Manager || u.role === UserRole.Owner));
                if (manager) {
                    setAuthorizingManager(manager);
                    setIsAuthorized(true);
                    setError('');
                } else {
                    setError('Invalid Manager/Owner PIN');
                    setTimeout(() => {
                         setPin('');
                         setError('');
                    }, 1000)
                }
            }
        }
    };
    
    const calculatedDiscountAmount = useMemo(() => {
        if (discountType === 'percent') {
            return (currentTotal * discountValue) / 100;
        }
        return Math.min(currentTotal, discountValue); // Cannot discount more than the total
    }, [discountType, discountValue, currentTotal]);

    const handleApplyClick = () => {
        if (!authorizingManager) return;
        const discountAmount = calculatedDiscountAmount;
        if (discountAmount <= 0) {
            alert("Please enter a valid discount amount.");
            return;
        }

        const discountInfo = {
            type: discountType,
            value: discountValue,
            amount: discountAmount,
            authorizedBy: authorizingManager.id
        };
        
        onApplyDiscount(discountInfo);
        
        logActivity(`Applied a ${discountType === 'percent' ? `${discountValue}%` : `₱${discountValue}`} discount (₱${discountAmount.toFixed(2)})`, authorizingManager);
        
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.push({
            id: `notif-${Date.now()}`, userId: authorizingManager.id,
            message: `You successfully authorized a discount of ₱${discountAmount.toFixed(2)}.`,
            timestamp: new Date().toISOString(), isRead: false,
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));
        document.dispatchEvent(new CustomEvent('notifications_updated'));

        onClose();
    };


    const AuthView = () => (
        <>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manager Authorization</h2>
                <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
            </div>
             <p className="text-sm text-medium-text text-center mb-4">A Manager or Owner PIN is required to apply a discount.</p>
             <div className="flex justify-center items-center gap-4 mb-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full border-2 transition-all ${error ? 'border-danger animate-shake' : pin.length > i ? 'bg-primary border-primary' : 'border-dark-border'}`}></div>
                ))}
            </div>
            <div className="h-5 mb-4 text-center text-danger text-sm">{error}</div>
             <div className="grid grid-cols-3 gap-3">
                <PinKey value="1" onClick={handleKeyClick} /><PinKey value="2" onClick={handleKeyClick} /><PinKey value="3" onClick={handleKeyClick} />
                <PinKey value="4" onClick={handleKeyClick} /><PinKey value="5" onClick={handleKeyClick} /><PinKey value="6" onClick={handleKeyClick} />
                <PinKey value="7" onClick={handleKeyClick} /><PinKey value="8" onClick={handleKeyClick} /><PinKey value="9" onClick={handleKeyClick} />
                <div /><PinKey value="0" onClick={handleKeyClick} />
                <button type="button" onClick={() => handleKeyClick('del')} className="bg-dark-bg hover:bg-dark-border rounded-lg text-lg font-semibold flex items-center justify-center">DEL</button>
            </div>
        </>
    );

    const DiscountView = () => (
         <>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Apply Discount</h2>
                <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
            </div>
            <p className="text-xs text-center text-success mb-4">Authorized by: {authorizingManager?.name}</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
                 <button onClick={() => setDiscountType('percent')} className={`p-3 rounded-lg font-semibold border-2 transition ${discountType === 'percent' ? 'bg-primary border-primary' : 'bg-dark-bg border-dark-border'}`}>Percentage (%)</button>
                 <button onClick={() => setDiscountType('fixed')} className={`p-3 rounded-lg font-semibold border-2 transition ${discountType === 'fixed' ? 'bg-primary border-primary' : 'bg-dark-bg border-dark-border'}`}>Fixed Amount (₱)</button>
            </div>
            
            <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-medium-text">{discountType === 'percent' ? '%' : '₱'}</span>
                <input
                    type="number"
                    value={discountValue || ''}
                    onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-dark-bg border border-dark-border p-3 pl-8 rounded-lg text-lg text-center font-mono"
                    placeholder="0"
                />
            </div>
             <div className="p-4 bg-dark-bg rounded-lg text-center">
                <p className="text-medium-text">Original Total: <span className="font-mono">₱{currentTotal.toFixed(2)}</span></p>
                <p className="text-medium-text">Discount: <span className="font-mono text-danger">- ₱{calculatedDiscountAmount.toFixed(2)}</span></p>
                <p className="text-lg font-bold text-success mt-2">New Total: <span className="font-mono">₱{(currentTotal - calculatedDiscountAmount).toFixed(2)}</span></p>
            </div>

            <button onClick={handleApplyClick} className="w-full bg-success hover:bg-success/80 text-white font-bold py-3 mt-6 rounded-lg transition">Apply Discount</button>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                {isAuthorized ? <DiscountView /> : <AuthView />}
            </div>
        </div>
    );
};

export default DiscountModal;
