import React, { useState, useMemo } from 'react';
import { Tab, User } from '../types.ts';
import { XMarkIcon } from './icons.tsx';
import { processOrderPayment } from '../utils/transactionProcessor.ts';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    tab: Tab;
    totalAmount: number;
    user: User | null;
}

type PaymentMethod = 'Cash' | 'Card' | 'QR';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, tab, totalAmount, user }) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
    const [cashTendered, setCashTendered] = useState(0);

    const changeDue = useMemo(() => {
        if (paymentMethod !== 'Cash' || cashTendered < totalAmount) {
            return 0;
        }
        return cashTendered - totalAmount;
    }, [cashTendered, totalAmount, paymentMethod]);

    if (!isOpen) return null;
    
    const handleConfirm = () => {
        if (paymentMethod === 'Cash' && cashTendered < totalAmount) {
            alert('Cash tendered is less than the total amount.');
            return;
        }

        const success = processOrderPayment(tab, {
            paymentMethod,
            totalAmount
        });
        
        if (success) {
            onConfirm();
        }
        // If it fails, an alert is shown by the processor, and the modal remains open.
    };
    
    const ReceiptView = () => (
        <div className="bg-dark-bg p-4 rounded-lg font-mono text-xs text-light-text h-full overflow-y-auto hide-scrollbar">
            <div className="text-center mb-2">
                <p className="font-bold">MANAGEMENT PRO</p>
                <p>Official Receipt</p>
                <p>--------------------------</p>
            </div>
            <p>Date: {new Date().toLocaleString()}</p>
            <p>Table: {tab.tableNumber === 0 ? 'Walk-in' : tab.tableNumber}</p>
            <p>Server: {user?.name || 'N/A'}</p>
            <p>--------------------------</p>
            {tab.items.map(item => (
                 <div key={item.id} className="flex justify-between">
                    <span>{item.qty}x {item.name}</span>
                    <span>{(item.price * item.qty).toFixed(2)}</span>
                </div>
            ))}
            <p>--------------------------</p>
            <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>PHP {totalAmount.toFixed(2)}</span>
            </div>
             {paymentMethod === 'Cash' && cashTendered > 0 && (
                <>
                    <p>--------------------------</p>
                    <div className="flex justify-between"><span>CASH</span><span>{cashTendered.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>CHANGE</span><span>{changeDue.toFixed(2)}</span></div>
                </>
            )}
             <p className="mt-4 text-center">Thank you!</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Left Side: Payment Controls */}
                <div className="w-1/2 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Payment</h2>
                        <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-medium-text">Total Due</p>
                        <p className="text-5xl font-bold text-primary">₱{totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-medium-text">Payment Method</label>
                            <div className="grid grid-cols-3 gap-2 mt-1">
                                {(['Cash', 'Card', 'QR'] as PaymentMethod[]).map(method => (
                                    <button 
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`p-3 rounded-lg font-semibold border-2 transition ${paymentMethod === method ? 'bg-primary border-primary' : 'bg-dark-bg border-dark-border hover:border-primary/50'}`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {paymentMethod === 'Cash' && (
                            <div className="space-y-2 animate-fade-in">
                                <label className="text-sm text-medium-text">Cash Tendered</label>
                                <input 
                                    type="number"
                                    value={cashTendered || ''}
                                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                                    placeholder="Enter amount"
                                    className="w-full bg-dark-bg border border-dark-border p-3 rounded-lg text-lg text-center font-mono"
                                />
                                <div className="grid grid-cols-4 gap-2 text-sm">
                                    <button onClick={() => setCashTendered(totalAmount)} className="bg-dark-border p-2 rounded-md hover:bg-dark-border/70">Exact</button>
                                    <button onClick={() => setCashTendered(Math.ceil(totalAmount/50)*50)} className="bg-dark-border p-2 rounded-md hover:bg-dark-border/70">₱{Math.ceil(totalAmount/50)*50}</button>
                                    <button onClick={() => setCashTendered(Math.ceil(totalAmount/100)*100)} className="bg-dark-border p-2 rounded-md hover:bg-dark-border/70">₱{Math.ceil(totalAmount/100)*100}</button>
                                    <button onClick={() => setCashTendered(Math.ceil(totalAmount/500)*500)} className="bg-dark-border p-2 rounded-md hover:bg-dark-border/70">₱{Math.ceil(totalAmount/500)*500}</button>
                                </div>
                                {changeDue > 0 && (
                                    <div className="text-center text-lg mt-2">
                                        <span className="text-medium-text">Change: </span>
                                        <span className="font-bold text-success">₱{changeDue.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-auto pt-6">
                        <button
                            onClick={handleConfirm}
                            disabled={paymentMethod === 'Cash' && cashTendered < totalAmount}
                            className="w-full bg-success hover:bg-success/80 text-white font-bold py-4 rounded-lg text-xl transition disabled:bg-dark-border disabled:cursor-not-allowed"
                        >
                            Confirm Payment
                        </button>
                    </div>

                </div>

                {/* Right Side: Receipt */}
                <div className="w-1/2 p-4 bg-dark-bg/50">
                    <ReceiptView />
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;