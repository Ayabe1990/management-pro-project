import React, { useState } from 'react';
import { MarketListItem, MarketCategory, ItemPriority } from '../types.ts';
import { XMarkIcon } from './icons.tsx';

interface AddMarketItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: MarketListItem) => void;
    existingItems: MarketListItem[];
}

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const AddMarketItemModal: React.FC<AddMarketItemModalProps> = ({ isOpen, onClose, onSave, existingItems }) => {
    const [item, setItem] = useState<Omit<MarketListItem, 'id' | 'status'>>({
        name: '', brand: '', supplier: '', price: 0,
        category: 'Dry Goods', priority: 'Essential'
    });
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (field: keyof typeof item, value: any) => {
        setItem(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setError('');
        if (!item.name || !item.supplier || item.price <= 0) {
            setError('Name, Supplier, and a valid Price are required.');
            return;
        }
        
        // Duplicate check as requested
        const isDuplicate = existingItems.some(existing => 
            existing.name.toLowerCase() === item.name.toLowerCase() &&
            existing.brand?.toLowerCase() === item.brand?.toLowerCase() &&
            existing.supplier.toLowerCase() === item.supplier.toLowerCase()
        );

        if (isDuplicate) {
            setError('This exact item (name, brand, supplier) already exists in the market list.');
            return;
        }

        const newItem: MarketListItem = {
            ...item,
            id: `ML-${uuidv4().slice(0, 8).toUpperCase()}`,
            status: 'Not Ordered',
        };
        onSave(newItem);
    };

    const categories: MarketCategory[] = ['Dry Goods', 'Wet Goods', 'Vegetables', 'Fruits', 'Liquor'];
    const priorities: ItemPriority[] = ['Essential', 'Recommended', 'Optional'];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-border">
                    <h2 className="text-xl font-bold">Add Item to Market List</h2>
                    <button onClick={onClose}><XMarkIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input value={item.name} onChange={e => handleChange('name', e.target.value)} placeholder="Item Name" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        <input value={item.brand} onChange={e => handleChange('brand', e.target.value)} placeholder="Brand (Optional)" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input value={item.supplier} onChange={e => handleChange('supplier', e.target.value)} placeholder="Supplier" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        <input type="number" step="0.01" value={item.price || ''} onChange={e => handleChange('price', parseFloat(e.target.value))} placeholder="Price" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <select value={item.category} onChange={e => handleChange('category', e.target.value as MarketCategory)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <select value={item.priority} onChange={e => handleChange('priority', e.target.value as ItemPriority)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border">{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select>
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

export default AddMarketItemModal;