import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MasterInventoryItem, Department } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { UserRole } from '../../types.ts';

const DepartmentInventoryPage: React.FC = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);

    const userDepartment = useMemo((): Department | null => {
        if (user?.role === UserRole.Kitchen) return 'Kitchen';
        if (user?.role === UserRole.Bartender) return 'Bar';
        return null; // For other roles, or adjust as needed
    }, [user]);

    const loadInventory = useCallback(() => {
        const data = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        setInventory(data);
    }, []);

    useEffect(() => {
        loadInventory();
        document.addEventListener('data_updated', loadInventory);
        return () => document.removeEventListener('data_updated', loadInventory);
    }, [loadInventory]);

    const departmentInventory = useMemo(() => {
        if (!userDepartment) return [];
        return inventory.filter(item => item.department === userDepartment || item.department === 'General');
    }, [inventory, userDepartment]);

    return (
        <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display">{userDepartment} Inventory</h2>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-grow overflow-hidden">
                <div className="h-full overflow-auto hide-scrollbar">
                    <table className="w-full text-left min-w-[400px]">
                        <thead className="sticky top-0 bg-dark-card">
                            <tr className="border-b border-dark-border">
                                <th className="p-3">Item Name</th>
                                <th className="p-3 text-right">Stock Level</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {departmentInventory.map(item => (
                                <tr key={item.id} className="hover:bg-white/5">
                                    <td className="p-3 font-semibold">{item.name}</td>
                                    <td className="p-3 text-right font-mono">{item.stock} {item.packagingType}</td>
                                    <td className="p-3 text-center">
                                        <button className="text-xs bg-warning text-black px-2 py-1 rounded-md">Log Usage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DepartmentInventoryPage;