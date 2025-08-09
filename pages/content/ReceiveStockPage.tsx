import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StockRequest, MasterInventoryItem, InventoryLog, User } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { XMarkIcon } from '../../components/icons.tsx';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const ReceiveStockPage: React.FC = () => {
    const { user, users } = useAuth();
    const [approvedRequests, setApprovedRequests] = useState<StockRequest[]>([]);
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
    const [receivedItems, setReceivedItems] = useState<Record<string, number>>({});

    const loadData = useCallback(() => {
        const allRequests = JSON.parse(localStorage.getItem('stock_requests') || '[]') as StockRequest[];
        setApprovedRequests(allRequests.filter(r => r.status === 'Approved'));
        const inv = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        setInventory(inv);
    }, []);

    useEffect(() => {
        loadData();
        document.addEventListener('data_updated', loadData);
        return () => document.removeEventListener('data_updated', loadData);
    }, [loadData]);

    const handleOpenModal = (request: StockRequest) => {
        setSelectedRequest(request);
        // Pre-fill received items with requested quantities
        const initialReceived = request.items.reduce((acc, item) => {
            acc[item.itemId] = item.quantity;
            return acc;
        }, {} as Record<string, number>);
        setReceivedItems(initialReceived);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        setReceivedItems({});
    };

    const handleQuantityChange = (itemId: string, qty: number) => {
        setReceivedItems(prev => ({ ...prev, [itemId]: qty }));
    };

    const handleConfirmReceipt = () => {
        if (!user || !selectedRequest) return;

        const currentInventory = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        const inventoryLogs = JSON.parse(localStorage.getItem('inventory_logs') || '[]') as InventoryLog[];

        // 1. Update inventory stock and create logs
        Object.entries(receivedItems).forEach(([itemId, quantity]) => {
            if (quantity > 0) {
                const itemIndex = currentInventory.findIndex(i => i.id === itemId);
                if (itemIndex > -1) {
                    currentInventory[itemIndex].stock += quantity;
                    
                    const newLog: InventoryLog = {
                        id: `log-${uuidv4()}`,
                        timestamp: new Date().toISOString(),
                        itemId: itemId,
                        itemName: currentInventory[itemIndex].name,
                        action: 'Receiving',
                        quantityChange: quantity,
                        responsibleUser: user.id,
                        notes: `Received from request ${selectedRequest.id.slice(0, 8)}`,
                    };
                    inventoryLogs.unshift(newLog);
                }
            }
        });
        
        // 2. Update the stock request status
        const allRequests = JSON.parse(localStorage.getItem('stock_requests') || '[]') as StockRequest[];
        const updatedRequests = allRequests.map(req => 
            req.id === selectedRequest.id ? { ...req, status: 'Received' as 'Received' } : req
        );

        // 3. Save all changes
        localStorage.setItem('inventory', JSON.stringify(currentInventory));
        localStorage.setItem('inventory_logs', JSON.stringify(inventoryLogs));
        localStorage.setItem('stock_requests', JSON.stringify(updatedRequests));

        alert('Stock successfully received and added to inventory.');
        document.dispatchEvent(new CustomEvent('data_updated'));
        handleCloseModal();
        loadData();
    };

    const getItemName = (id: string) => inventory.find(i => i.id === id)?.name || 'Unknown Item';
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown User';

    return (
        <>
            <div className="h-full flex flex-col gap-6">
                <h2 className="text-3xl font-bold font-display">Receive Incoming Stock</h2>
                <div className="flex-grow bg-dark-card border border-dark-border rounded-2xl p-4 overflow-y-auto hide-scrollbar">
                    {approvedRequests.length === 0 && <p className="text-center text-medium-text py-8">No approved deliveries are pending receipt.</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {approvedRequests.map(req => (
                            <div key={req.id} className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                                <h3 className="font-bold text-primary">{req.department} Department</h3>
                                <p className="text-xs text-medium-text">Req ID: {req.id.slice(0, 8)}</p>
                                <p className="text-sm">Requested by: {getUserName(req.requestedBy)}</p>
                                <p className="text-sm">{req.items.length} item(s)</p>
                                <button onClick={() => handleOpenModal(req)} className="mt-2 w-full bg-success hover:bg-success/80 text-white font-bold py-2 px-3 text-sm rounded-md transition">
                                    Receive Items
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-dark-border">
                            <h2 className="text-xl font-bold">Confirm Receipt for Request <span className="text-primary">{selectedRequest.id.slice(0, 8)}</span></h2>
                            <button onClick={handleCloseModal}><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead><tr className="border-b border-dark-border"><th className="pb-2">Item</th><th className="pb-2 text-center">Requested</th><th className="pb-2 text-center">Received</th></tr></thead>
                                <tbody className="divide-y divide-dark-border">
                                    {selectedRequest.items.map(item => (
                                        <tr key={item.itemId}>
                                            <td className="py-2 font-semibold">{getItemName(item.itemId)}</td>
                                            <td className="py-2 text-center">{item.quantity}</td>
                                            <td className="py-2 text-center">
                                                <input 
                                                    type="number"
                                                    value={receivedItems[item.itemId] || ''}
                                                    onChange={e => handleQuantityChange(item.itemId, parseInt(e.target.value) || 0)}
                                                    className="w-24 bg-dark-bg p-1 rounded-md border border-dark-border text-center"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-dark-border flex justify-end">
                            <button onClick={handleConfirmReceipt} className="bg-success hover:bg-success/80 text-white font-bold py-2 px-6 rounded-lg transition">
                                Confirm Receipt & Add to Inventory
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReceiveStockPage;