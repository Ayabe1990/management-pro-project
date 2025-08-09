import React, { useState, useEffect } from 'react';
import { MasterInventoryItem, Voucher, EventTicket } from '../../types.ts';

interface ScanItemPageProps {
    mode?: 'voucher' | 'inventory' | 'event_ticket';
}

// Mock databases that would be populated by generator pages
const mockInventoryDB: MasterInventoryItem[] = [
    { id: '1', barcode: '8992761109163', name: 'San Miguel Pale Pilsen', type: 'raw', category: 'Beverage', stock: 48, reorderLevel: 24, costPerUnit: 45, department: 'Bar', brand: 'San Miguel', unitType: 'bottle', packagingType: 'bottle', caseQuantity: 24, supplier: 'SMB', isArchived: false },
    { id: '2', barcode: '4800024133405', name: 'Coca-Cola 1.5L', type: 'raw', category: 'Beverage', stock: 15, reorderLevel: 12, costPerUnit: 70, department: 'Bar', brand: 'Coca-Cola', unitType: 'bottle', packagingType: 'bottle', caseQuantity: 12, supplier: 'Coca-Cola', isArchived: false },
    { id: '3', barcode: '085000004547', name: 'Tostitos Scoops', type: 'raw', category: 'Food Ingredient', stock: 5, reorderLevel: 4, costPerUnit: 200, department: 'Kitchen', brand: 'Tostitos', unitType: 'kg', packagingType: 'pack', caseQuantity: 1, supplier: 'Supermarket', isArchived: false },
];

const getStoredItems = <T,>(key: string): T[] => {
    try {
        const items = localStorage.getItem(key);
        return items ? JSON.parse(items) : [];
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
        return [];
    }
};

const saveStoredItems = <T,>(key: string, data: T[]) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
};


const ScanItemPage: React.FC<ScanItemPageProps> = ({ mode = 'voucher' }) => {
    const [scanResult, setScanResult] = useState<{ status: 'none' | 'success' | 'error' | 'info', message: string, details?: string }>({ status: 'none', message: '' });

    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [eventTickets, setEventTickets] = useState<EventTicket[]>([]);

    useEffect(() => {
        if (mode === 'voucher') {
            setVouchers(getStoredItems<Voucher>('vouchers'));
        }
        if (mode === 'event_ticket') {
            setEventTickets(getStoredItems<EventTicket>('event_tickets'));
        }
    }, [mode]);

    const handleScan = (idToScan: string) => {
        let result = { status: 'error', message: 'Invalid Code.', details: 'This code is not recognized by the system.' } as typeof scanResult;
        const now = new Date();

        if (mode === 'voucher') {
            const allVouchers = getStoredItems<Voucher>('vouchers');
            const voucher = allVouchers.find(v => v.id === idToScan);
            if (voucher) {
                const isExpired = new Date(voucher.expiryDate) < now;
                if (isExpired && voucher.status !== 'Expired') {
                    voucher.status = 'Expired';
                }

                switch (voucher.status) {
                    case 'Active':
                        const allInventory = getStoredItems<MasterInventoryItem>('inventory');
                        const itemIndex = allInventory.findIndex(i => i.id === voucher.menuItemId);
                        
                        if (itemIndex > -1 && allInventory[itemIndex].stock > 0) {
                            allInventory[itemIndex].stock -= 1; // Decrement stock
                            saveStoredItems('inventory', allInventory);
                            document.dispatchEvent(new CustomEvent('data_updated'));

                            voucher.status = 'Claimed';
                            result = { status: 'success', message: 'Voucher Claimed!', details: voucher.itemName };
                        } else {
                             result = { status: 'error', message: 'Voucher Valid, But...', details: `Item "${voucher.itemName}" is currently out of stock.` };
                        }
                        break;
                    case 'Claimed':
                        result = { status: 'error', message: 'Voucher Already Claimed', details: `This voucher for "${voucher.itemName}" has been used.` };
                        break;
                    case 'Expired':
                        result = { status: 'error', message: 'Voucher Expired', details: `Expired on ${new Date(voucher.expiryDate).toLocaleDateString()}`};
                        break;
                }
            }
            saveStoredItems('vouchers', allVouchers);
            setVouchers(allVouchers);
        }

        if (mode === 'event_ticket') {
            // Read-only check. Does not save or update status.
            const allTickets = getStoredItems<EventTicket>('event_tickets');
            const ticket = allTickets.find(t => t.id === idToScan);
            if (ticket) {
                const isExpired = new Date(ticket.expiryDate) < now;
                if (isExpired) {
                    result = { status: 'error', message: 'Ticket is Expired', details: `Expired on ${new Date(ticket.expiryDate).toLocaleDateString()}` };
                } else {
                    switch (ticket.status) {
                        case 'Active':
                            result = { status: 'success', message: 'Ticket is Valid', details: `Event: ${ticket.eventName}. Ready for use.` };
                            break;
                        case 'Used':
                            result = { status: 'error', message: 'Ticket Already Used', details: 'This ticket has already been scanned.' };
                            break;
                        case 'Expired':
                             result = { status: 'error', message: 'Ticket is Expired', details: `Expired on ${new Date(ticket.expiryDate).toLocaleDateString()}` };
                            break;
                    }
                }
            } else {
                 result = { status: 'error', message: 'Invalid Ticket', details: 'This QR code is not in our system.' };
            }
        }

        if (mode === 'inventory') {
            const item = mockInventoryDB.find(i => i.barcode === idToScan);
            if (item) {
                result = { status: 'info', message: `Item Found: ${item.name}`, details: `Current Stock: ${item.stock} ${item.unitType}` };
            } else {
                 result = { status: 'error', message: 'Barcode Not Found' };
            }
        }
        
        setScanResult(result);
        setTimeout(() => setScanResult({ status: 'none', message: '' }), 5000);
    }
    
    const getSimulationIds = () => {
        if (mode === 'voucher') {
            const active = vouchers.find(v => v.status === 'Active');
            const claimed = vouchers.find(v => v.status === 'Claimed');
            return { valid: active?.id, invalid: claimed?.id, nonExistent: 'INVALID_VOUCHER_ID' };
        }
        if (mode === 'event_ticket') {
             const active = eventTickets.find(t => t.status === 'Active');
             const used = eventTickets.find(t => t.status === 'Used');
             return { valid: active?.id, invalid: used?.id, nonExistent: 'INVALID_TICKET_ID' };
        }
        return { valid: mockInventoryDB[0]?.barcode, invalid: '0000000000000', nonExistent: '0000000000000' };
    };

    const simIds = getSimulationIds();

    const pageConfig = {
        voucher: { title: 'Voucher Scanner', waiting: 'Awaiting barcode scan...', type: 'barcode' },
        inventory: { title: 'Inventory Scanner', waiting: 'Awaiting barcode scan...', type: 'barcode' },
        event_ticket: { title: 'Event Ticket Scanner', waiting: 'Awaiting QR code scan...', type: 'QR Code' }
    };
    
    const { title, waiting } = pageConfig[mode];
    
    const resultColors = {
        success: 'text-success',
        error: 'text-danger',
        info: 'text-primary',
        none: 'text-medium-text'
    };

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold font-display mb-6">{title}</h2>
            <div className="w-full max-w-md aspect-square bg-dark-bg rounded-2xl border-4 border-dark-border flex items-center justify-center relative overflow-hidden">
                <p className="text-medium-text">Camera feed would appear here.</p>
                <div className="absolute top-0 left-0 w-full h-full animate-scan">
                    <div className="w-full h-1 bg-primary shadow-[0_0_15px_5px_rgba(88,166,255,0.7)]"></div>
                </div>
            </div>
            <div className="mt-6 text-center h-16">
                 {scanResult.status !== 'none' ? (
                    <div className={`${resultColors[scanResult.status]} font-bold text-lg`}>
                        <p>{scanResult.message}</p>
                        {scanResult.details && <p className="text-base text-light-text font-normal">{scanResult.details}</p>}
                    </div>
                ) : (
                    <p className="text-medium-text">{waiting}</p>
                )}
            </div>

             <div className="mt-4 flex flex-wrap justify-center gap-4">
                <button
                    onClick={() => simIds.valid && handleScan(simIds.valid)}
                    disabled={!simIds.valid}
                    className="bg-success hover:bg-success/80 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:bg-dark-border disabled:cursor-not-allowed"
                    title={!simIds.valid ? `No valid ${mode.replace('_', ' ')} found to simulate` : 'Simulate a valid scan'}
                >
                    Simulate Valid Scan
                </button>
                <button
                    onClick={() => simIds.invalid && handleScan(simIds.invalid)}
                    disabled={!simIds.invalid}
                    className="bg-warning hover:bg-warning/80 text-black font-bold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:bg-dark-border disabled:cursor-not-allowed"
                    title={!simIds.invalid ? `No used/claimed ${mode.replace('_', ' ')} found to simulate` : 'Simulate a used or claimed scan'}
                >
                    Simulate Used/Claimed Scan
                </button>
                 <button
                    onClick={() => handleScan(simIds.nonExistent!)}
                    className="bg-danger hover:bg-danger/80 text-white font-bold py-2 px-6 rounded-lg transition"
                    title="Simulate scanning a code that does not exist"
                >
                    Simulate Not Found Scan
                </button>
            </div>
        </div>
    );
};

export default ScanItemPage;