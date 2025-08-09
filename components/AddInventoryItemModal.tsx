import React, { useState } from 'react';
import { MasterInventoryItem, Department, InventoryUnit } from '../types.ts';
import { XMarkIcon } from './icons.tsx';

interface AddInventoryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: MasterInventoryItem) => void;
    existingItems: MasterInventoryItem[];
}

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const AddInventoryItemModal: React.FC<AddInventoryItemModalProps> = ({ isOpen, onClose, onSave, existingItems }) => {
    const [item, setItem] = useState<Partial<MasterInventoryItem>>({
        id: `INV-${uuidv4().slice(0, 8).toUpperCase()}`,
        name: '', brand: '', category: '', department: 'General', type: 'raw', stock: 0,
        unitType: 'pcs', packagingType: 'pack', caseQuantity: 1, supplier: '',
        barcode: '', costPerUnit: 0, reorderLevel: 0, isArchived: false, isEnabledOnPOS: false
    });
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (field: keyof MasterInventoryItem, value: any) => {
        setItem(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setError('');
        if (!item.name || !item.category || !item.department) {
            setError('Name, Category, and Department are required.');
            return;
        }
        if (existingItems.some(i => i.name.toLowerCase() === item.name?.toLowerCase() && i.brand.toLowerCase() === item.brand?.toLowerCase())) {
            setError('An item with this name and brand already exists.');
            return;
        }
        onSave(item as MasterInventoryItem);
    };
    
    const unitTypes: InventoryUnit[] = ['pcs', 'kg', 'g', 'liter', 'ml', 'bottle', 'box', 'pack', 'bundle', 'can'];
    const departments: Department[] = ['General', 'Bar', 'Kitchen', 'Admin'];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h2 className="text-xl font-bold">Add New Master Inventory Item</h2>
                    <button onClick={onClose}><XMarkIcon /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <input value={item.name} onChange={e => handleChange('name', e.target.value)} placeholder="Item Name" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        <input value={item.brand} onChange={e => handleChange('brand', e.target.value)} placeholder="Brand" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        <input value={item.category} onChange={e => handleChange('category', e.target.value)} placeholder="Category (e.g., Spirits, Meat)" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        <select value={item.department} onChange={e => handleChange('department', e.target.value as Department)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border">{departments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    </div>
                     <div className="grid grid-cols-3 gap-4">
                        <input type="number" value={item.stock || ''} onChange={e => handleChange('stock', parseInt(e.target.value))} placeholder="Initial Stock" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        <select value={item.unitType} onChange={e => handleChange('unitType', e.target.value as InventoryUnit)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border">{unitTypes.map(u => <option key={u} value={u}>{u}</option>)}</select>
                        <input type="number" value={item.reorderLevel || ''} onChange={e => handleChange('reorderLevel', parseInt(e.target.value))} placeholder="Reorder Level" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input value={item.supplier} onChange={e => handleChange('supplier', e.target.value)} placeholder="Supplier" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        <input type="number" step="0.01" value={item.costPerUnit || ''} onChange={e => handleChange('costPerUnit', parseFloat(e.target.value))} placeholder="Cost per Unit" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                    </div>
                     {error && <p className="text-sm text-center text-danger">{error}</p>}
                </div>
                <div className="p-4 border-t border-dark-border flex justify-end">
                    <button onClick={handleSave} className="bg-success font-bold py-2 px-6 rounded-lg">Save Item</button>
                </div>
            </div>
        </div>
    );
};

export default AddInventoryItemModal;