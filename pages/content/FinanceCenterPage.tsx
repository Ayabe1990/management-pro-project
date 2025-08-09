import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Biller, Expense, SaleLog, UserRole, Department, StockRequest, WastageLog } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import AddExpenseModal from '../../components/AddExpenseModal.tsx';
import ManageBillersModal from '../../components/ManageBillersModal.tsx';
import SalesExpenseChart from '../../components/charts/SalesExpenseChart.tsx';
import ExpensePieChart from '../../components/charts/ExpensePieChart.tsx';
import { initialBillers, initialExpenses } from './data/finance.ts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon } from '../../components/icons.tsx';

type FinanceTab = 'Dashboard' | 'Expenses' | 'Billers' | 'Departmental Analytics';

interface ReportData {
    totalSales: number;
    totalCOGS: number;
    totalWastage: number;
    totalExpenses: number;
    profitMargin: number;
    aiAnalysis?: string;
}

const safeJSONParse = <T,>(item: string | null, fallback: T): T => {
    if (!item) return fallback;
    try {
        const parsed = JSON.parse(item);
        return Array.isArray(parsed) || typeof parsed === 'object' ? parsed : fallback;
    } catch (e) {
        console.error("Failed to parse JSON from localStorage", e);
        return fallback;
    }
};

const StatCard: React.FC<{ title: string; value: string; isPositive?: boolean, isNegative?: boolean, subtitle?: string }> = ({ title, value, isPositive, isNegative, subtitle }) => (
    <div className="bg-dark-bg border border-dark-border rounded-xl p-6">
        <p className="text-sm text-medium-text">{title}</p>
        <p className={`text-4xl font-bold mt-2 ${isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-light-text'}`}>
            {value}
        </p>
        {subtitle && <p className="text-xs text-medium-text mt-1">{subtitle}</p>}
    </div>
);

