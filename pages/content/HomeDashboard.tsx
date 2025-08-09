import React, { useState, useEffect, useCallback } from 'react';
import { Tab, OrderItem, MasterInventoryItem, Department, UserRole } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

const OrderTicket: React.FC<{ item: OrderItem & { tableNumber: number }; department: Department }> = ({ item, department }) => {
    const statusColors: Record<OrderItem['status'], string> = {
        New: 'border-primary',
        Preparing: 'border-warning animate-pulse',
        Ready: 'border-success',
        Served: 'border-medium-text',
        Cancelled: 'border-danger',
    };

    const handleUpdateStatus = (newStatus: OrderItem['status']) => {
        const allTabs = JSON.parse(localStorage.getItem('tabs_data') || '{}') as Record<string, Tab>;
        let foundTabId: string | null = null;
        let foundItemIndex = -1;

        for (const tabId in allTabs) {
            const tab = allTabs[tabId];
            const itemIndex = tab.items.findIndex(i => i.id === item.id);
            if (itemIndex > -1) {
                foundTabId = tabId;
                foundItemIndex = itemIndex;
                break;
            }
        }

        if (foundTabId && foundItemIndex > -1) {
            allTabs[foundTabId].items[foundItemIndex].status = newStatus;
            allTabs[foundTabId].items[foundItemIndex].statusTimestamps[newStatus] = new Date().toISOString();

            if (newStatus === 'Ready') {
                const waiterId = allTabs[foundTabId].waiterId;
                const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
                notifications.push({
                    id: `notif-${Date.now()}`,
                    userId: waiterId,
                    message: `${item.qty}x ${item.name} for Table ${item.tableNumber} is ready for pickup.`,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                });
                localStorage.setItem('notifications', JSON.stringify(notifications));
                document.dispatchEvent(new CustomEvent('notifications_updated'));
            }

            localStorage.setItem('tabs_data', JSON.stringify(allTabs));
            document.dispatchEvent(new CustomEvent('data_updated'));
        }
    };
    
    return (
        <div className={`w-72 bg-dark-card rounded-lg p-4 flex-shrink-0 h-full flex flex-col border-t-4 ${statusColors[item.status]}`}>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Table {item.tableNumber}</h3>
                <span className="text-xs text-medium-text">{new Date(item.statusTimestamps.New!).toLocaleTimeString()}</span>
            </div>
            <div className="flex-grow my-2 border-y border-dark-border py-2 flex items-center">
                <p className="text-2xl font-semibold">{item.qty}x {item.name}</p>
            </div>
            <div className="flex gap-2 text-sm">
                <button
                    onClick={() => handleUpdateStatus('Preparing')}
                    disabled={item.status === 'Preparing' || item.status === 'Ready'}
                    className="w-1/2 bg-warning text-black font-bold py-2 rounded-md disabled:opacity-50"
                >
                    Preparing
                </button>
                <button
                    onClick={() => handleUpdateStatus('Ready')}
                    disabled={item.status === 'Ready'}
                    className="w-1/2 bg-success text-white font-bold py-2 rounded-md disabled:opacity-50"
                >
                    Ready
                </button>
            </div>
        </div>
    );
};


