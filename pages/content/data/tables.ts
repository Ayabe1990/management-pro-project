import { Table, Tab, TableStatus, OrderItem, OrderItemStatus } from '../../../types.ts';

interface InitialTableData {
    tables: Table[];
    tabs: Record<string, Tab>;
}

const generateOrderItems = (items: { menuItemId: string; name: string; price: number; qty: number; status: OrderItemStatus }[]): OrderItem[] => {
    return items.map(item => {
        const createTime = new Date();
        const prepTime = item.status === 'Preparing' || item.status === 'Ready' || item.status === 'Served' ? new Date(createTime.getTime() + 60000) : null;
        const readyTime = item.status === 'Ready' || item.status === 'Served' ? new Date(createTime.getTime() + 300000) : null;
        return {
            id: `orderitem-${Math.random()}`,
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            qty: item.qty,
            status: item.status,
            statusTimestamps: {
                New: createTime.toISOString(),
                Preparing: prepTime?.toISOString() || null,
                Ready: readyTime?.toISOString() || null,
                Served: null,
                Cancelled: null
            }
        };
    });
};

export const initialTables: InitialTableData = {
    tables: [
        { number: 1, status: 'Available', tabId: null },
        { number: 2, status: 'Occupied', tabId: 'tab-2' },
        { number: 3, status: 'Available', tabId: null },
        { number: 4, status: 'Occupied', tabId: 'tab-4' },
        { number: 5, status: 'Billing', tabId: 'tab-5' },
        { number: 6, status: 'Occupied', tabId: 'tab-6' },
        { number: 7, status: 'Available', tabId: null },
        { number: 8, status: 'Available', tabId: null },
        { number: 9, status: 'Available', tabId: null },
        { number: 10, status: 'Occupied', tabId: 'tab-10' },
        { number: 11, status: 'Available', tabId: null },
        { number: 12, status: 'Available', tabId: null },
    ],
    tabs: {
        'tab-2': {
            id: 'tab-2',
            tableNumber: 2,
            waiterId: '5', // Carlos Mendoza
            createdAt: new Date().toISOString(),
            orderType: 'Dine-In',
            items: generateOrderItems([
                { menuItemId: 'FG-SISIG', name: 'Sizzling Sisig', price: 230, qty: 1, status: 'Preparing' },
                { menuItemId: 'FG-SML-BOTTLE', name: 'San Miguel Light', price: 80, qty: 2, status: 'Ready' },
            ]),
        },
        'tab-4': {
            id: 'tab-4',
            tableNumber: 4,
            waiterId: '5', // Carlos Mendoza
            createdAt: new Date().toISOString(),
            orderType: 'Dine-In',
            items: generateOrderItems([
                { menuItemId: 'FG-ADOBO', name: 'Chicken Adobo', price: 180, qty: 1, status: 'New' },
            ]),
        },
        'tab-5': {
            id: 'tab-5',
            tableNumber: 5,
            waiterId: '5', // Carlos Mendoza
            createdAt: new Date().toISOString(),
            orderType: 'Dine-In',
            items: generateOrderItems([
                { menuItemId: 'FG-CRISPYPATA', name: 'Crispy Pata', price: 700, qty: 1, status: 'Served' },
                { menuItemId: 'FG-HALOHALO', name: 'Halo-Halo', price: 160, qty: 2, status: 'Served' },
                { menuItemId: 'FG-REDHORSE-BOTTLE', name: 'Red Horse', price: 100, qty: 3, status: 'Served' },
            ]),
        },
        'tab-6': {
            id: 'tab-6',
            tableNumber: 6,
            waiterId: '5',
            createdAt: new Date().toISOString(),
            orderType: 'Dine-In',
            items: generateOrderItems([
                { menuItemId: 'FG-MOJITO-PITCHER', name: 'Mojito (Pitcher)', price: 550, qty: 1, status: 'Preparing' },
            ]),
        },
        'tab-10': {
            id: 'tab-10',
            tableNumber: 10,
            waiterId: '5',
            createdAt: new Date().toISOString(),
            orderType: 'Dine-In',
            items: generateOrderItems([
                { menuItemId: 'FG-LECHONKAWALI', name: 'Lechon Kawali', price: 250, qty: 2, status: 'New' },
                { menuItemId: 'FG-ICEDTEA', name: 'House Iced Tea (Glass)', price: 50, qty: 4, status: 'New' },
            ]),
        },
    },
};