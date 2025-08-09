import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { User, UserRole, Payslip, PayrollRun } from '../../types.ts';
import EmployeePayrollModal from '../../components/EmployeePayrollModal.tsx';
import { payrollSettings, calculatePayroll } from './data/payroll.ts';

type ManagementTab = 'Employee Management' | 'Run Payroll' | 'Reports' | 'Settings';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const RunPayrollTab: React.FC<{ users: User[], onRunComplete: () => void }> = ({ users, onRunComplete }) => {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);

    const handleRunPayroll = () => {
        if (!startDate || !endDate || !user) {
            alert("Please select a valid date range.");
            return;
        }
        setIsCalculating(true);
        
        // Simulate calculation
        setTimeout(() => {
            const payslips: Payslip[] = users
                .filter(u => u.basicSalary && u.basicSalary > 0)
                .map(employee => calculatePayroll(employee, startDate, endDate));

            const newRun: PayrollRun = {
                id: `PAYRUN-${uuidv4().slice(0, 8)}`,
                cutoffStartDate: startDate,
                cutoffEndDate: endDate,
                dateRun: new Date().toISOString(),
                runBy: user.id,
                payslips: payslips.map(p => ({...p, runId: `PAYRUN-${uuidv4().slice(0, 8)}`})),
            };

            const existingRuns = JSON.parse(localStorage.getItem('payroll_runs') || '[]') as PayrollRun[];
            localStorage.setItem('payroll_runs', JSON.stringify([newRun, ...existingRuns]));

            setIsCalculating(false);
            alert(`Payroll run complete for ${payslips.length} employees.`);
            onRunComplete();
        }, 1500);
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-semibold text-center text-primary">Run New Payroll</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-medium-text">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1" />
                </div>
                <div>
                    <label className="text-sm text-medium-text">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1" />
                </div>
            </div>
            <button onClick={handleRunPayroll} disabled={isCalculating} className="w-full bg-success hover:bg-success/80 font-bold py-3 rounded-lg disabled:opacity-50">
                {isCalculating ? 'Calculating...' : 'Execute Payroll Run'}
            </button>
        </div>
    );
};

const ReportsTab: React.FC<{ runs: PayrollRun[] }> = ({ runs }) => {
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

    if (runs.length === 0) return <div className="text-center text-medium-text">No payroll runs found.</div>;
    
    if (selectedPayslip) {
        return (
            <div>
                <button onClick={() => setSelectedPayslip(null)} className="mb-4 text-primary">{'< Back to Runs'}</button>
                <div className="bg-dark-bg p-4 rounded-lg">
                    <h4 className="font-bold text-lg">Payslip for {selectedPayslip.employeeName}</h4>
                    <p className="text-sm text-medium-text">Period: {new Date(selectedPayslip.cutoffStartDate).toLocaleDateString()} - {new Date(selectedPayslip.cutoffEndDate).toLocaleDateString()}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 font-mono text-sm">
                        <div>
                           <p className="font-bold text-success">Earnings</p>
                           <p>Basic: ₱{selectedPayslip.basicPay.toFixed(2)}</p>
                           <p>Allowances: ₱{selectedPayslip.allowances.toFixed(2)}</p>
                           <p>Overtime: ₱{selectedPayslip.overtimePay.toFixed(2)}</p>
                           <p className="font-bold border-t border-dark-border mt-1 pt-1">Gross: ₱{selectedPayslip.grossPay.toFixed(2)}</p>
                        </div>
                         <div>
                           <p className="font-bold text-danger">Deductions</p>
                           <p>SSS: ₱{selectedPayslip.sssContribution.toFixed(2)}</p>
                           <p>PhilHealth: ₱{selectedPayslip.philhealthContribution.toFixed(2)}</p>
                           <p>Pag-IBIG: ₱{selectedPayslip.pagibigContribution.toFixed(2)}</p>
                           <p>Tax: ₱{selectedPayslip.withholdingTax.toFixed(2)}</p>
                            <p className="font-bold border-t border-dark-border mt-1 pt-1">Total: ₱{selectedPayslip.totalDeductions.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="mt-4 border-t border-dark-border pt-2 text-right">
                        <p className="font-bold text-lg">Net Pay: <span className="text-success">₱{selectedPayslip.netPay.toFixed(2)}</span></p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {runs.map(run => (
                <div key={run.id} className="bg-dark-bg p-4 rounded-lg">
                    <h4 className="font-bold">Run Date: {new Date(run.dateRun).toLocaleString()}</h4>
                    <p className="text-sm text-medium-text">Period: {new Date(run.cutoffStartDate).toLocaleDateString()} - {new Date(run.cutoffEndDate).toLocaleDateString()}</p>
                    <div className="mt-2 text-sm">
                        <p>{run.payslips.length} payslips generated.</p>
                        <ul className="list-disc list-inside columns-2">
                           {run.payslips.map(p => <li key={p.id}><button onClick={() => setSelectedPayslip(p)} className="text-primary hover:underline">{p.employeeName}</button></li>)}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SettingsTab: React.FC = () => {
    return (
        <div className="space-y-4">
            <h4 className="text-lg font-bold text-primary">SSS Contribution Table</h4>
            <div className="text-xs font-mono bg-dark-bg p-2 rounded-md">
                {payrollSettings.sssBrackets.map((b, i) => (
                    <div key={i}>Range: {b.range[0]} - {b.range[1] || 'above'} | Total: {b.total}</div>
                ))}
            </div>
            <h4 className="text-lg font-bold text-primary">Other Settings</h4>
             <div className="text-sm font-mono bg-dark-bg p-2 rounded-md">
                <p>PhilHealth Rate: {(payrollSettings.philhealthRate * 100).toFixed(2)}%</p>
                <p>Pag-IBIG Rate: {(payrollSettings.pagibigRate * 100).toFixed(2)}% (employee share)</p>
            </div>
        </div>
    );
};


const ManagementView: React.FC = () => {
    const { users } = useAuth();
    const [activeTab, setActiveTab] = useState<ManagementTab>('Employee Management');
    const [searchTerm, setSearchTerm] = useState('');
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const managementTabs: ManagementTab[] = ['Employee Management', 'Run Payroll', 'Reports', 'Settings'];
    
    const displayUsers = useMemo(() => {
        return users
            .filter(u => u.role !== UserRole.SuperDeveloper && u.role !== UserRole.Developer)
            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, searchTerm]);

    const loadRuns = useCallback(() => {
        const runs = JSON.parse(localStorage.getItem('payroll_runs') || '[]') as PayrollRun[];
        setPayrollRuns(runs);
    }, []);
    useEffect(() => { loadRuns() }, [loadRuns]);

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'Employee Management':
                return (
                    <div className="flex flex-col h-full">
                        <input type="text" placeholder="Search employee name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-1/3 bg-dark-bg p-2 rounded-md border border-dark-border mb-4" />
                        <div className="flex-grow overflow-auto hide-scrollbar">
                             <table className="w-full text-left min-w-[600px]">
                                <thead className="sticky top-0 bg-dark-card border-b border-dark-border"><tr className="text-sm"><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3 text-right">Basic Salary</th><th className="p-3 text-center">Actions</th></tr></thead>
                                <tbody className="divide-y divide-dark-border">
                                    {displayUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-white/5">
                                            <td className="p-3 font-semibold">{user.name}</td>
                                            <td className="p-3">{user.role}</td>
                                            <td className="p-3 text-right font-mono">₱{(user.basicSalary || 0).toLocaleString()}</td>
                                            <td className="p-3 text-center"><button onClick={() => handleEditClick(user)} className="text-xs bg-primary hover:bg-primary-hover text-white px-3 py-1 rounded-md transition">Manage Payroll</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Run Payroll': return <RunPayrollTab users={users} onRunComplete={loadRuns} />;
            case 'Reports': return <ReportsTab runs={payrollRuns} />;
            case 'Settings': return <SettingsTab />;
            default: return null;
        }
    };
    
    return (
        <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display">Payroll Center</h2>
            <div className="bg-dark-card border border-dark-border rounded-2xl flex-grow flex flex-col">
                <div className="flex-shrink-0 flex border-b border-dark-border overflow-x-auto hide-scrollbar">
                    {managementTabs.map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-5 font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-medium-text hover:bg-white/5'}`}>{tab}</button>))}
                </div>
                <div className="p-6 flex-grow overflow-y-auto">{renderTabContent()}</div>
            </div>
            {isModalOpen && selectedUser && <EmployeePayrollModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userToEdit={selectedUser} />}
        </div>
    );
};

const EmployeeView: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-6">
            <h2 className="text-3xl font-bold font-display">My Payslips</h2>
            <div className="flex-grow bg-dark-card border border-dark-border rounded-2xl p-6 flex items-center justify-center">
                <p className="text-medium-text text-center">Your generated payslips will be available here.</p>
            </div>
        </div>
    );
};

const PayrollCenterPage: React.FC = () => {
    const { user } = useAuth();
    const managementRoles: UserRole[] = [UserRole.Owner, UserRole.Manager, UserRole.Developer, UserRole.SuperDeveloper, UserRole.HR];

    if (!user) return null;

    if (managementRoles.includes(user.role)) {
        return <ManagementView />;
    } else {
        return <EmployeeView />;
    }
};

export default PayrollCenterPage;