const OrdersView: React.FC<{ department: Department }> = ({ department }) => {
    const [orders, setOrders] = useState<(OrderItem & { tableNumber: number })[]>([]);

    const loadOrders = useCallback(() => {
        const allTabs = JSON.parse(localStorage.getItem('tabs_data') || '{}') as Record<string, Tab>;
        const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        
        const itemsForDept: (OrderItem & { tableNumber: number })[] = [];
        Object.values(allTabs).forEach(tab => {
            tab.items.forEach(item => {
                const invItem = allInventory.find(i => i.id === item.menuItemId);
                if (invItem?.department === department && item.status !== 'Served' && item.status !== 'Cancelled') {
                    itemsForDept.push({ ...item, tableNumber: tab.tableNumber });
                }
            });
        });
        
        const sorted = itemsForDept.sort((a,b) => {
            const statusOrder = { 'New': 1, 'Preparing': 2, 'Ready': 3 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            return new Date(a.statusTimestamps.New!).getTime() - new Date(b.statusTimestamps.New!).getTime();
        });
        setOrders(sorted);
    }, [department]);

     useEffect(() => {
        loadOrders();
        document.addEventListener('data_updated', loadOrders);
        const interval = setInterval(loadOrders, 5000);
        return () => {
            document.removeEventListener('data_updated', loadOrders);
            clearInterval(interval);
        };
    }, [loadOrders]);

    return (
         <div className="flex-grow bg-dark-bg border border-dark-border rounded-2xl p-4 overflow-x-auto">
            <div className="flex gap-4 h-full min-w-max">
                {orders.map(item => (
                    <OrderTicket key={item.id} item={item} department={department} />
                ))}
                {orders.length === 0 && <p className="text-medium-text text-center w-full self-center">No active orders for the {department}.</p>}
            </div>
        </div>
    )
};

const SecurityView: React.FC = () => {
    const { users } = useAuth();
    const handleRequest = (role: UserRole) => {
        const targetUsers = users.filter(u => u.role === role);
        if (targetUsers.length === 0) {
            alert(`No ${role}s found to notify.`);
            return;
        }

        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        targetUsers.forEach(targetUser => {
            notifications.push({
                id: `notif-${Date.now()}-${targetUser.id}`,
                userId: targetUser.id,
                message: `Assistance requested by Security. Please attend immediately.`,
                timestamp: new Date().toISOString(),
                isRead: false,
            });
        });

        localStorage.setItem('notifications', JSON.stringify(notifications));
        document.dispatchEvent(new CustomEvent('notifications_updated'));
        alert(`A notification has been sent to all available ${role}s.`);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-8">
            <h2 className="text-4xl font-bold font-display">Security Overview</h2>
            <div className="flex gap-6">
                <button onClick={() => handleRequest(UserRole.Manager)} className="bg-danger hover:bg-danger/80 text-white font-bold py-4 px-8 rounded-lg text-xl transition">
                    Request for Manager
                </button>
                <button onClick={() => handleRequest(UserRole.Waiter)} className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-lg text-xl transition">
                    Request for Waiter
                </button>
            </div>
        </div>
    );
};


const OverviewPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Department>('Kitchen');

    if (!user) return null;

    const isManagerView = [UserRole.Owner, UserRole.Manager, UserRole.Developer, UserRole.SuperDeveloper].includes(user.role);
    
    if (user.role === UserRole.Security) {
        return <SecurityView />;
    }

    if (user.role === UserRole.Kitchen) {
        return (
             <div className="h-full flex flex-col gap-6">
                <h2 className="text-3xl font-bold font-display">Kitchen Orders</h2>
                <OrdersView department="Kitchen" />
            </div>
        )
    }

    if (user.role === UserRole.Bartender) {
        return (
             <div className="h-full flex flex-col gap-6">
                <h2 className="text-3xl font-bold font-display">Bar Orders</h2>
                <OrdersView department="Bar" />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold font-display">Live Order Overview</h2>
                {isManagerView && (
                    <div className="flex gap-2 bg-dark-card p-1 rounded-lg">
                        <button onClick={() => setActiveTab('Kitchen')} className={`py-2 px-4 rounded-md font-semibold ${activeTab === 'Kitchen' ? 'bg-primary text-white' : 'text-medium-text'}`}>Kitchen</button>
                        <button onClick={() => setActiveTab('Bar')} className={`py-2 px-4 rounded-md font-semibold ${activeTab === 'Bar' ? 'bg-primary text-white' : 'text-medium-text'}`}>Bar</button>
                    </div>
                )}
            </div>
            <OrdersView department={activeTab} />
        </div>
    );
};

export default OverviewPage;