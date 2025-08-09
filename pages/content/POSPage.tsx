import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MasterInventoryItem, Tab, OrderItem, Table, User, UserRole } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useEditMode } from '../../contexts/EditModeContext.tsx';
import PaymentModal from '../../components/PaymentModal.tsx';
import MenuItemModal from '../../components/MenuItemModal.tsx';
import DiscountModal from '../../components/DiscountModal.tsx';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const POSPage: React.FC = () => {
    const { user } = useAuth();
    const { isEditMode } = useEditMode();
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
    const [currentOrder, setCurrentOrder] = useState<Omit<OrderItem, 'id' | 'status' | 'statusTimestamps'>[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [tabForPayment, setTabForPayment] = useState<Tab | null>(null);

    // State for Edit Modal
    const [isMenuItemModalOpen, setMenuItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MasterInventoryItem> | null>(null);

    // State for Discount
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [discount, setDiscount] = useState<Tab['discount'] | null>(null);
    
    const canEdit = user?.role === UserRole.Owner || user?.role === UserRole.Manager;

    const loadData = useCallback(() => {
        const inv = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        setInventory(inv);
    }, []);

    useEffect(() => {
        loadData();
        document.addEventListener('data_updated', loadData);
        return () => document.removeEventListener('data_updated', loadData);
    }, [loadData]);

    const menuItems = useMemo(() => inventory.filter(i => i.isEnabledOnPOS && !i.isArchived), [inventory]);
    const categories = useMemo(() => ['All', ...Array.from(new Set(menuItems.map(i => i.category)))], [menuItems]);
    const filteredItems = useMemo(() => {
        if (selectedCategory === 'All') return menuItems;
        return menuItems.filter(i => i.category === selectedCategory);
    }, [menuItems, selectedCategory]);

    const handleItemClick = (item: MasterInventoryItem) => {
        if (isEditMode && canEdit) {
            setEditingItem(item);
            setMenuItemModalOpen(true);
        } else {
            handleAddItem(item);
        }
    };
    
    const handleSaveItem = (itemToSave: MasterInventoryItem) => {
        const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        const itemIndex = allInventory.findIndex(i => i.id === itemToSave.id);
        if (itemIndex > -1) {
            allInventory[itemIndex] = itemToSave;
        } else {
            allInventory.push(itemToSave);
        }
        localStorage.setItem('inventory', JSON.stringify(allInventory));
        document.dispatchEvent(new CustomEvent('data_updated'));
    };
    
    const handleDeleteItem = (itemId: string) => {
        const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        const updatedInventory = allInventory.filter(i => i.id !== itemId);
        localStorage.setItem('inventory', JSON.stringify(updatedInventory));
        document.dispatchEvent(new CustomEvent('data_updated'));
    };

    const handleAddItem = (item: MasterInventoryItem) => {
        if (item.stock <= 0) {
            alert(`${item.name} is out of stock.`);
            return;
        }
        setDiscount(null); // Reset discount when order changes
        setCurrentOrder(prev => {
            const existing = prev.find(i => i.menuItemId === item.id);
            if (existing) {
                return prev.map(i => i.menuItemId === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { menuItemId: item.id, name: item.name, price: item.price!, qty: 1 }];
        });
    };

    const handleUpdateQty = (itemId: string, newQty: number) => {
        setDiscount(null); // Reset discount when order changes
        if (newQty <= 0) {
            setCurrentOrder(prev => prev.filter(i => i.menuItemId !== itemId));
        } else {
            setCurrentOrder(prev => prev.map(i => i.menuItemId === itemId ? { ...i, qty: newQty } : i));
        }
    };
    
    const { subtotal, total } = useMemo(() => {
        const sub = currentOrder.reduce((acc, item) => acc + item.price * item.qty, 0);
        const totalAfterDiscount = sub - (discount?.amount || 0);
        return { subtotal: sub, total: totalAfterDiscount };
    }, [currentOrder, discount]);
    
    const handleInitiatePayment = () => {
        if (!user || currentOrder.length === 0) return;
        
        const orderItems: OrderItem[] = currentOrder.map(item => ({
             ...item,
             id: `order-${uuidv4()}`, status: 'Served',
             statusTimestamps: { New: new Date().toISOString(), Preparing: new Date().toISOString(), Ready: new Date().toISOString(), Served: new Date().toISOString(), Cancelled: null }
        }));

        const tempTab: Tab = {
            id: `tab-walkin-${uuidv4()}`,
            tableNumber: 0, // 0 for walk-in
            waiterId: user.id,
            items: orderItems,
            createdAt: new Date().toISOString(),
            orderType: 'Takeout',
            discount: discount || undefined
        };
        setTabForPayment(tempTab);
        setPaymentModalOpen(true);
    };
    
    const handleConfirmPayment = () => {
        alert(`Payment processed successfully.`);
        setCurrentOrder([]);
        setDiscount(null);
        setPaymentModalOpen(false);
        setTabForPayment(null);
    };

    const handleApplyDiscount = (appliedDiscount: Tab['discount']) => {
        setDiscount(appliedDiscount);
        setIsDiscountModalOpen(false);
    };

    const handleClearOrder = () => {
        setCurrentOrder([]);
        setDiscount(null);
    };


    return (
    <>
        <div className="h-full flex flex-col lg:flex-row gap-4 text-white">
            <div className="w-full lg:w-1/3 bg-dark-card/50 border border-dark-border rounded-xl flex flex-col p-4">
                <div className="border-b border-dark-border pb-2 mb-2 flex-shrink-0">
                    <h2 className="text-xl font-bold">Current Order</h2>
                    <p className="text-sm text-medium-text">Walk-in / Takeout</p>
                </div>
                <div className="flex-grow overflow-y-auto hide-scrollbar space-y-2 py-2">
                    {currentOrder.map(item => (
                        <div key={item.menuItemId} className="flex items-center text-sm bg-dark-bg/50 p-2 rounded-lg">
                            <div className="flex-grow">
                                <p className="font-semibold">{item.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                     <button onClick={() => handleUpdateQty(item.menuItemId, item.qty - 1)} className="font-bold bg-dark-border w-6 h-6 rounded">-</button>
                                     <span className="w-6 text-center font-mono">{item.qty}</span>
                                     <button onClick={() => handleUpdateQty(item.menuItemId, item.qty + 1)} className="font-bold bg-dark-border w-6 h-6 rounded">+</button>
                                </div>
                            </div>
                            <p className="font-mono text-base">₱{(item.price * item.qty).toFixed(2)}</p>
                        </div>
                    ))}
                    {currentOrder.length === 0 && <p className="text-center text-gray-500 pt-10">No items added yet.</p>}
                </div>
                <div className="border-t border-dark-border pt-2 font-mono flex-shrink-0">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₱{subtotal.toFixed(2)}</span></div>
                    {discount && (
                        <div className="flex justify-between text-danger">
                            <span>Discount ({discount.type === 'percent' ? `${discount.value}%` : `₱${discount.value}`}):</span>
                            <span>- ₱{discount.amount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-2xl font-bold mt-2 text-primary"><span>Total:</span><span>₱{total.toFixed(2)}</span></div>
                </div>
                 <div className="mt-4 flex-shrink-0">
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={handleClearOrder} className="bg-danger/80 hover:bg-danger p-3 rounded-lg font-semibold col-span-1">Clear</button>
                        <button onClick={() => setIsDiscountModalOpen(true)} disabled={currentOrder.length === 0} className="bg-warning/80 hover:bg-warning text-dark-bg p-3 rounded-lg font-semibold disabled:opacity-50">Discount</button>
                        <button onClick={handleInitiatePayment} disabled={currentOrder.length === 0} className="col-span-1 bg-success hover:bg-success/80 text-dark-bg p-3 rounded-lg font-semibold disabled:opacity-50 disabled:bg-dark-border disabled:text-medium-text shadow-glow-success">Pay Now</button>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col gap-4">
                <div className="bg-dark-card/50 border border-dark-border rounded-xl p-4 flex-grow flex flex-col">
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 flex-shrink-0">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-glow-sm-primary' : 'bg-dark-bg hover:bg-dark-border'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex-grow overflow-y-auto hide-scrollbar pt-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {filteredItems.map(item => (
                                <button key={item.id} onClick={() => handleItemClick(item)} className={`bg-dark-bg border rounded-lg p-2 text-left flex flex-col justify-between h-28 disabled:opacity-50 relative transition-all ${isEditMode && canEdit ? 'border-primary border-dashed animate-pulse' : 'border-dark-border hover:border-primary hover:scale-105'}`} disabled={item.stock <= 0 && !isEditMode}>
                                    <span className="text-sm font-semibold">{item.name}</span>
                                    <span className="font-bold text-right text-primary">₱{item.price?.toFixed(2)}</span>
                                    {item.stock <= 0 && <span className="absolute bottom-1 left-2 text-xs text-danger font-bold">OUT OF STOCK</span>}
                                </button>
                            ))}
                            {isEditMode && canEdit && (
                                <button onClick={() => { setEditingItem(null); setMenuItemModalOpen(true); }} className="border-2 border-dashed border-primary/50 text-primary/80 rounded-lg flex flex-col items-center justify-center h-28 hover:bg-primary/10">
                                    <span className="text-3xl">+</span>
                                    <span>Add Item</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {isPaymentModalOpen && tabForPayment && user && (
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onConfirm={handleConfirmPayment}
                tab={tabForPayment}
                totalAmount={total}
                user={user}
            />
        )}

        {isMenuItemModalOpen && canEdit && (
            <MenuItemModal 
                isOpen={isMenuItemModalOpen}
                onClose={() => setMenuItemModalOpen(false)}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
                itemToEdit={editingItem}
                categories={categories}
            />
        )}

        {isDiscountModalOpen && (
            <DiscountModal
                isOpen={isDiscountModalOpen}
                onClose={() => setIsDiscountModalOpen(false)}
                onApplyDiscount={handleApplyDiscount}
                currentTotal={subtotal}
            />
        )}
    </>
    );
};

export default POSPage;