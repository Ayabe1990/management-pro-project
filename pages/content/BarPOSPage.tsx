import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MasterInventoryItem, OrderItem, Department, UserRole } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useEditMode } from '../../contexts/EditModeContext.tsx';
import MenuItemModal from '../../components/MenuItemModal.tsx';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const BarPOSPage: React.FC = () => {
    const { user } = useAuth();
    const { isEditMode } = useEditMode();
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
    const [currentOrder, setCurrentOrder] = useState<Omit<OrderItem, 'id' | 'status' | 'statusTimestamps'>[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    
    // State for Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MasterInventoryItem> | null>(null);

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

    const menuItems = useMemo(() => {
        return inventory.filter(i => 
            (i.department === 'Bar' || i.department === 'General') && 
            i.isEnabledOnPOS && 
            !i.isArchived &&
            i.price // Must have a price to be sellable
        )
    }, [inventory]);

    const categories = useMemo(() => ['All', ...Array.from(new Set(menuItems.map(i => i.category)))], [menuItems]);
    
    const filteredItems = useMemo(() => {
        if (selectedCategory === 'All') return menuItems;
        return menuItems.filter(i => i.category === selectedCategory);
    }, [menuItems, selectedCategory]);

    const handleItemClick = (item: MasterInventoryItem) => {
        if (isEditMode && canEdit) {
            setEditingItem(item);
            setIsModalOpen(true);
        } else {
            handleAddItem(item);
        }
    };

    const handleAddItem = (item: MasterInventoryItem) => {
        if (item.stock <= 0) {
            alert(`${item.name} is out of stock.`);
            return;
        }
        setCurrentOrder(prev => {
            const existing = prev.find(i => i.menuItemId === item.id);
            if (existing) {
                return prev.map(i => i.menuItemId === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { menuItemId: item.id, name: item.name, price: item.price!, qty: 1 }];
        });
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

    const handleUpdateQty = (itemId: string, newQty: number) => {
        if (newQty <= 0) {
            setCurrentOrder(prev => prev.filter(i => i.menuItemId !== itemId));
        } else {
            setCurrentOrder(prev => prev.map(i => i.menuItemId === itemId ? { ...i, qty: newQty } : i));
        }
    };
    
    const { subtotal, total } = useMemo(() => {
        const sub = currentOrder.reduce((acc, item) => acc + item.price * item.qty, 0);
        return { subtotal: sub, total: sub }; // Simplified total for now
    }, [currentOrder]);
    
    const handlePay = () => {
        if (currentOrder.length === 0 || !user) {
            alert("Cannot process an empty order.");
            return;
        }

        const invToUpdate = [...inventory];
        let stockSufficient = true;
        currentOrder.forEach(orderItem => {
            const invItemIndex = invToUpdate.findIndex(inv => inv.id === orderItem.menuItemId);
            if (invItemIndex > -1) {
                if (invToUpdate[invItemIndex].stock >= orderItem.qty) {
                    invToUpdate[invItemIndex].stock -= orderItem.qty;
                } else {
                    stockSufficient = false;
                    alert(`Not enough stock for ${orderItem.name}.`);
                }
            }
        });

        if (!stockSufficient) return;

        localStorage.setItem('inventory', JSON.stringify(invToUpdate));
        document.dispatchEvent(new CustomEvent('data_updated'));

        alert(`Payment of ₱${total.toFixed(2)} successful!`);
        setCurrentOrder([]);
    };

    return (
    <>
        <div className="h-full flex gap-4 text-white">
            <div className="w-1/3 bg-dark-card/50 border border-dark-border rounded-xl flex flex-col p-4">
                <div className="border-b border-dark-border pb-2 mb-2">
                    <h2 className="text-xl font-bold">Bar Walk-in Order</h2>
                </div>
                <div className="flex-grow overflow-y-auto hide-scrollbar space-y-2">
                    {currentOrder.map(item => (
                        <div key={item.menuItemId} className="flex items-center text-sm">
                            <div className="flex-grow">
                                <p className="font-semibold">{item.name}</p>
                                <div className="flex items-center gap-2">
                                     <button onClick={() => handleUpdateQty(item.menuItemId, item.qty - 1)} className="font-bold">-</button>
                                     <span className="w-6 text-center">{item.qty}</span>
                                     <button onClick={() => handleUpdateQty(item.menuItemId, item.qty + 1)} className="font-bold">+</button>
                                </div>
                            </div>
                            <p className="font-mono">₱{(item.price * item.qty).toFixed(2)}</p>
                        </div>
                    ))}
                    {currentOrder.length === 0 && <p className="text-center text-medium-text pt-10">Select an item to start.</p>}
                </div>
                <div className="border-t border-dark-border pt-2 font-mono">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₱{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-2xl font-bold mt-2"><span>Total:</span><span>₱{total.toFixed(2)}</span></div>
                </div>
            </div>

            <div className="w-2/3 flex flex-col gap-4">
                <div className="bg-dark-card/50 border border-dark-border rounded-xl p-4 flex-grow flex flex-col">
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-dark-bg hover:bg-dark-border'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex-grow overflow-y-auto hide-scrollbar pt-4">
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filteredItems.map(item => (
                                <button key={item.id} onClick={() => handleItemClick(item)} className={`bg-dark-bg border rounded-lg p-2 text-left flex flex-col justify-between h-28 disabled:opacity-50 relative ${isEditMode && canEdit ? 'border-primary border-dashed animate-pulse' : 'border-dark-border hover:ring-2 ring-primary'}`} disabled={item.stock <= 0 && !isEditMode}>
                                    <span className="text-sm font-semibold">{item.name}</span>
                                    <span className="font-bold text-right">₱{item.price?.toFixed(2)}</span>
                                    {item.stock <= 0 && <span className="absolute bottom-1 left-2 text-xs text-danger font-bold">OUT OF STOCK</span>}
                                </button>
                            ))}
                             {isEditMode && canEdit && (
                                <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="border-2 border-dashed border-primary/50 text-primary/80 rounded-lg flex flex-col items-center justify-center h-28 hover:bg-primary/10">
                                    <span className="text-3xl">+</span>
                                    <span>Add Item</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-dark-card/50 border border-dark-border rounded-xl p-3 flex-shrink-0">
                    <div className="grid grid-cols-6 gap-2">
                        <button onClick={() => setCurrentOrder([])} className="col-span-3 bg-danger/80 hover:bg-danger p-3 rounded-lg font-semibold">Void Order</button>
                        <button onClick={handlePay} className="col-span-3 bg-success hover:bg-success/80 text-white p-3 rounded-lg font-semibold">Pay Now</button>
                    </div>
                </div>
            </div>
        </div>
        {isModalOpen && canEdit && (
            <MenuItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
                itemToEdit={editingItem}
                categories={categories}
            />
        )}
    </>
    );
};

export default BarPOSPage;