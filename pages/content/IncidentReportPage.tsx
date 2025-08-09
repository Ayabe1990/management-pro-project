import React, { useState, useEffect, useMemo } from 'react';
import { IncidentReport, StaffMember, MasterInventoryItem as InventoryItem, WastageLog, IncidentReason } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { initialStaff } from './data/staff';
import { initialInventory } from './data/inventory';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const IncidentReportPage: React.FC = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<IncidentReport[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);

    // Form state
    const [involvedStaffIds, setInvolvedStaffIds] = useState<string[]>([]);
    const [menuItemId, setMenuItemId] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState<IncidentReason>('Other');
    const [notes, setNotes] = useState('');
    const [createWasteLog, setCreateWasteLog] = useState(false);

    useEffect(() => {
        setReports(JSON.parse(localStorage.getItem('incident_reports') || '[]'));
        setStaff(JSON.parse(localStorage.getItem('staff_members') || JSON.stringify(initialStaff)));
        setInventory(JSON.parse(localStorage.getItem('inventory') || JSON.stringify(initialInventory)));
    }, []);

    const finishedGoods = useMemo(() => inventory.filter(i => i.type === 'finished'), [inventory]);
    
    const handleStaffSelect = (staffId: string) => {
        setInvolvedStaffIds(prev => 
            prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || involvedStaffIds.length === 0 || !reason) {
            alert("Please select staff and provide a reason.");
            return;
        }

        const newReport: IncidentReport = {
            id: uuidv4(),
            date: new Date().toISOString(),
            involvedStaffIds,
            menuItemId: menuItemId || undefined,
            quantity: menuItemId ? quantity : undefined,
            reason,
            notes,
            createdWasteLog: createWasteLog,
            loggedBy: user.id
        };
        
        const updatedReports = [newReport, ...reports];
        setReports(updatedReports);
        localStorage.setItem('incident_reports', JSON.stringify(updatedReports));

        if (createWasteLog && menuItemId) {
            const item = inventory.find(i => i.id === menuItemId);
            if (item) {
                const wasteCost = (item.costPerUnit || 0) * quantity;
                const newWasteLog: WastageLog = {
                    id: `WLOG-${uuidv4()}`, date: new Date().toISOString(), itemId: item.id,
                    quantity: quantity, reason: 'Breakage', cost: wasteCost, loggedBy: user.id
                };
                const allWasteLogs = JSON.parse(localStorage.getItem('waste_logs') || '[]');
                localStorage.setItem('waste_logs', JSON.stringify([newWasteLog, ...allWasteLogs]));
                // Note: Actual inventory depletion for this should be handled here or by the manager.
                // For simplicity, we are just creating the log.
            }
        }
        
        alert("Incident report submitted successfully.");
        setInvolvedStaffIds([]); setMenuItemId(''); setQuantity(1); setReason('Other'); setNotes(''); setCreateWasteLog(false);
    };

    const reasonOptions: IncidentReason[] = ['Breakage', 'Spillage', 'Cooking Error', 'Customer Complaint', 'Staff Misconduct', 'Other'];

    return (
        <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display">Incident Reports</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                <div className="lg:col-span-1 bg-dark-card border border-dark-border rounded-2xl p-6 h-fit">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Log New Incident</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-medium-text mb-2 block">Involved Staff</label>
                            <div className="max-h-32 overflow-y-auto bg-dark-bg p-2 rounded-md border border-dark-border space-y-1">
                                {staff.map(s => (
                                    <label key={s.id} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${involvedStaffIds.includes(s.id) ? 'bg-primary' : 'hover:bg-white/10'}`}>
                                        <input type="checkbox" checked={involvedStaffIds.includes(s.id)} onChange={() => handleStaffSelect(s.id)} className="hidden" />
                                        <span>{s.name} <span className="text-xs text-medium-text">({s.role})</span></span>
                                    </label>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="text-sm text-medium-text">Reason / Title</label>
                            <select value={reason} onChange={e => setReason(e.target.value as IncidentReason)} required className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 mt-1">
                                {reasonOptions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-medium-text">Related Menu Item (Optional)</label>
                             <select value={menuItemId} onChange={e => setMenuItemId(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 mt-1">
                                <option value="">None</option>
                                {finishedGoods.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                             </select>
                        </div>
                        {menuItemId && (
                             <div className="pl-4 border-l-2 border-dark-border">
                                 <label className="text-sm text-medium-text">Quantity of Item</label>
                                 <input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} min="1" className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 mt-1" />
                                 <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                     <input type="checkbox" checked={createWasteLog} onChange={e => setCreateWasteLog(e.target.checked)} className="h-4 w-4 bg-dark-border rounded-md border-dark-border" />
                                     <span className="text-sm text-medium-text">Create Waste Log for this incident?</span>
                                 </label>
                             </div>
                        )}
                        <div>
                            <label className="text-sm text-medium-text">Notes / Description</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg py-2 px-3 mt-1 h-24"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-success hover:bg-success/80 text-white font-bold py-3 rounded-lg transition">Submit Report</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-4 flex flex-col">
                     <h3 className="text-xl font-semibold mb-4 text-primary p-2">Recent Incident Reports</h3>
                    <div className="overflow-y-auto flex-grow max-h-[calc(100vh-250px)] hide-scrollbar">
                        <ul className="space-y-4">
                            {reports.length === 0 && <li className="text-center p-8 text-medium-text">No incident reports logged yet.</li>}
                            {reports.map(report => (
                                <li key={report.id} className="bg-dark-bg/50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-lg">{report.reason}</h4>
                                        <span className="text-xs text-medium-text">{new Date(report.date).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-light-text my-2">{report.notes}</p>
                                    <div className="text-xs space-y-1 border-t border-dark-border pt-2 mt-2">
                                        <p><span className="font-semibold text-medium-text">Involved:</span> {report.involvedStaffIds.map(id => staff.find(s => s.id === id)?.name || 'Unknown').join(', ')}</p>
                                        {report.menuItemId && <p><span className="font-semibold text-medium-text">Item:</span> {report.quantity}x {inventory.find(i => i.id === report.menuItemId)?.name}</p>}
                                        {report.createdWasteLog && <p className="text-warning">A waste log was created for this incident.</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncidentReportPage;