import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Table, TableStatus, Tab, OrderItem, MasterInventoryItem, UserRole, OrderItemStatus } from '../../types.ts';
import { XMarkIcon, PlusCircleIcon, EyeIcon, ReceiptPercentIcon, ArrowRightLeftIcon } from '../../components/icons.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useEditMode } from '../../contexts/EditModeContext.tsx';
import PaymentModal from '../../components/PaymentModal.tsx';
import DiscountModal from '../../components/DiscountModal.tsx';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

type ModalView = 'menu' | 'view_tab' | 'transfer' | 'add_order';

// --- NEW TYPES FOR LAYOUT ---
type TableShape = 'square' | 'round';
interface TablePosition {
    x: number;
    y: number;
    shape: TableShape;
}
type TableLayout = Record<number, TablePosition>;


// --- DRAGGABLE TABLE COMPONENT ---
const DraggableTable: React.FC<{
    table: Table;
    layout: TablePosition;
    tabs: Record<string, Tab>;
    isEditing: boolean;
    onMove: (tableNum: number, pos: { x: number; y: number }) => void;
    onClick: (table: Table) => void;
    onDelete: (tableNum: number) => void;
    onShapeChange: (tableNum: number) => void;
    containerRef: React.RefObject<HTMLDivElement>;
}> = ({ table, layout, tabs, isEditing, onMove, onClick, onDelete, onShapeChange, containerRef }) => {
    const { number, status, tabId } = table;
    
    // Graceful fallback for layout
    const pos = layout || { x: 0, y: 0, shape: 'square' };
    const { x, y, shape } = pos;

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEditing || !containerRef.current) return;
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = x;
        const startTop = y;
        const rect = containerRef.current.getBoundingClientRect();

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newX = startLeft + (moveEvent.clientX - startX);
            const newY = startTop + (moveEvent.clientY - startY);
            const constrainedX = Math.max(0, Math.min(newX, rect.width - 80)); 
            const constrainedY = Math.max(0, Math.min(newY, rect.height - 80));
            onMove(number, { x: constrainedX, y: constrainedY });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const statusStyles = {
        Available: 'bg-success/20 border-success/50 text-success',
        Occupied: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
        Billing: 'bg-danger/20 border-danger/50 text-danger',
    };
    
    const currentTab = tabId ? tabs[tabId] : null;
    const orderCount = currentTab ? currentTab.items.reduce((acc, i) => acc + i.qty, 0) : 0;

    return (
        <div
            style={{ left: `${x}px`, top: `${y}px` }}
            className={`absolute w-20 h-20 border-2 flex flex-col items-center justify-center transition-all duration-300 ${isEditing ? 'cursor-move ring-2 ring-primary ring-offset-2 ring-offset-dark-card' : 'cursor-pointer hover:scale-105 hover:border-primary'} ${shape === 'round' ? 'rounded-full' : 'rounded-lg'} ${statusStyles[status]}`}
            onMouseDown={handleMouseDown}
            onClick={() => !isEditing && onClick(table)}
        >
            <span className="text-3xl font-bold">{number}</span>
            <span className="text-xs font-semibold">{status}</span>
            {status !== 'Available' && <span className="text-xs">{orderCount} items</span>}

            {isEditing && (
                <div className="absolute -top-2 -right-2 flex flex-col gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(number); }} className="bg-danger rounded-full h-6 w-6 flex items-center justify-center text-white z-10"><XMarkIcon className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onShapeChange(number); }} className="bg-primary rounded-full h-6 w-6 flex items-center justify-center text-white z-10 text-xs font-bold">{shape === 'square' ? 'O' : '[]'}</button>
                </div>
            )}
        </div>
    );
};


