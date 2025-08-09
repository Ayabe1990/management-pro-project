import React, { useState, useEffect, useCallback } from 'react';
import { Tab, OrderItem, MasterInventoryItem } from '../../types.ts';

const KitchenDisplayPage: React.FC = () => {
    const [kitchenItems, setKitchenItems] = useState<(OrderItem & {tableNumber: number})[]>([]);

    const loadOrders = useCallback(() => {
        const allTabs = JSON.parse(localStorage.getItem('tabs_data') || '{}') as Record<string, Tab>;
        const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        
        const itemsForKitchen: (OrderItem & {tableNumber: number})[] = [];
        Object.values(allTabs).forEach(tab => {
            tab.items.forEach(item => {
                const invItem = allInventory.find(i => i.id === item.menuItemId);
                if (invItem?.department === 'Kitchen' && item.status !== 'Served' && item.status !== 'Cancelled') {
                    itemsForKitchen.push({ ...item, tableNumber: tab.tableNumber });
                }
            });
        });
        setKitchenItems(itemsForKitchen.sort((a, b) => new Date(a.id.split('-')[1]).getTime() - new Date(b.id.split('-')[1]).getTime()));
    }, []);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [loadOrders]);

    return (
        <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display">Kitchen Display Screen</h2>
            <div className="flex-grow bg-dark-bg border border-dark-border rounded-2xl p-4 overflow-x-auto">
                <div className="flex gap-4 h-full min-w-max">
                    {kitchenItems.map(item => (
                        <div key={item.id} className="w-80 bg-dark-card rounded-lg p-4 flex-shrink-0 h-full flex flex-col border-t-4 border-primary">
                            <h3 className="text-lg font-bold">Table {item.tableNumber}</h3>
                            <div className="flex-grow my-2 border-y border-dark-border py-2">
                                <p className="text-xl font-semibold">{item.qty}x {item.name}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-1/2 bg-warning text-black font-bold py-2 rounded-md">Preparing</button>
                                <button className="w-1/2 bg-success text-white font-bold py-2 rounded-md">Ready</button>
                            </div>
                        </div>
                    ))}
                    {kitchenItems.length === 0 && <p className="text-medium-text text-center w-full self-center">No active kitchen orders.</p>}
                </div>
            </div>
        </div>
    );
};

export default KitchenDisplayPage;