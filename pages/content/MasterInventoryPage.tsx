import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MasterInventoryItem } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { UserRole } from '../../types.ts';
import AddInventoryItemModal from '../../components/AddInventoryItemModal.tsx';

const MasterInventoryPage: React.FC = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const canEdit = user?.role === UserRole.Manager || user?.role === UserRole.Owner;

    const loadInventory = useCallback(() => {
        const data = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        setInventory(data);
    }, []);

    useEffect(() => {
        loadInventory();
        document.addEventListener('data_updated', loadInventory);
        return () => document.removeEventListener('data_updated', loadInventory);
    }, [loadInventory]);
    
    const filteredInventory = useMemo(() => {
        return inventory.filter(item => 
            (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.brand.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filter === 'All' || item.department === filter)
        );
    }, [inventory, searchTerm, filter]);

    const handleSaveItem = (newItem: MasterInventoryItem) => {
        const updatedInventory = [...inventory, newItem];
        setInventory(updatedInventory);
        localStorage.setItem('inventory', JSON.stringify(updatedInventory));
        document.dispatchEvent(new CustomEvent('data_updated'));
        setIsModalOpen(false);
    };

    return (
        <>
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold font-display">Master Inventory</h2>
                {canEdit && <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg">+ Add New Item</button>}
            </div>
            
            <div className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-grow flex flex-col">
                 <div className="flex gap-4 mb-4">
                    <input type="text" placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-1/3 bg-dark-bg border border-dark-border p-2 rounded-lg"/>
                 </div>
                 <div className="overflow-hidden flex-grow">
                    <div className="h-full overflow-auto hide-scrollbar">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="sticky top-0 bg-dark-card">
                               <tr className="border-b border-dark-border">
                                    <th className="p-3">Item Name</th>
                                    <th className="p-3 text-right">Stock</th>
                                    <th className="p-3 text-right">Cost</th>
                                    <th className="p-3">Department</th>
                                    <th className="p-3 text-center">Actions</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {filteredInventory.map(item => (
                                    <tr key={item.id} className="hover:bg-white/5">
                                        <td className="p-3 font-semibold">{item.name} <span className="text-xs text-medium-text">{item.brand}</span></td>
                                        <td className="p-3 text-right font-mono">{item.stock} {item.packagingType}</td>
                                        <td className="p-3 text-right font-mono">₱{item.costPerUnit.toFixed(2)}</td>
                                        <td className="p-3">{item.department}</td>
                                        <td className="p-3 text-center">
                                            <button disabled={!canEdit} className="text-xs bg-primary text-white px-2 py-1 rounded-md disabled:opacity-50">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>
        </div>
        {isModalOpen && canEdit && (
            <AddInventoryItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                existingItems={inventory}
            />
        )}
        </>
    );
};

export default MasterInventoryPage;