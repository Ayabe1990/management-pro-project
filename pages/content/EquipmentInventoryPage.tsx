import React, { useState, useEffect, useMemo } from 'react';
import { EquipmentInventoryItem, UserRole, EquipmentLog, EquipmentStatus } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { initialEquipment } from './data/equipment.ts';
import { XMarkIcon, PlusCircleIcon } from '../../components/icons.tsx';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const EquipmentStatusPill: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
    const statusStyles: Record<EquipmentStatus, string> = {
        Operational: 'bg-success/20 text-success',
        'Maintenance Required': 'bg-warning/20 text-warning',
        'Out of Service': 'bg-danger/20 text-danger',
        Broken: 'bg-danger/20 text-danger',
        Lost: 'bg-danger/20 text-danger',
        Retired: 'bg-medium-text/20 text-medium-text',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>{status}</span>;
}


const EquipmentInventoryPage: React.FC = () => {
    const { user } = useAuth();
    const [equipment, setEquipment] = useState<EquipmentInventoryItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EquipmentInventoryItem | null>(null);

    useEffect(() => {
        const storedEquipment = localStorage.getItem('equipment_inventory');
        setEquipment(storedEquipment ? JSON.parse(storedEquipment) : initialEquipment);
    }, []);

    const saveEquipment = (newEquipment: EquipmentInventoryItem[]) => {
        setEquipment(newEquipment);
        localStorage.setItem('equipment_inventory', JSON.stringify(newEquipment));
    };
    
    const saveLog = (log: EquipmentLog) => {
        const logs: EquipmentLog[] = JSON.parse(localStorage.getItem('equipment_logs') || '[]');
        logs.unshift(log); // Add to the beginning
        localStorage.setItem('equipment_logs', JSON.stringify(logs));
    };

    const canEdit = useMemo(() => user?.role === UserRole.Owner || user?.role === UserRole.Manager, [user]);

    const handleOpenModal = (item: EquipmentInventoryItem | null) => {
        setEditingItem(item ? {...item} : {
            id: `EQ-${uuidv4().substring(0,8).toUpperCase()}`, name: '', description: '', category: 'General', quantity: 1,
            price: 0, purchaseDate: new Date().toISOString().split('T')[0], status: 'Operational'
        });
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    }

    const handleSaveItem = () => {
        if (!editingItem || !user) return;
        
        const existingItem = equipment.find(e => e.id === editingItem.id);
        
        if (existingItem) {
            // Check for status change to log it specifically
            if (existingItem.status !== editingItem.status) {
                 saveLog({
                    id: uuidv4(), equipmentId: editingItem.id, equipmentName: editingItem.name,
                    date: new Date().toISOString(), type: 'Status Change', 
                    notes: `Status changed from ${existingItem.status} to ${editingItem.status}`,
                    userId: user.id, quantityChange: 0
                });
            }
            saveEquipment(equipment.map(e => e.id === editingItem.id ? editingItem : e));
        } else {
            saveEquipment([...equipment, editingItem]);
            saveLog({
                id: uuidv4(), equipmentId: editingItem.id, equipmentName: editingItem.name,
                date: new Date().toISOString(), type: 'Added', notes: `Added new item.`,
                userId: user.id, quantityChange: editingItem.quantity
            });
        }
        
        handleCloseModal();
    };

    const handleModalChange = (field: keyof EquipmentInventoryItem, value: any) => {
        if(editingItem) {
            setEditingItem({...editingItem, [field]: value});
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold font-display">Equipment Inventory</h2>
                {canEdit && <button onClick={() => handleOpenModal(null)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"><PlusCircleIcon className="w-5 h-5"/> Add Equipment</button>}
            </div>
            <div className="flex-grow bg-dark-card border border-dark-border rounded-2xl p-4 overflow-hidden">
                <div className="h-full overflow-auto hide-scrollbar">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="sticky top-0 bg-dark-card border-b border-dark-border">
                            <tr>
                                <th className="p-3">Item Name</th>
                                <th className="p-3">Category</th>
                                <th className="p-3 text-right">Qty</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {equipment.map(item => (
                                <tr key={item.id} className="hover:bg-white/5">
                                    <td className="p-3 font-semibold">{item.name}</td>
                                    <td className="p-3">{item.category}</td>
                                    <td className="p-3 text-right font-mono">{item.quantity}</td>
                                    <td className="p-3"><EquipmentStatusPill status={item.status} /></td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleOpenModal(item)} disabled={!canEdit} className="text-xs bg-primary text-white px-2 py-1 rounded-md disabled:opacity-50">View / Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && editingItem && (
                 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-dark-border">
                           <h2 className="text-xl font-bold">{equipment.some(e => e.id === editingItem.id) ? 'Edit Equipment' : 'Add New Equipment'}</h2>
                           <button onClick={handleCloseModal}><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <input value={editingItem.name} onChange={e => handleModalChange('name', e.target.value)} placeholder="Name" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                            <textarea value={editingItem.description} onChange={e => handleModalChange('description', e.target.value)} placeholder="Description" className="w-full bg-dark-bg p-2 rounded-md h-24 border border-dark-border" />
                            <div className="grid grid-cols-2 gap-4">
                                <input value={editingItem.quantity} type="number" onChange={e => handleModalChange('quantity', parseInt(e.target.value) || 0)} placeholder="Quantity" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                                <input value={editingItem.price} type="number" step="0.01" onChange={e => handleModalChange('price', parseFloat(e.target.value) || 0)} placeholder="Price" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                                <select value={editingItem.category} onChange={e => handleModalChange('category', e.target.value as EquipmentInventoryItem['category'])} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border">
                                    <option value="Kitchen">Kitchen</option><option value="Bar">Bar</option><option value="Dining">Dining</option><option value="General">General</option><option value="Cleaning">Cleaning</option>
                                </select>
                                <select value={editingItem.status} onChange={e => handleModalChange('status', e.target.value as EquipmentStatus)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border">
                                    <option value="Operational">Operational</option><option value="Maintenance Required">Maintenance Required</option><option value="Out of Service">Out of Service</option><option value="Broken">Broken</option><option value="Lost">Lost</option><option value="Retired">Retired</option>
                                </select>
                                <input value={editingItem.purchaseDate} type="date" onChange={e => handleModalChange('purchaseDate', e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                                <input value={editingItem.size || ''} onChange={e => handleModalChange('size', e.target.value)} placeholder="Size (e.g., 14-inch)" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                                <input value={editingItem.color || ''} onChange={e => handleModalChange('color', e.target.value)} placeholder="Color" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                            </div>
                        </div>
                        <div className="p-4 border-t border-dark-border flex justify-end">
                            <button onClick={handleSaveItem} className="bg-success font-bold py-2 px-6 rounded-lg">Save</button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default EquipmentInventoryPage;