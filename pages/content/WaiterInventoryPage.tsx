import React, { useState, useEffect, useMemo } from 'react';
import { EquipmentInventoryItem, UserRole } from '../../types.ts';
import { initialEquipment } from './data/equipment.ts';

const EquipmentStatusPill: React.FC<{ status: EquipmentInventoryItem['status'] }> = ({ status }) => {
    const statusStyles: Record<EquipmentInventoryItem['status'], string> = {
        Operational: 'bg-success/20 text-success',
        'Maintenance Required': 'bg-warning/20 text-warning',
        'Out of Service': 'bg-danger/20 text-danger',
        Broken: 'bg-danger/20 text-danger',
        Lost: 'bg-danger/20 text-danger',
        Retired: 'bg-medium-text/20 text-medium-text',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>{status}</span>;
}

const WaiterInventoryPage: React.FC = () => {
    const [equipment, setEquipment] = useState<EquipmentInventoryItem[]>([]);

    useEffect(() => {
        const storedEquipment = localStorage.getItem('equipment_inventory');
        const allEquipment = storedEquipment ? JSON.parse(storedEquipment) : initialEquipment;
        
        // Filter for items relevant to waiters
        const waiterEquipment = allEquipment.filter((item: EquipmentInventoryItem) => 
            item.category === 'Dining' || item.issuedTo === UserRole.Waiter
        );
        setEquipment(waiterEquipment);
    }, []);

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold font-display">My Equipment & Supplies</h2>
            </div>
            <div className="flex-grow bg-dark-card border border-dark-border rounded-2xl p-4 overflow-hidden">
                <div className="h-full overflow-auto hide-scrollbar">
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="sticky top-0 bg-dark-card border-b border-dark-border">
                            <tr>
                                <th className="p-3">Item Name</th>
                                <th className="p-3">Category</th>
                                <th className="p-3 text-right">Qty</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {equipment.map(item => (
                                <tr key={item.id} className="hover:bg-white/5">
                                    <td className="p-3 font-semibold">{item.name}</td>
                                    <td className="p-3">{item.category}</td>
                                    <td className="p-3 text-right font-mono">{item.quantity}</td>
                                    <td className="p-3"><EquipmentStatusPill status={item.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WaiterInventoryPage;