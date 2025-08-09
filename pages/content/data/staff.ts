import { StaffMember, UserRole } from '../../../types.ts';

export const initialStaff: StaffMember[] = [
    { id: '2', name: 'Maria Santos', role: UserRole.Manager, started: '2023-01-15', totalSales: 500000, avgPrepTime: 0, tablesServed: 0 },
    { id: '3', name: 'Juan Dela Cruz', role: UserRole.Bartender, started: '2023-03-22', totalSales: 80000, avgPrepTime: 120, tablesServed: 0 },
    { id: '4', name: 'Ana Ignacio', role: UserRole.Kitchen, started: '2023-02-10', totalSales: 0, avgPrepTime: 300, tablesServed: 0 },
    { id: '5', name: 'Carlos Mendoza', role: UserRole.Waiter, started: '2023-05-01', totalSales: 150000, avgPrepTime: 0, tablesServed: 250 },
    { id: '6', name: 'Jose Rizal', role: UserRole.Security, started: '2023-04-18', totalSales: 0, avgPrepTime: 0, tablesServed: 0 },
];