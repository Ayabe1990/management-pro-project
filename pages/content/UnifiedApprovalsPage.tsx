import React, { useState, useEffect, useCallback } from 'react';
import { StockRequest, EndOfDaySummary, Recipe, ScheduleApprovalRequest, User, MasterInventoryItem, OvertimeRequest } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { logActivity } from '../../utils/activityLogger.ts';

const ActionButtons: React.FC<{ onApprove: () => void, onReject: () => void }> = ({ onApprove, onReject }) => (
    <div className="flex gap-2 mt-2">
        <button onClick={onApprove} className="bg-success hover:bg-success/80 text-white px-3 py-1 text-sm rounded-md font-semibold transition">Approve</button>
        <button onClick={onReject} className="bg-danger hover:bg-danger/80 text-white px-3 py-1 text-sm rounded-md font-semibold transition">Reject</button>
    </div>
);

const ApprovalCard: React.FC<{ title: string; subtitle: string; children: React.ReactNode; onApprove: () => void; onReject: () => void; }> = ({ title, subtitle, children, onApprove, onReject }) => (
    <div className="bg-dark-bg p-4 rounded-lg mb-4 animate-fade-in border border-dark-border">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-lg text-primary">{title}</h4>
                <p className="text-xs text-medium-text">{subtitle}</p>
            </div>
            <ActionButtons onApprove={onApprove} onReject={onReject} />
        </div>
        <div className="border-t border-dark-border mt-3 pt-3">
            {children}
        </div>
    </div>
);

const NoPendingItems: React.FC<{ type: string }> = ({ type }) => (
    <div className="text-medium-text text-center py-10">No pending {type} for approval.</div>
);


// --- TAB COMPONENTS ---

const ApproveEOD: React.FC = () => {
    const { user, users } = useAuth();
    const [summaries, setSummaries] = useState<EndOfDaySummary[]>([]);

    const loadData = useCallback(() => {
        const data = JSON.parse(localStorage.getItem('eod_summaries') || '[]') as EndOfDaySummary[];
        setSummaries(data.filter(s => s.status === 'Pending'));
    }, []);
    useEffect(loadData, [loadData]);

    const handleUpdate = (id: string, status: 'Approved' | 'Rejected') => {
        const all = JSON.parse(localStorage.getItem('eod_summaries') || '[]') as EndOfDaySummary[];
        const summary = all.find(s => s.id === id);
        if(summary) {
            logActivity(`${status} EOD Summary for ${new Date(summary.date).toLocaleDateString()}`, user);
        }
        const updated = all.map(s => s.id === id ? { ...s, status } : s);
        localStorage.setItem('eod_summaries', JSON.stringify(updated));
        loadData();
    };

    if (summaries.length === 0) return <NoPendingItems type="EOD summaries" />;
    return <div>{summaries.map(s => (
        <ApprovalCard key={s.id} title={`EOD Summary - ${new Date(s.date).toLocaleDateString()}`} subtitle={`Submitted by ${users.find(u => u.id === s.submittedBy)?.name || 'Unknown'}`} onApprove={() => handleUpdate(s.id, 'Approved')} onReject={() => handleUpdate(s.id, 'Rejected')}>
            <p className="text-sm text-light-text">{s.notes}</p>
        </ApprovalCard>
    ))}</div>;
};

const ApproveRecipes: React.FC = () => {
    const { user } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const loadData = useCallback(() => {
        const data = JSON.parse(localStorage.getItem('recipes') || '[]') as Recipe[];
        setRecipes(data.filter(r => r.status === 'Pending Approval'));
    }, []);
    useEffect(loadData, [loadData]);


    const handleUpdate = (id: string, status: 'Approved' | 'Rejected') => {
        const all = JSON.parse(localStorage.getItem('recipes') || '[]') as Recipe[];
        const recipe = all.find(r => r.id === id);
        if(recipe) {
            logActivity(`${status} recipe: ${recipe.name}`, user);
        }
        const updated = all.map(r => r.id === id ? { ...r, status } : r);
        localStorage.setItem('recipes', JSON.stringify(updated));
        loadData();
    };

    if (recipes.length === 0) return <NoPendingItems type="recipes" />;
    return <div>{recipes.map(r => (
        <ApprovalCard key={r.id} title={`New Recipe: ${r.name}`} subtitle={`Department: ${r.department}`} onApprove={() => handleUpdate(r.id, 'Approved')} onReject={() => handleUpdate(r.id, 'Rejected')}>
             <p className="text-sm text-light-text">Yields: {r.yieldQty} units. Contains {r.ingredients.length} ingredients.</p>
        </ApprovalCard>
    ))}</div>;
};