const TablesPage: React.FC = () => {
    const { user } = useAuth();
    const { isEditMode } = useEditMode();
    const [tables, setTables] = useState<Table[]>([]);
    const [tabs, setTabs] = useState<Record<string, Tab>>({});
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
    const [layout, setLayout] = useState<TableLayout>({});
    
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [modalView, setModalView] = useState<ModalView>('menu');
    const [searchTerm, setSearchTerm] = useState('');
    const [additionalOrder, setAdditionalOrder] = useState<Omit<OrderItem, 'id' | 'status' | 'statusTimestamps'>[]>([]);
    
    const floorPlanRef = useRef<HTMLDivElement>(null);

    const initializeLayout = useCallback((tablesToLayout: Table[]) => {
        let storedLayout = JSON.parse(localStorage.getItem('table_layout') || '{}') as TableLayout;
        let layoutNeedsUpdate = false;
        
        tablesToLayout.forEach((table, index) => {
            if (!storedLayout[table.number]) {
                layoutNeedsUpdate = true;
                storedLayout[table.number] = {
                    x: (index % 8) * 100 + 20,
                    y: Math.floor(index / 8) * 100 + 20,
                    shape: 'square'
                };
            }
        });
        
        Object.keys(storedLayout).forEach(tableNum => {
            if (!tablesToLayout.some(t => t.number === parseInt(tableNum))) {
                delete storedLayout[parseInt(tableNum)];
                layoutNeedsUpdate = true;
            }
        });

        if (layoutNeedsUpdate) {
            localStorage.setItem('table_layout', JSON.stringify(storedLayout));
        }
        setLayout(storedLayout);
    }, []);

    const loadData = useCallback(() => {
        const tablesData = JSON.parse(localStorage.getItem('tables_data') || '[]') as Table[];
        setTables(tablesData);
        setTabs(JSON.parse(localStorage.getItem('tabs_data') || '{}'));
        setInventory(JSON.parse(localStorage.getItem('inventory') || '[]'));
        initializeLayout(tablesData);
    }, [initializeLayout]);

    useEffect(() => {
        loadData();
        document.addEventListener('data_updated', loadData);
        return () => document.removeEventListener('data_updated', loadData);
    }, [loadData]);
    
    const updateTablePosition = (tableNum: number, pos: { x: number; y: number }) => {
        const currentTableLayout = layout[tableNum];
        if (currentTableLayout) {
            const newLayout = { ...layout, [tableNum]: { ...currentTableLayout, ...pos } };
            setLayout(newLayout);
            localStorage.setItem('table_layout', JSON.stringify(newLayout));
        }
    }

    const handleAddTable = (shape: TableShape) => {
        const newTableNumber = Math.max(0, ...tables.map(t => t.number)) + 1;
        const newTable: Table = { number: newTableNumber, status: 'Available', tabId: null };
        const newTables = [...tables, newTable];
        const newLayout = {...layout, [newTableNumber]: { x: 20, y: 20, shape }};
        setTables(newTables);
        setLayout(newLayout);
        localStorage.setItem('tables_data', JSON.stringify(newTables));
        localStorage.setItem('table_layout', JSON.stringify(newLayout));
    }

    const handleRemoveTable = (tableNumber: number) => {
        const tableToRemove = tables.find(t => t.number === tableNumber);
        if (tableToRemove && tableToRemove.status !== 'Available') {
            alert(`Cannot remove Table ${tableNumber} because it has an active order. Please clear the table first.`);
            return;
        }
        if(window.confirm(`Are you sure you want to remove Table ${tableNumber}?`)){
            const newTables = tables.filter(t => t.number !== tableNumber);
            const newLayout = { ...layout };
            delete newLayout[tableNumber];

            setTables(newTables);
            setLayout(newLayout);
            localStorage.setItem('tables_data', JSON.stringify(newTables));
            localStorage.setItem('table_layout', JSON.stringify(newLayout));
        }
    }
    
    const handleChangeShape = (tableNum: number) => {
        const currentTableLayout = layout[tableNum];
        if (currentTableLayout) {
            const newShape: TableShape = currentTableLayout.shape === 'square' ? 'round' : 'square';
            const newLayout = { ...layout, [tableNum]: { ...currentTableLayout, shape: newShape }};
            setLayout(newLayout);
            localStorage.setItem('table_layout', JSON.stringify(newLayout));
        }
    };

    const saveData = (newTables: Table[], newTabs: Record<string, Tab>) => {
        localStorage.setItem('tables_data', JSON.stringify(newTables));
        localStorage.setItem('tabs_data', JSON.stringify(newTabs));
        document.dispatchEvent(new CustomEvent('data_updated'));
    };
    
    const handleMarkAsServed = (tabId: string, servedItem: OrderItem) => {
        const newTabs = { ...tabs };
        const tab = newTabs[tabId];
        if (!tab) return;
        
        const newItems = tab.items.map(item => {
            if (item.id === servedItem.id) {
                return { ...item, status: 'Served' as OrderItemStatus, statusTimestamps: { ...item.statusTimestamps, Served: new Date().toISOString() } };
            }
            return item;
        });
        
        newTabs[tabId] = { ...tab, items: newItems };
        saveData(tables, newTabs);
    };

    const handleTransferTable = (targetTableNumber: number) => {
        if (!selectedTable || !selectedTable.tabId || targetTableNumber === selectedTable.number) {
            closeActionModal();
            return;
        }

        const targetTable = tables.find(t => t.number === targetTableNumber);
        if (!targetTable || targetTable.status !== 'Available') {
            alert('Target table is not available.');
            return;
        }

        const newTabs = { ...tabs };
        const tabToMove = newTabs[selectedTable.tabId];
        tabToMove.previousTableNumber = tabToMove.tableNumber;
        tabToMove.tableNumber = targetTableNumber;

        const newTables = tables.map(t => {
            if (t.number === selectedTable.number) {
                return { ...t, status: 'Available' as TableStatus, tabId: null };
            }
            if (t.number === targetTableNumber) {
                return { ...t, status: 'Occupied' as TableStatus, tabId: selectedTable.tabId };
            }
            return t;
        });

        saveData(newTables, newTabs);
        closeActionModal();
    };

    const handlePlaceOrder = () => {
        if (!user || !selectedTable || additionalOrder.length === 0) return;

        const newOrderItems: OrderItem[] = additionalOrder.map(item => ({
            ...item,
            id: `order-${uuidv4()}`,
            status: 'New',
            statusTimestamps: { New: new Date().toISOString(), Preparing: null, Ready: null, Served: null, Cancelled: null }
        }));
        
        let newTabs = { ...tabs };
        let newTables = [...tables];

        if (selectedTable.status === 'Available') {
            const newTabId = `tab-${selectedTable.number}-${uuidv4().slice(0, 4)}`;
            newTabs[newTabId] = {
                id: newTabId,
                tableNumber: selectedTable.number,
                waiterId: user.id,
                items: newOrderItems,
                createdAt: new Date().toISOString(),
                orderType: 'Dine-In'
            };
            newTables = tables.map(t => t.number === selectedTable.number ? { ...t, status: 'Occupied', tabId: newTabId } : t);
        } else if (selectedTable.tabId) {
            const tab = newTabs[selectedTable.tabId];
            if (tab) {
                tab.items.push(...newOrderItems);
                // Reset discount if order changes
                delete tab.discount;
            }
        }
        
        saveData(newTables, newTabs);
        closeActionModal();
    };

    const handleApplyDiscount = (discount: Tab['discount']) => {
        if (!selectedTable?.tabId || !discount) return;
        const newTabs = { ...tabs };
        const tab = newTabs[selectedTable.tabId];
        if (!tab) return;

        tab.discount = discount;
        saveData(tables, newTabs); // This will trigger a re-render
        setIsDiscountModalOpen(false);
    };
    
    const closeActionModal = () => {
        setIsActionModalOpen(false);
        setSelectedTable(null);
        setAdditionalOrder([]);
        setSearchTerm('');
    };
    
    const handleConfirmPayment = () => {
        setPaymentModalOpen(false);
        closeActionModal();
    };

    const availableMenuItems = useMemo(() => inventory.filter(i => i.isEnabledOnPOS && i.price && i.name.toLowerCase().includes(searchTerm.toLowerCase())), [inventory, searchTerm]);

    const currentTabDetails = useMemo(() => {
        if (!selectedTable?.tabId) return { items: [], subtotal: 0, total: 0, discount: undefined, previousTableNumber: undefined };
        const tab = tabs[selectedTable.tabId];
        if (!tab) return { items: [], subtotal: 0, total: 0, discount: undefined, previousTableNumber: undefined };
        const subtotal = tab.items.reduce((acc, item) => acc + item.price * item.qty, 0);
        const total = subtotal - (tab.discount?.amount || 0);
        return { items: tab.items, subtotal, total, discount: tab.discount, previousTableNumber: tab.previousTableNumber };
    }, [selectedTable, tabs]);
    
    const handleTableClick = (table: Table) => {
        if (isEditMode) return;
        setSelectedTable(table);
        setModalView(table.status === 'Available' ? 'add_order' : 'menu');
        setIsActionModalOpen(true);
    };

    const OrderItemRow: React.FC<{item: OrderItem, tabId: string}> = ({item, tabId}) => {
        const canBeServed = item.status === 'Ready';
        return (
            <div className="flex justify-between items-center py-2">
                <div>
                    <p className="font-semibold">{item.qty}x {item.name}</p>
                    <p className="text-xs text-medium-text">{item.status}</p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">₱{(item.price * item.qty).toFixed(2)}</p>
                    {canBeServed && (
                        <button onClick={() => handleMarkAsServed(tabId, item)} className="text-xs bg-success text-dark-bg px-2 py-1 rounded-md font-bold">SERVE</button>
                    )}
                </div>
            </div>
        );
    };

    const renderModalContent = () => {
        if (!selectedTable) return null;

        const AddOrderView = (
            <>
                <h3 className="text-xl font-bold mb-4">
                    {selectedTable.status === 'Available' ? `New Order for Table ${selectedTable.number}` : `Add to Table ${selectedTable.number}`}
                </h3>
                <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mb-4"
                />
                <div className="max-h-60 overflow-y-auto hide-scrollbar space-y-2">
                    {availableMenuItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-dark-bg rounded-md">
                            <div>
                                <p>{item.name}</p>
                                <p className="text-xs text-medium-text">₱{item.price?.toFixed(2)}</p>
                            </div>
                            <button onClick={() => {
                                setAdditionalOrder(prev => {
                                    const existing = prev.find(i => i.menuItemId === item.id);
                                    if (existing) {
                                        return prev.map(i => i.menuItemId === item.id ? { ...i, qty: i.qty + 1 } : i);
                                    }
                                    return [...prev, { menuItemId: item.id, name: item.name, price: item.price!, qty: 1 }];
                                });
                            }} className="bg-primary text-white w-8 h-8 rounded-md font-bold text-lg">+</button>
                        </div>
                    ))}
                </div>
                 <div className="mt-4 border-t border-dark-border pt-4">
                    <h4 className="font-semibold">Current additions:</h4>
                     {additionalOrder.length === 0 ? <p className="text-xs text-medium-text">No new items added.</p> :
                        additionalOrder.map(item => (
                            <p key={item.menuItemId}>{item.qty}x {item.name}</p>
                        ))
                    }
                    <button onClick={handlePlaceOrder} disabled={additionalOrder.length === 0} className="w-full bg-success text-dark-bg font-bold py-2 px-4 rounded-lg transition mt-4 disabled:opacity-50 disabled:bg-dark-border shadow-glow-success">
                        {selectedTable.status === 'Available' ? 'Create Tab & Place Order' : 'Add Items to Order'}
                    </button>
                </div>
            </>
        );

        const ViewTabView = (
            <>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">Table {selectedTable.number} - Current Tab</h3>
                    {currentTabDetails.previousTableNumber && <span className="text-xs text-medium-text">(from Table {currentTabDetails.previousTableNumber})</span>}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-dark-border hide-scrollbar">
                    {currentTabDetails.items.map(item => <OrderItemRow key={item.id} item={item} tabId={selectedTable.tabId!} />)}
                </div>
                <div className="mt-4 pt-4 border-t border-dark-border font-mono">
                    <div className="flex justify-between text-lg">
                        <span className="font-semibold">Subtotal:</span>
                        <span>₱{currentTabDetails.subtotal.toFixed(2)}</span>
                    </div>
                    {currentTabDetails.discount && (
                        <div className="flex justify-between text-base text-danger">
                            <span>Discount ({currentTabDetails.discount.type === 'percent' ? `${currentTabDetails.discount.value}%` : `₱${currentTabDetails.discount.value}`}):</span>
                            <span>- ₱{currentTabDetails.discount.amount.toFixed(2)}</span>
                        </div>
                    )}
                     <div className="flex justify-between text-2xl font-bold mt-2">
                        <span>Total Due:</span>
                        <span className="text-primary">₱{currentTabDetails.total.toFixed(2)}</span>
                    </div>
                </div>
                 <div className="mt-4 grid grid-cols-3 gap-2">
                     <button onClick={() => setModalView('add_order')} className="bg-primary/80 hover:bg-primary text-white font-bold py-2 rounded-lg">Add Items</button>
                     <button onClick={() => setIsDiscountModalOpen(true)} className="bg-warning/80 hover:bg-warning text-dark-bg font-bold py-2 rounded-lg">Discount</button>
                     <button onClick={() => setPaymentModalOpen(true)} className="bg-success text-dark-bg font-bold py-2 rounded-lg shadow-glow-success">Pay Bill</button>
                 </div>
            </>
        );

        const TransferView = (
            <>
                 <h3 className="text-xl font-bold mb-4">Transfer Tab from Table {selectedTable.number}</h3>
                 <p className="text-sm text-medium-text mb-4">Select an available table to transfer this tab to.</p>
                 <div className="grid grid-cols-4 gap-4 max-h-60 overflow-y-auto">
                     {tables.filter(t => t.status === 'Available').map(t => (
                         <button key={t.number} onClick={() => handleTransferTable(t.number)} className="aspect-square bg-success/20 border border-success/50 rounded-lg flex flex-col items-center justify-center hover:bg-success/40 transition-colors">
                             <span className="text-2xl font-bold">{t.number}</span>
                             <span className="text-xs">Available</span>
                         </button>
                     ))}
                 </div>
            </>
        );

        const MenuView = (
            <>
                <h3 className="text-xl font-bold mb-4">Actions for Table {selectedTable.number}</h3>
                <div className="space-y-3">
                    <button onClick={() => setModalView('view_tab')} className="w-full text-left p-4 bg-dark-bg rounded-lg hover:bg-white/10 flex items-center gap-4"><EyeIcon className="w-6 h-6 text-primary" /> View/Manage Tab</button>
                    <button onClick={() => setModalView('add_order')} className="w-full text-left p-4 bg-dark-bg rounded-lg hover:bg-white/10 flex items-center gap-4"><PlusCircleIcon className="w-6 h-6 text-primary" /> Add to Order</button>
                    <button onClick={() => setPaymentModalOpen(true)} className="w-full text-left p-4 bg-dark-bg rounded-lg hover:bg-white/10 flex items-center gap-4"><ReceiptPercentIcon className="w-6 h-6 text-primary" /> Go to Billing</button>
                    <button onClick={() => setModalView('transfer')} className="w-full text-left p-4 bg-dark-bg rounded-lg hover:bg-white/10 flex items-center gap-4"><ArrowRightLeftIcon className="w-6 h-6 text-primary" /> Transfer Table</button>
                </div>
            </>
        );

        switch(modalView){
            case 'add_order': return AddOrderView;
            case 'view_tab': return ViewTabView;
            case 'transfer': return TransferView;
            case 'menu': default: return MenuView;
        }
    };
    
    const tabForPayment = selectedTable?.tabId ? tabs[selectedTable.tabId] : null;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-3xl font-bold font-display">Table Management</h2>
                {isEditMode && (
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 animate-fade-in">
                            <button onClick={() => handleAddTable('square')} className="text-xs bg-primary/80 hover:bg-primary text-white font-bold px-3 py-1.5 rounded-md">Add Square</button>
                            <button onClick={() => handleAddTable('round')} className="text-xs bg-primary/80 hover:bg-primary text-white font-bold px-3 py-1.5 rounded-md">Add Round</button>
                        </div>
                    </div>
                )}
            </div>
            <div 
                ref={floorPlanRef} 
                className={`relative flex-grow rounded-2xl border-2 overflow-auto hide-scrollbar ${isEditMode ? 'border-primary border-dashed bg-[radial-gradient(#30363D_1px,transparent_1px)] [background-size:16px_16px]' : 'border-dark-border bg-dark-card'}`}
            >
                {tables.map(table => layout[table.number] && (
                    <DraggableTable 
                        key={table.number}
                        table={table}
                        layout={layout[table.number]}
                        tabs={tabs}
                        isEditing={isEditMode}
                        onMove={updateTablePosition}
                        onClick={handleTableClick}
                        onDelete={handleRemoveTable}
                        onShapeChange={handleChangeShape}
                        containerRef={floorPlanRef}
                    />
                ))}
            </div>

            {isActionModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeActionModal}>
                   <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        {renderModalContent()}
                   </div>
                </div>
            )}
            
            {isPaymentModalOpen && tabForPayment && user && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    tab={tabForPayment}
                    totalAmount={currentTabDetails.total}
                    onConfirm={handleConfirmPayment}
                    user={user}
                />
            )}
             {isDiscountModalOpen && selectedTable && (
                <DiscountModal
                    isOpen={isDiscountModalOpen}
                    onClose={() => setIsDiscountModalOpen(false)}
                    onApplyDiscount={handleApplyDiscount}
                    currentTotal={currentTabDetails.subtotal}
                />
            )}
        </div>
    );
};

export default TablesPage;