const DepartmentalAnalyticsTab: React.FC = () => {
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [department, setDepartment] = useState<Department>('Bar');
    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateReport = () => {
        setIsLoading(true);
        setError('');
        try {
            const allExpenses = safeJSONParse<Expense[]>(localStorage.getItem('expenses'), []);
            const allSales = safeJSONParse<SaleLog[]>(localStorage.getItem('sale_logs'), []);
            const allStockRequests = safeJSONParse<StockRequest[]>(localStorage.getItem('stock_requests'), []);
            const allWastage = safeJSONParse<WastageLog[]>(localStorage.getItem('waste_logs'), []);

            const deptExpenses = allExpenses.filter(e => e.department === department && new Date(e.date) >= new Date(startDate) && new Date(e.date) <= new Date(endDate));
            const deptSales = allSales.filter(s => new Date(s.timestamp) >= new Date(startDate) && new Date(s.timestamp) <= new Date(endDate)); // Simplified: assuming all sales are for one dept for now
            const deptStockReqs = allStockRequests.filter(r => r.department === department && (r.status === 'Received' || r.status === 'Approved') && new Date(r.date) >= new Date(startDate) && new Date(r.date) <= new Date(endDate));
            const deptWastage = allWastage.filter(w => new Date(w.date) >= new Date(startDate) && new Date(w.date) <= new Date(endDate)); // This needs department info on wastage log later

            const totalSales = deptSales.reduce((sum, sale) => sum + sale.total, 0);
            const totalCOGS = deptStockReqs.reduce((sum, req) => sum + 5000, 0); // Mock COGS
            const totalWastage = deptWastage.reduce((sum, w) => sum + w.cost, 0);
            const totalExpenses = deptExpenses.reduce((sum, e) => sum + e.amount, 0) + totalCOGS + totalWastage;
            const profitMargin = totalSales > 0 ? ((totalSales - totalExpenses) / totalSales) * 100 : 0;

            setReport({ totalSales, totalCOGS, totalWastage, totalExpenses, profitMargin });

        } catch (e) {
            console.error(e);
            setError("Failed to generate report. Data might be corrupted.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAiAnalysis = async () => {
        if (!report) return;
        setIsLoading(true);
        setError('');
        try {
            const prompt = `
                Analyze the following financial report for the ${department} department of a restaurant.
                Provide a concise, actionable business suggestion based on these numbers.
                Focus on potential improvements or areas of concern. Keep the tone professional and direct.
                The analysis should be a single paragraph.

                Data:
                - Total Sales: PHP ${report.totalSales.toFixed(2)}
                - Total Expenses: PHP ${report.totalExpenses.toFixed(2)}
                - Cost of Goods (from requests): PHP ${report.totalCOGS.toFixed(2)}
                - Wastage Cost: PHP ${report.totalWastage.toFixed(2)}
                - Profit Margin: ${report.profitMargin.toFixed(2)}%
            `;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setReport(prev => prev ? { ...prev, aiAnalysis: response.text } : null);
        } catch (e) {
            console.error(e);
            setError("Failed to get AI analysis. Please check API configuration.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-dark-bg p-4 rounded-lg flex flex-wrap items-center justify-center gap-4">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-dark-card p-2 rounded-md border border-dark-border" />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-dark-card p-2 rounded-md border border-dark-border" />
                <select value={department} onChange={e => setDepartment(e.target.value as Department)} className="bg-dark-card p-2 rounded-md border border-dark-border">
                    <option value="Bar">Bar</option>
                    <option value="Kitchen">Kitchen</option>
                </select>
                <button onClick={handleGenerateReport} disabled={isLoading} className="bg-primary hover:bg-primary-hover font-semibold py-2 px-6 rounded-lg disabled:opacity-50">
                    {isLoading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {error && <p className="text-center text-danger">{error}</p>}

            {report && (
                <div className="animate-fade-in space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Sales" value={`₱${report.totalSales.toLocaleString()}`} />
                        <StatCard title="Total Expenses" value={`₱${report.totalExpenses.toLocaleString()}`} isNegative />
                        <StatCard title="Profit Margin" value={`${report.profitMargin.toFixed(2)}%`} isPositive={report.profitMargin > 0} isNegative={report.profitMargin < 0} />
                         <div className="col-span-2 lg:col-span-1 flex items-center justify-center bg-dark-bg rounded-lg">
                            <button onClick={handleAiAnalysis} disabled={isLoading} className="bg-accent/80 hover:bg-accent text-dark-bg font-bold py-3 px-5 rounded-lg flex items-center gap-2 transition disabled:opacity-50">
                                <SparklesIcon className="w-5 h-5" />
                                {isLoading ? 'Analyzing...' : 'Get AI Suggestion'}
                            </button>
                        </div>
                    </div>
                    {report.aiAnalysis && (
                        <div className="bg-dark-bg p-4 rounded-lg border-l-4 border-accent">
                            <h4 className="font-bold text-accent mb-2">AI Business Suggestion:</h4>
                            <p>{report.aiAnalysis}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const FinanceCenterPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<FinanceTab>('Dashboard');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [billers, setBillers] = useState<Biller[]>([]);
    const [sales, setSales] = useState<SaleLog[]>([]);
    const [isAddExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
    const [isManageBillersModalOpen, setManageBillersModalOpen] = useState(false);
    
    const loadData = useCallback(() => {
        setExpenses(safeJSONParse<Expense[]>(localStorage.getItem('expenses'), initialExpenses));
        setBillers(safeJSONParse<Biller[]>(localStorage.getItem('billers'), initialBillers));
        setSales(safeJSONParse<SaleLog[]>(localStorage.getItem('sale_logs'), []));
    }, []);

    useEffect(() => {
        loadData();
        const handleUpdate = () => loadData();
        document.addEventListener('finance_updated', handleUpdate);
        return () => document.removeEventListener('finance_updated', handleUpdate);
    }, [loadData]);
    
    const canManage = user?.role === UserRole.Owner || user?.role === UserRole.Manager || user?.role === UserRole.HR;
    const isOwner = user?.role === UserRole.Owner;

    const exportToCSV = () => {
        const headers = ['ID', 'Date', 'Biller', 'Category', 'Description', 'Amount'];
        const rows = expenses.map(e => [e.id, e.date, e.billerName, e.category, `"${e.description}"`, e.amount].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "expenses_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Expense Report", 10, 10);
        const data = expenses.map(e => [e.date.split('T')[0], e.billerName, e.description, `PHP ${e.amount.toFixed(2)}`]);
        (doc as any).autoTable({
            head: [['Date', 'Biller', 'Description', 'Amount']],
            body: data,
        });
        doc.save('expenses_report.pdf');
    };
    
    // --- DASHBOARD DATA PROCESSING ---
    const { totalRevenue, totalExpenses, netIncome, salesChartData, pieChartData, hasChartData } = useMemo(() => {
        const totalRev = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalExp = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const netInc = totalRev - totalExp;

        const expenseByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        const pieData = {
            labels: Object.keys(expenseByCategory),
            datasets: [{
                data: Object.values(expenseByCategory),
                backgroundColor: ['#58A6FF', '#3FB950', '#D29922', '#F85149', '#79C0FF', '#a855f7'],
                borderColor: ['#161B22'],
            }],
        };
        
        const salesByDay: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            salesByDay[key] = 0;
        }
        sales.forEach(sale => {
            const key = sale.timestamp.split('T')[0];
            if (salesByDay.hasOwnProperty(key)) {
                salesByDay[key] += sale.total;
            }
        });

        const salesData = {
            labels: Object.keys(salesByDay).map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
                { label: 'Sales', data: Object.values(salesByDay), backgroundColor: '#3FB950' },
            ],
        };

        return { 
            totalRevenue: totalRev, 
            totalExpenses: totalExp, 
            netIncome: netInc,
            salesChartData: salesData, 
            pieChartData: pieData,
            hasChartData: expenses.length > 0 || sales.length > 0
        };

    }, [sales, expenses]);


    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <StatCard title="Total Revenue" value={`₱${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} isPositive />
                             <StatCard title="Total Expenses" value={`₱${totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}`} isNegative />
                             <StatCard title="Net Income" value={`₱${netIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}`} isPositive={netIncome >= 0} isNegative={netIncome < 0} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {hasChartData ? (
                                <>
                                    <div className="bg-dark-bg p-4 rounded-lg h-96"><SalesExpenseChart data={salesChartData} /></div>
                                    <div className="bg-dark-bg p-4 rounded-lg h-96"><ExpensePieChart data={pieChartData} /></div>
                                </>
                            ) : (
                                <div className="lg:col-span-2 bg-dark-bg p-4 rounded-lg h-96 flex items-center justify-center">
                                    <p className="text-medium-text">No financial data available to display charts.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'Expenses':
                return (
                    <div>
                        <div className="flex justify-end gap-2 mb-4">
                            <button onClick={exportToCSV} className="text-sm bg-primary/80 hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg">Export CSV</button>
                            <button onClick={exportToPDF} className="text-sm bg-primary/80 hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg">Export PDF</button>
                            {canManage && <button onClick={() => setAddExpenseModalOpen(true)} className="text-sm bg-success hover:bg-success/80 text-white font-semibold py-2 px-4 rounded-lg">+ Add Expense</button>}
                        </div>
                        <div className="overflow-x-auto hide-scrollbar">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="border-b border-dark-border"><tr className="text-sm"><th className="p-2">Date</th><th className="p-2">Biller</th><th className="p-2">Description</th><th className="p-2 text-right">Amount</th></tr></thead>
                                <tbody className="divide-y divide-dark-border">
                                    {expenses.map(e => <tr key={e.id}><td className="p-2">{e.date.split('T')[0]}</td><td className="p-2">{e.billerName}</td><td className="p-2">{e.description}</td><td className="p-2 text-right font-mono">₱{e.amount.toFixed(2)}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Billers':
                 return (
                    <div>
                        <div className="flex justify-end mb-4">
                            {canManage && <button onClick={() => setManageBillersModalOpen(true)} className="text-sm bg-success hover:bg-success/80 text-white font-semibold py-2 px-4 rounded-lg">+ Manage Billers</button>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {billers.map(b => <div key={b.id} className="bg-dark-bg p-4 rounded-lg text-center"><p className="font-bold">{b.name}</p><p className="text-xs text-medium-text">{b.category}</p></div>)}
                        </div>
                    </div>
                );
            case 'Departmental Analytics':
                return isOwner ? <DepartmentalAnalyticsTab /> : <p className="text-center text-danger">Access Denied.</p>;
        }
    };
    
    const financeTabs: FinanceTab[] = ['Dashboard', 'Expenses', 'Billers'];
    if (isOwner) {
        financeTabs.push('Departmental Analytics');
    }

    return (
        <>
            <div className="h-full flex flex-col gap-6">
                <h2 className="text-3xl font-bold font-display">Finance Center</h2>
                 <div className="bg-dark-card border border-dark-border rounded-2xl flex-grow flex flex-col">
                    <div className="flex-shrink-0 flex border-b border-dark-border overflow-x-auto hide-scrollbar">
                        {financeTabs.map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-5 font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-medium-text hover:bg-white/5'}`}>{tab}</button>))}
                    </div>
                    <div className="p-6 flex-grow overflow-y-auto">{renderContent()}</div>
                </div>
            </div>
            {isAddExpenseModalOpen && canManage && <AddExpenseModal isOpen={isAddExpenseModalOpen} onClose={() => setAddExpenseModalOpen(false)} billers={billers} />}
            {isManageBillersModalOpen && canManage && <ManageBillersModal isOpen={isManageBillersModalOpen} onClose={() => setManageBillersModalOpen(false)} />}
        </>
    );
};

export default FinanceCenterPage;