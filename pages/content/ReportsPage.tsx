
import React from 'react';
import { Page } from '../../types.ts';

const ReportCard: React.FC<{ title: string; description: string; onClick?: () => void; }> = ({ title, description, onClick }) => (
    <div onClick={onClick} className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary hover:scale-105 transition-all cursor-pointer">
        <h3 className="text-xl font-bold text-primary">{title}</h3>
        <p className="text-sm text-medium-text mt-2">{description}</p>
    </div>
);

interface ReportsPageProps {
    onNavigate?: (page: Page) => void;
    allPages?: Page[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate, allPages }) => {
    // In a real app, these would navigate to the respective pages
    const reports = [
        { title: 'Manager Performance', description: 'View sales, expenses, and profit margins.' },
        { title: 'Inventory Logs', description: 'Track all item movements from purchase to sale.' },
        { title: 'Wastage Reports', description: 'Analyze cost of goods lost to spoilage, errors, etc.' },
        { title: 'Batch Production Logs', description: 'Review production history and costs.' },
        { title: 'Sales Reports', description: 'Deep dive into sales data by item, category, or time.' },
        { title: 'Payroll Summaries', description: 'Access historical payroll run data and payslips.' },
        { title: 'Attendance Logs', description: 'Review staff clock-in/out records.' },
        { title: 'Incident Reports', description: 'View all logged staff and customer incidents.' },
    ];

    const handleCardClick = (title: string) => {
        if (!onNavigate || !allPages) {
            alert(`Navigation not available.`);
            return;
        }

        const pageToNav = allPages.find(p => p.title === title);

        if (pageToNav) {
            onNavigate(pageToNav);
        } else {
            alert(`Report for "${title}" is not yet available.`);
        }
    };

    return (
        <div className="h-full">
            <h2 className="text-3xl font-bold font-display mb-6">Reports & Analytics Hub</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map(report => (
                    <ReportCard key={report.title} title={report.title} description={report.description} onClick={() => handleCardClick(report.title)} />
                ))}
            </div>
        </div>
    );
};

export default ReportsPage;
