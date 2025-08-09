import React, { useState } from 'react';
import { MasterInventoryItem } from '../types.ts';
import { XMarkIcon } from './icons.tsx';

interface MenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: MasterInventoryItem) => void;
    onDelete: (itemId: string) => void;
    itemToEdit: Partial<MasterInventoryItem> | null;
    categories: string[];
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({ isOpen, onClose, onSave, onDelete, itemToEdit, categories }) => {
    const isNew = !itemToEdit?.id?.startsWith('MENU');
    const [item, setItem] = useState<Partial<MasterInventoryItem>>(
        itemToEdit || {
            name: '',
            category: categories.length > 1 ? categories[1] : 'New Category', // Default to first non-'All' category
            price: 0,
            costPerUnit: 0,
            srp: 0,
            isEnabledOnPOS: true,
            department: 'General',
            type: 'finished',
            unitType: 'pcs',
            packagingType: 'pack',
            id: `MENU-NEW-${Date.now()}`,
            brand: 'House Special',
            stock: 999, 
            reorderLevel: 10,
            supplier: 'Internal',
            barcode: '',
            isArchived: false,
            caseQuantity: 1,
        }
    );

    if (!isOpen) return null;

    const handleChange = (field: keyof MasterInventoryItem, value: any) => {
        setItem(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(item as MasterInventoryItem);
        onClose();
    };

    const handleDelete = () => {
        if (item.id && window.confirm(`Are you sure you want to delete ${item.name}? This cannot be undone.`)) {
            onDelete(item.id);
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h2 className="text-xl font-bold">{isNew ? 'Add New Menu Item' : 'Edit Menu Item'}</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-medium-text">Item Name</label>
                            <input type="text" value={item.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1" />
                        </div>
                        <div>
                             <label className="text-sm text-medium-text">Category</label>
                             <select value={item.category} onChange={e => handleChange('category', e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1">
                                {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                             </select>
                        </div>
                    </div>
                    <div className="p-3 bg-dark-bg rounded-lg grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-medium-text">Production Cost</p>
                            <p className="font-mono font-bold text-lg">₱{item.costPerUnit?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-medium-text block">SRP (Optional)</label>
                            <input type="number" step="0.01" value={item.srp || ''} onChange={e => handleChange('srp', parseFloat(e.target.value))} className="w-full bg-dark-border p-1 mt-1 rounded text-center font-mono" placeholder="0.00" />
                        </div>
                         <div>
                            <label className="text-xs text-medium-text block">Selling Price</label>
                            <input type="number" step="0.01" value={item.price || ''} onChange={e => handleChange('price', parseFloat(e.target.value))} className="w-full bg-primary/20 border border-primary p-1 mt-1 rounded text-center font-mono font-bold text-primary" placeholder="0.00" />
                        </div>
                    </div>
                     <div>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" checked={!!item.isEnabledOnPOS} onChange={e => handleChange('isEnabledOnPOS', e.target.checked)} className="h-5 w-5 bg-dark-bg border-dark-border rounded" />
                            <span className="text-sm text-light-text">Enabled on POS</span>
                        </label>
                     </div>
                </div>
                <div className="p-4 border-t border-dark-border flex justify-between">
                    {!isNew ? (
                         <button onClick={handleDelete} className="bg-danger/80 hover:bg-danger text-white font-bold py-2 px-4 rounded-lg transition">Delete Item</button>
                    ) : <div />}
                    <button onClick={handleSave} className="bg-success hover:bg-success/80 text-white font-bold py-2 px-6 rounded-lg transition">Save</button>
                </div>
            </div>
        </div>
    );
};

export default MenuItemModal;
