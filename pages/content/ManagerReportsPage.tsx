import React from 'react';
import { ManagerPerformanceData } from '../../types.ts';
import { initialSalesReports } from './data/sales_reports.ts';

const StatCard: React.FC<{ title: string; value: string; isPositive?: boolean, isNegative?: boolean, subtitle?: string }> = ({ title, value, isPositive, isNegative, subtitle }) => (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <p className="text-sm text-medium-text">{title}</p>
        <p className={`text-4xl font-bold mt-2 ${isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-light-text'}`}>
            {value}
        </p>
        {subtitle && <p className="text-xs text-medium-text mt-1">{subtitle}</p>}
    </div>
);

const ManagerReportsPage: React.FC = () => {
    const data: ManagerPerformanceData = initialSalesReports; // Using mock data
    const totalExpenses = data.totalExpenses.cogs + data.totalExpenses.labor + data.totalExpenses.other;

    return (
        <div className="h-full">
            <h2 className="text-3xl font-bold font-display mb-6">Manager Performance Overview</h2>
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-primary">Overall Business Health</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Total Sales" value={`₱${data.totalSales.toLocaleString()}`} />
                        <StatCard title="Total Expenses" value={`₱${totalExpenses.toLocaleString()}`} />
                        <StatCard 
                            title="Net Income" 
                            value={`₱${data.netIncome.toLocaleString()}`}
                            isPositive={data.netIncome > 0}
                            isNegative={data.netIncome < 0}
                            subtitle={`${data.profitMargin.toFixed(2)}% Profit Margin`}
                        />
                    </div>
                </div>

                 <div>
                    <h3 className="text-xl font-semibold mb-4 text-primary">Bar Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Bar Sales" value={`₱${data.barSales.toLocaleString()}`} />
                        <StatCard title="Bar Expenses" value={`₱${data.barExpenses.toLocaleString()}`} />
                        <StatCard 
                            title="Bar Net Income" 
                            value={`₱${(data.barSales - data.barExpenses).toLocaleString()}`} 
                            isPositive={(data.barSales - data.barExpenses) > 0}
                            subtitle={`${((data.barSales - data.barExpenses) / data.barSales * 100).toFixed(2)}% Margin`}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-4 text-primary">Expense Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Cost of Goods Sold (COGS)" value={`₱${data.totalExpenses.cogs.toLocaleString()}`} subtitle={`${(data.totalExpenses.cogs / data.totalSales * 100).toFixed(2)}% of Sales`} />
                        <StatCard title="Labor Costs" value={`₱${data.totalExpenses.labor.toLocaleString()}`} subtitle={`${(data.totalExpenses.labor / data.totalSales * 100).toFixed(2)}% of Sales`} />
                        <StatCard title="Other Expenses" value={`₱${data.totalExpenses.other.toLocaleString()}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerReportsPage;