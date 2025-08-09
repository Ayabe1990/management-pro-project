import { ManagerPerformanceData } from '../../../types.ts';

export const initialSalesReports: ManagerPerformanceData = {
    totalSales: 1250450.75,
    totalExpenses: {
        cogs: 437657.76,  // 35% of sales
        labor: 312612.69, // 25% of sales
        other: 125045.08,  // 10% of sales (rent, utilities)
    },
    barSales: 500180.30, // 40% of total sales
    barExpenses: 150054.09, // 30% COGS for bar
    get netIncome() {
        return this.totalSales - (this.totalExpenses.cogs + this.totalExpenses.labor + this.totalExpenses.other);
    },
    get profitMargin() {
        if (this.totalSales === 0) return 0;
        return (this.netIncome / this.totalSales) * 100;
    }
};