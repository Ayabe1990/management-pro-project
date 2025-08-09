import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { ServiceChargeReleaseRequest, User, UserRole } from '../../types.ts';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const StatusPill: React.FC<{ status: 'Pending' | 'Approved' | 'Rejected' }> = ({ status }) => {
    const statusStyles = {
        Pending: 'bg-warning/20 text-warning',
        Approved: 'bg-success/20 text-success',
        Rejected: 'bg-danger/20 text-danger',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>{status}</span>;
}

const ManagerView: React.FC<{ users: User[], user: User, canEditRules: boolean }> = ({ users, user, canEditRules }) => {
    const [requests, setRequests] = useState<ServiceChargeReleaseRequest[]>([]);
    const [periodStartDate, setPeriodStartDate] = useState('');
    const [periodEndDate, setPeriodEndDate] = useState('');
    const [totalServiceCharge, setTotalServiceCharge] = useState(0);

    const loadRequests = useCallback(() => {
        const all: ServiceChargeReleaseRequest[] = JSON.parse(localStorage.getItem('service_charge_release_requests') || '[]');
        setRequests(all.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, []);
    useEffect(() => { loadRequests(); }, [loadRequests]);
    
    const eligibleStaff = useMemo(() => users.filter(u => [UserRole.Waiter, UserRole.Bartender, UserRole.Kitchen, UserRole.Security, UserRole.Manager].includes(u.role)), [users]);
    const distribution = useMemo(() => {
        if (totalServiceCharge <= 0 || eligibleStaff.length === 0) return [];
        const shareAmount = totalServiceCharge / eligibleStaff.length;
        return eligibleStaff.map(staff => ({ staffId: staff.id, staffName: staff.name, shareAmount }));
    }, [totalServiceCharge, eligibleStaff]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!periodStartDate || !periodEndDate || totalServiceCharge <= 0) return;
        
        // In a real app, Owner approval would be a separate step. Here we simplify it.
        const newRequest: ServiceChargeReleaseRequest = {
            id: `SCR-${uuidv4().slice(0, 8)}`, requestedBy: user.id, date: new Date().toISOString(),
            periodStartDate, periodEndDate, totalServiceCharge, distribution, 
            status: user.role === UserRole.Owner ? 'Approved' : 'Pending'
        };

        const all = JSON.parse(localStorage.getItem('service_charge_release_requests') || '[]');
        localStorage.setItem('service_charge_release_requests', JSON.stringify([newRequest, ...all]));
        
        alert(`Request submitted for ${user.role === UserRole.Owner ? 'release' : 'approval'}.`);
        setPeriodStartDate(''); setPeriodEndDate(''); setTotalServiceCharge(0);
        loadRequests();
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-dark-card border border-dark-border rounded-2xl p-6 h-fit">
                <h3 className="text-xl font-semibold mb-4 text-primary">New Release Request</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-medium-text">Period Start Date</label>
                        <input type="date" value={periodStartDate} onChange={e => setPeriodStartDate(e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1" required />
                    </div>
                    <div>
                        <label className="text-sm text-medium-text">Period End Date</label>
                        <input type="date" value={periodEndDate} onChange={e => setPeriodEndDate(e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1" required />
                    </div>
                    <div>
                        <label className="text-sm text-medium-text">Total Service Charge Pool</label>
                        <input type="number" value={totalServiceCharge} onChange={e => setTotalServiceCharge(parseFloat(e.target.value) || 0)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1" placeholder="e.g. 50000" required />
                    </div>
                    <div className="p-2 bg-dark-bg rounded-md">
                        <h4 className="text-sm font-semibold">Distribution Preview ({distribution.length} staff):</h4>
                        <p className="text-xs text-medium-text">Each gets ~₱{(totalServiceCharge / eligibleStaff.length || 0).toFixed(2)}</p>
                    </div>
                    <button type="submit" disabled={!canEditRules} className="w-full bg-success hover:bg-success/80 font-bold py-3 rounded-lg transition disabled:bg-dark-border disabled:cursor-not-allowed">
                        {user.role === UserRole.Owner ? 'Approve & Release' : 'Submit for Approval'}
                    </button>
                    {!canEditRules && <p className="text-xs text-danger text-center">Owner has disabled your permission to submit new requests.</p>}
                </form>
            </div>
            <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-4 flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-primary p-2">History</h3>
                <div className="overflow-auto hide-scrollbar flex-grow">
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="sticky top-0 bg-dark-card">
                            <tr className="border-b border-dark-border">
                                <th className="p-2">Date</th><th className="p-2">Period</th><th className="p-2 text-right">Amount</th><th className="p-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td className="p-2 text-sm">{new Date(req.date).toLocaleDateString()}</td>
                                    <td className="p-2 text-sm">{new Date(req.periodStartDate).toLocaleDateString()} - {new Date(req.periodEndDate).toLocaleDateString()}</td>
                                    <td className="p-2 text-right font-mono">₱{req.totalServiceCharge.toLocaleString()}</td>
                                    <td className="p-2 text-center"><StatusPill status={req.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StaffView: React.FC<{ user: User }> = ({ user }) => {
    const [myShares, setMyShares] = useState<any[]>([]);
    useEffect(() => {
        const allReqs: ServiceChargeReleaseRequest[] = JSON.parse(localStorage.getItem('service_charge_release_requests') || '[]');
        const approvedAndRelevant = allReqs
            .filter(r => r.status === 'Approved')
            .map(r => ({
                ...r,
                myShare: r.distribution.find(d => d.staffId === user.id)?.shareAmount
            }))
            .filter(r => r.myShare);
        setMyShares(approvedAndRelevant.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, [user.id]);
    
    return (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 flex flex-col">
            <h3 className="text-xl font-semibold mb-4 text-primary p-2">My Service Charge History</h3>
            <div className="overflow-auto hide-scrollbar flex-grow">
                <table className="w-full text-left min-w-[500px]">
                    <thead className="sticky top-0 bg-dark-card">
                        <tr className="border-b border-dark-border"><th className="p-2">Release Date</th><th className="p-2">Period Covered</th><th className="p-2 text-right">My Share</th></tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                        {myShares.map(req => (
                            <tr key={req.id}>
                                <td className="p-2">{new Date(req.date).toLocaleDateString()}</td>
                                <td className="p-2">{new Date(req.periodStartDate).toLocaleDateString()} - {new Date(req.periodEndDate).toLocaleDateString()}</td>
                                <td className="p-2 text-right font-mono font-bold text-success">₱{req.myShare.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {myShares.length === 0 && <p className="text-center text-medium-text py-8">No service charge releases found.</p>}
            </div>
        </div>
    )
}

const ServiceChargePage: React.FC = () => {
    const { user, users } = useAuth();
    const [settings, setSettings] = useState({ managerCanEditServiceCharge: true });

    useEffect(() => {
        const stored = localStorage.getItem('app_settings');
        if (stored) setSettings(JSON.parse(stored));
    }, []);

    const renderContent = () => {
        if (!user) return null;
        if (user.role === UserRole.Owner || user.role === UserRole.Manager || user.role === UserRole.HR || user.role === UserRole.SuperDeveloper || user.role === UserRole.Developer) {
            return <ManagerView users={users} user={user} canEditRules={settings.managerCanEditServiceCharge} />;
        }
        return <StaffView user={user} />;
    };
    
    return (
         <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display">Service Charge</h2>
            {renderContent()}
        </div>
    );
};

export default ServiceChargePage;