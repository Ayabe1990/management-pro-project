import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tab, OrderItem, OrderItemStatus } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

const OrderItemView: React.FC<{ item: OrderItem }> = ({ item }) => {
    const statusClasses: Record<OrderItemStatus, string> = {
        New: 'bg-medium-text/20 text-medium-text',
        Preparing: 'bg-warning/20 text-warning animate-pulse',
        Ready: 'bg-success/20 text-success ring-2 ring-success animate-pulse',
        Served: 'bg-primary/20 text-primary opacity-60',
        Cancelled: 'bg-danger/20 text-danger line-through',
    };
    
    const isReady = item.status === 'Ready';

    return (
        <div className={`flex justify-between items-center p-2 rounded-md ${statusClasses[item.status]}`}>
            <span className="font-semibold">{item.qty}x {item.name}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${isReady ? 'bg-success text-white' : 'bg-transparent'}`}>{item.status}</span>
        </div>
    )
};


const WaiterDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [myTabs, setMyTabs] = useState<Tab[]>([]);

    const loadTabs = useCallback(() => {
        if (!user) return;
        const allTabs = Object.values(JSON.parse(localStorage.getItem('tabs_data') || '{}')) as Tab[];
        const filteredTabs = allTabs.filter(tab => tab.waiterId === user.id);
        
        // Sort tabs by putting those with 'Ready' items first
        filteredTabs.sort((a, b) => {
            const aHasReady = a.items.some(i => i.status === 'Ready');
            const bHasReady = b.items.some(i => i.status === 'Ready');
            if (aHasReady && !bHasReady) return -1;
            if (!aHasReady && bHasReady) return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        
        setMyTabs(filteredTabs);
    }, [user]);

    useEffect(() => {
        loadTabs();
        document.addEventListener('data_updated', loadTabs);
        const interval = setInterval(loadTabs, 3000); // Poll for updates every 3 seconds
        return () => {
            document.removeEventListener('data_updated', loadTabs);
            clearInterval(interval);
        };
    }, [loadTabs]);

    return (
        <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display">My Active Tables</h2>
            <div className="flex-grow overflow-y-auto hide-scrollbar">
                {myTabs.length === 0 ? (
                    <div className="flex items-center justify-center h-full bg-dark-card border border-dark-border rounded-2xl">
                        <p className="text-medium-text">You have no active tables.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myTabs.map(tab => (
                            <div key={tab.id} className="bg-dark-card border border-dark-border rounded-2xl p-4 flex flex-col">
                                <h3 className="text-xl font-bold text-primary mb-3 border-b border-dark-border pb-2">Table {tab.tableNumber}</h3>
                                <div className="space-y-2 flex-grow">
                                    {tab.items.map(item => <OrderItemView key={item.id} item={item} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaiterDashboardPage;