import React, { useState, useEffect, useMemo } from 'react';
import { MarketListItem, MarketCategory, ItemPriority, OrderStatus } from '../../types.ts';
import { initialMarketList } from './data/market_list.ts';
import AddMarketItemModal from '../../components/AddMarketItemModal.tsx';

const MarketListPage: React.FC = () => {
    const [marketList, setMarketList] = useState<MarketListItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<MarketCategory | 'All'>('All');
    const [priorityFilter, setPriorityFilter] = useState<ItemPriority | 'All'>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const storedList = localStorage.getItem('market_list');
        setMarketList(storedList ? JSON.parse(storedList) : initialMarketList);
    }, []);

    const saveList = (list: MarketListItem[]) => {
        setMarketList(list);
        localStorage.setItem('market_list', JSON.stringify(list));
    };

    const filteredList = useMemo(() => {
        return marketList.filter(item => 
            (item.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (categoryFilter === 'All' || item.category === categoryFilter) &&
            (priorityFilter === 'All' || item.priority === priorityFilter)
        );
    }, [marketList, searchTerm, categoryFilter, priorityFilter]);

    const handleStatusChange = (id: string, newStatus: OrderStatus) => {
        const updatedList = marketList.map(item => item.id === id ? {...item, status: newStatus} : item);
        saveList(updatedList);
    };

    const handleAddItem = (newItem: MarketListItem) => {
        const updatedList = [...marketList, newItem];
        saveList(updatedList);
        setIsModalOpen(false);
    };

    const statusClasses: Record<OrderStatus, string> = {
        'Not Ordered': 'bg-dark-bg border-dark-border',
        'Ordered': 'bg-primary/80 border-primary',
        'Delivered': 'bg-success/80 border-success',
    };
    
    const priorityClasses: Record<ItemPriority, string> = {
        'Essential': 'bg-danger/20 text-danger',
        'Recommended': 'bg-warning/20 text-warning',
        'Optional': 'bg-primary/20 text-primary',
    }
    
    const categories: (MarketCategory | 'All')[] = ['All', 'Dry Goods', 'Wet Goods', 'Vegetables', 'Fruits', 'Liquor'];
    const priorities: (ItemPriority | 'All')[] = ['All', 'Essential', 'Recommended', 'Optional'];
    const statuses: OrderStatus[] = ['Not Ordered', 'Ordered', 'Delivered'];

    return (
        <>
            <div className="h-full flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold font-display">Market List</h2>
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition">Add Item</button>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-grow flex flex-col">
                    <div className="flex flex-wrap gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full sm:w-1/3 bg-dark-bg border border-dark-border p-2 rounded-lg"
                        />
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value as MarketCategory | 'All')}
                            className="bg-dark-bg border border-dark-border p-2 rounded-lg"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                         <select
                            value={priorityFilter}
                            onChange={e => setPriorityFilter(e.target.value as ItemPriority | 'All')}
                            className="bg-dark-bg border border-dark-border p-2 rounded-lg"
                        >
                            {priorities.map(prio => <option key={prio} value={prio}>{prio} Priority</option>)}
                        </select>
                    </div>
                    <div className="overflow-auto flex-grow hide-scrollbar">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="sticky top-0 bg-dark-card border-b border-dark-border">
                                <tr>
                                    <th className="p-3">Item Name</th>
                                    <th className="p-3">Priority</th>
                                    <th className="p-3">Supplier</th>
                                    <th className="p-3 text-right">Price</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {filteredList.map(item => (
                                    <tr key={item.id} className="hover:bg-white/5">
                                        <td className="p-3 font-semibold">
                                            {item.name}
                                            <p className="text-xs text-medium-text font-normal">{item.brand}</p>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityClasses[item.priority]}`}>{item.priority}</span>
                                        </td>
                                        <td className="p-3 text-medium-text">{item.supplier}</td>
                                        <td className="p-3 text-right font-mono">₱{item.price.toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <select
                                                value={item.status}
                                                onChange={e => handleStatusChange(item.id, e.target.value as OrderStatus)}
                                                className={`text-white text-xs p-1 rounded-md border appearance-none ${statusClasses[item.status]}`}
                                            >
                                                {statuses.map(s => <option key={s} value={s} className="bg-dark-card">{s}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <AddMarketItemModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleAddItem}
                    existingItems={marketList}
                />
            )}
        </>
    );
};

export default MarketListPage;