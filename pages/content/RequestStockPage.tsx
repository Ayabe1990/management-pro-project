

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MasterInventoryItem, StockRequest, Department } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { UserRole } from '../../types.ts';
import { XMarkIcon } from '../../components/icons.tsx';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const RequestStockPage: React.FC = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
    const [requestItems, setRequestItems] = useState<Record<string, { name: string; quantity: number }>>({});
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [inventory, searchTerm]);

    const handleAddItem = (item: MasterInventoryItem, quantity: number) => {
        if (quantity <= 0) {
             handleRemoveItem(item.id);
             return;
        }
        setRequestItems(prev => ({
            ...prev,
            [item.id]: { name: item.name, quantity }
        }));
    };

    const handleRemoveItem = (itemId: string) => {
        setRequestItems(prev => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
        });
    };
    
    const handleSubmit = () => {
        if (!user || Object.keys(requestItems).length === 0) return;

        const newRequest: StockRequest = {
            id: `req-${uuidv4()}`,
            requestedBy: user.id,
            department: userDepartment as Department,
            date: new Date().toISOString(),
            status: 'Pending',
            items: Object.entries(requestItems).map(([itemId, { quantity }]) => ({ itemId, quantity }))
        };

        const allRequests = JSON.parse(localStorage.getItem('stock_requests') || '[]') as StockRequest[];
        localStorage.setItem('stock_requests', JSON.stringify([newRequest, ...allRequests]));
        alert('Stock request submitted for approval!');
        setRequestItems({});
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold font-display">Request Stock</h2>
                <button
                    onClick={handleSubmit}
                    disabled={Object.keys(requestItems).length === 0}
                    className="bg-success text-white font-bold py-2 px-6 rounded-lg transition disabled:bg-dark-border"
                >
                    Submit Request ({Object.keys(requestItems).length})
                </button>
            </div>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Left Panel: Inventory List */}
                <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-4 flex flex-col">
                    <input
                        type="text"
                        placeholder="Search for an item..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border p-2 rounded-lg mb-4 flex-shrink-0"
                    />
                    <div className="overflow-auto hide-scrollbar flex-grow">
                        <table className="w-full text-left min-w-[500px]">
                           <thead className="sticky top-0 bg-dark-card">
                                <tr className="border-b border-dark-border">
                                    <th className="p-3">Item Name</th>
                                    <th className="p-3 text-right">Current Stock</th>
                                    <th className="p-3 text-center">Request Qty</th>
                                </tr>
                           </thead>
                           <tbody className="divide-y divide-dark-border">
                                {filteredInventory.map(item => {
                                    const isLowStock = item.stock <= item.reorderLevel;
                                    const isInRequest = !!requestItems[item.id];
                                    return (
                                        <tr key={item.id} className={isInRequest ? 'bg-primary/20' : ''}>
                                            <td className={`p-3 font-semibold ${isLowStock ? 'text-danger' : ''}`}>
                                                {item.name} {isLowStock && '(Low Stock)'}
                                            </td>
                                            <td className="p-3 text-right font-mono">{item.stock} {item.unitType}</td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    defaultValue={requestItems[item.id]?.quantity || ""}
                                                    onBlur={(e) => handleAddItem(item, parseInt(e.target.value))}
                                                    className="w-24 bg-dark-bg border border-dark-border p-1 rounded-md text-center"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                           </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel: Request Summary */}
                <div className="lg:col-span-1 bg-dark-card border border-dark-border rounded-2xl p-4 flex flex-col">
                    <h3 className="text-xl font-bold mb-4 text-primary border-b border-dark-border pb-2 flex-shrink-0">Request Summary</h3>
                    <div className="overflow-y-auto hide-scrollbar flex-grow space-y-2">
                         {Object.keys(requestItems).length === 0 ? (
                            <p className="text-medium-text text-center pt-10">Add items from the list to start a request.</p>
                         ) : (
                            Object.entries(requestItems).map(([id, { name, quantity }]) => (
                                <div key={id} className="flex justify-between items-center bg-dark-bg p-2 rounded-md">
                                    <div>
                                        <p className="font-semibold">{name}</p>
                                        <p className="text-sm text-primary">Requesting: {quantity}</p>
                                    </div>
                                    <button onClick={() => handleRemoveItem(id)} className="text-danger hover:text-danger/80">
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestStockPage;