
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MasterInventoryItem, WastageLog, Department } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { UserRole } from '../../types.ts';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const WastageLogPage: React.FC = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState<'Spoilage' | 'Trimming' | 'Cooking Error' | 'Expired' | 'Spillage' | 'Breakage'>('Spoilage');

    const userDepartment = useMemo((): Department | 'All' => {
        if (user?.role === UserRole.Kitchen) return 'Kitchen';
        if (user?.role === UserRole.Bartender) return 'Bar';
        if (user?.role === UserRole.Manager || user?.role === UserRole.Owner) return 'All';
        return 'General';
    }, [user]);

    const loadInventory = useCallback(() => {
        const data = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        if (userDepartment === 'All') {
            setInventory(data);
        } else {
            setInventory(data.filter(item => item.department === userDepartment || item.department === 'General'));
        }
    }, [userDepartment]);

    useEffect(() => {
        loadInventory();
        document.addEventListener('data_updated', loadInventory);
        return () => document.removeEventListener('data_updated', loadInventory);
    }, [loadInventory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedItemId || quantity <= 0) {
            alert('Please select an item and enter a valid quantity.');
            return;
        }

        const currentInventory = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        const itemIndex = currentInventory.findIndex(i => i.id === selectedItemId);

        if (itemIndex === -1) {
            alert('Selected item not found in inventory.');
            return;
        }
        
        const item = currentInventory[itemIndex];
        if (item.stock < quantity) {
            alert(`Cannot log wastage. Insufficient stock for ${item.name}. Available: ${item.stock}`);
            return;
        }

        // 1. Deplete stock
        currentInventory[itemIndex].stock -= quantity;
        localStorage.setItem('inventory', JSON.stringify(currentInventory));
        document.dispatchEvent(new CustomEvent('data_updated'));

        // 2. Create log
        const wasteCost = (item.costPerUnit || 0) * quantity;
        const newLog: WastageLog = {
            id: `waste-${uuidv4()}`,
            date: new Date().toISOString(),
            itemId: item.id,
            quantity,
            reason,
            cost: wasteCost,
            loggedBy: user.id,
        };
        const allLogs = JSON.parse(localStorage.getItem('waste_logs') || '[]') as WastageLog[];
        localStorage.setItem('waste_logs', JSON.stringify([newLog, ...allLogs]));

        alert(`Wastage for ${quantity}x ${item.name} logged successfully.`);
        setSelectedItemId('');
        setQuantity(1);
        setReason('Spoilage');
        loadInventory();
    };

    return (
        <div className="h-full">
            <h2 className="text-3xl font-bold font-display mb-6">Log Wastage</h2>
            <div className="max-w-2xl mx-auto bg-dark-card border border-dark-border rounded-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm text-medium-text mb-2 block">Item to Log</label>
                        <select
                            value={selectedItemId}
                            onChange={e => setSelectedItemId(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-3"
                            required
                        >
                            <option value="" disabled>-- Select an inventory item --</option>
                            {inventory.map(item => <option key={item.id} value={item.id}>{item.name} ({item.stock} {item.unitType})</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm text-medium-text mb-2 block">Quantity Wasted</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
                            min="0.01"
                            step="any"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-3"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-medium-text mb-2 block">Reason for Wastage</label>
                         <select
                            value={reason}
                            onChange={e => setReason(e.target.value as any)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-3"
                            required
                        >
                            <option value="Spoilage">Spoilage</option>
                            <option value="Trimming">Trimming</option>
                            <option value="Cooking Error">Cooking Error</option>
                            <option value="Expired">Expired</option>
                            <option value="Spillage">Spillage</option>
                            <option value="Breakage">Breakage</option>
                        </select>
                    </div>
                     <button
                        type="submit"
                        className="w-full bg-danger hover:bg-danger/80 text-white font-bold py-3 rounded-lg transition"
                    >
                        Confirm and Log Wastage
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WastageLogPage;