const ApproveSchedules: React.FC = () => {
    const { user, users } = useAuth();
    const [requests, setRequests] = useState<ScheduleApprovalRequest[]>([]);
    const loadData = useCallback(() => {
        const data = JSON.parse(localStorage.getItem('schedule_approvals') || '[]') as ScheduleApprovalRequest[];
        setRequests(data.filter(s => s.status === 'Pending'));
    }, []);
    useEffect(loadData, [loadData]);

    const handleUpdate = (id: string, status: 'Approved' | 'Rejected') => {
        const all = JSON.parse(localStorage.getItem('schedule_approvals') || '[]') as ScheduleApprovalRequest[];
        const req = all.find(r => r.id === id);
        if (!req) return;

        logActivity(`${status} schedule for week of ${new Date(req.weekStartDate).toLocaleDateString()}`, user);
        
        if (status === 'Approved') {
            localStorage.setItem('active_schedule', JSON.stringify(req.schedule));
        }

        const updated = all.map(r => r.id === id ? { ...r, status } : r);
        localStorage.setItem('schedule_approvals', JSON.stringify(updated));
        loadData();
    };

    if (requests.length === 0) return <NoPendingItems type="schedules" />;
    return <div>{requests.map(req => (
        <ApprovalCard key={req.id} title={`Schedule for week of ${new Date(req.weekStartDate).toLocaleDateString()}`} subtitle={`Submitted by ${users.find(u => u.id === req.managerId)?.name || 'Unknown'}`} onApprove={() => handleUpdate(req.id, 'Approved')} onReject={() => handleUpdate(req.id, 'Rejected')}>
            <p className="text-sm text-light-text">{req.schedule.shifts.length} total shifts scheduled.</p>
        </ApprovalCard>
    ))}</div>;
};


const ApproveStock: React.FC = () => {
    const { user, users } = useAuth();
    const [requests, setRequests] = useState<StockRequest[]>([]);
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);

    const loadData = useCallback(() => {
        const reqData = JSON.parse(localStorage.getItem('stock_requests') || '[]') as StockRequest[];
        setRequests(reqData.filter(r => r.status === 'Pending'));
        const invData = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        setInventory(invData);
    }, []);
    useEffect(() => { loadData() }, [loadData]);

    const handleUpdate = (id: string, status: 'Approved' | 'Rejected') => {
        const allRequests = JSON.parse(localStorage.getItem('stock_requests') || '[]') as StockRequest[];
        const req = allRequests.find(r => r.id === id);
        if(req) {
            logActivity(`${status} stock request for ${req.department} (ID: ${req.id.slice(0, 8)})`, user);
        }
        const updated = allRequests.map(r => r.id === id ? { ...r, status } : r);
        localStorage.setItem('stock_requests', JSON.stringify(updated));
        loadData();
    };

    const getItemName = (id: string) => inventory.find(i => i.id === id)?.name || id;

    if (requests.length === 0) return <NoPendingItems type="stock requests" />;
    return <div>
        {requests.map(req => (
            <ApprovalCard key={req.id} title={`${req.department} Stock Request`} subtitle={`From ${users.find(u => u.id === req.requestedBy)?.name || 'Unknown'}`} onApprove={() => handleUpdate(req.id, 'Approved')} onReject={() => handleUpdate(req.id, 'Rejected')}>
                <ul className="text-sm list-disc list-inside my-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {req.items.map(i => <li key={i.itemId}>{i.quantity}x {getItemName(i.itemId)}</li>)}
                </ul>
            </ApprovalCard>
        ))}
    </div>;
};

const ApproveOvertime: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<OvertimeRequest[]>([]);

    const loadData = useCallback(() => {
        const data = JSON.parse(localStorage.getItem('overtime_requests') || '[]') as OvertimeRequest[];
        setRequests(data.filter(r => r.status === 'Pending'));
    }, []);
    useEffect(loadData, [loadData]);

    const handleUpdate = (id: string, status: 'Approved' | 'Rejected') => {
        const all = JSON.parse(localStorage.getItem('overtime_requests') || '[]') as OvertimeRequest[];
        const req = all.find(r => r.id === id);
        if (req) {
            logActivity(`${status} overtime request for ${req.userName} (${req.requestedMinutes} mins)`, user);
        }
        const updated = all.map(r => r.id === id ? { ...r, status, reviewedBy: user?.id, reviewedAt: new Date().toISOString() } : r);
        localStorage.setItem('overtime_requests', JSON.stringify(updated));
        loadData();
    };

    if (requests.length === 0) return <NoPendingItems type="overtime requests" />;
    return <div>{requests.map(req => (
        <ApprovalCard key={req.id} title={`Overtime for ${req.userName}`} subtitle={`On ${new Date(req.date).toLocaleDateString()}`} onApprove={() => handleUpdate(req.id, 'Approved')} onReject={() => handleUpdate(req.id, 'Rejected')}>
            <p className="text-sm font-semibold">Requested OT: {Math.floor(req.requestedMinutes / 60)}h {req.requestedMinutes % 60}m</p>
            <p className="text-sm text-light-text mt-2"><span className="font-semibold text-medium-text">Reason:</span> {req.reason}</p>
        </ApprovalCard>
    ))}</div>;
};


// --- MAIN COMPONENT ---

type ApprovalTab = 'EOD Summaries' | 'Stock Requests' | 'Recipes' | 'Schedules' | 'Overtime';

const UnifiedApprovalsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ApprovalTab>('Stock Requests');
    const tabs: ApprovalTab[] = ['Stock Requests', 'Overtime', 'EOD Summaries', 'Recipes', 'Schedules'];

    const renderContent = () => {
        switch (activeTab) {
            case 'Stock Requests': return <ApproveStock />;
            case 'EOD Summaries': return <ApproveEOD />;
            case 'Recipes': return <ApproveRecipes />;
            case 'Schedules': return <ApproveSchedules />;
            case 'Overtime': return <ApproveOvertime />;
            default: return null;
        }
    };
    
    return (
        <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display">Approvals Hub</h2>
            <div className="bg-dark-card border border-dark-border rounded-2xl flex-grow flex flex-col">
                <div className="flex-shrink-0 flex border-b border-dark-border overflow-x-auto hide-scrollbar">
                    {tabs.map(tab => (
                         <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-5 font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-medium-text hover:bg-white/5'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default UnifiedApprovalsPage;