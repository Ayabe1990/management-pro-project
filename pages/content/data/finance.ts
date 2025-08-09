import { Biller, Expense } from '../../../types.ts';

export const initialBillers: Biller[] = [
    { id: 'biller-001', name: 'Meralco', category: 'Utilities' },
    { id: 'biller-002', name: 'Manila Water', category: 'Utilities' },
    { id: 'biller-003', name: 'PLDT', category: 'Utilities' },
    { id: 'biller-004', name: 'Building Admin', category: 'Rent' },
    { id: 'biller-005', name: 'San Miguel Brewery', category: 'Supplier' },
    { id: 'biller-006', 'name': 'Monterey Meatshop', category: 'Supplier' },
    { id: 'biller-007', name: 'Payroll', category: 'Salaries' },
];

export const initialExpenses: Expense[] = [
    {
        id: 'exp-001',
        date: '2024-05-28T10:00:00Z',
        billerId: 'biller-001',
        billerName: 'Meralco',
        category: 'Utilities',
        description: 'May 2024 Electricity Bill',
        amount: 25450.75,
        loggedBy: '1',
        department: 'General'
    },
    {
        id: 'exp-002',
        date: '2024-05-25T11:00:00Z',
        billerId: 'biller-005',
        billerName: 'San Miguel Brewery',
        category: 'Supplier',
        description: 'Beer Restock',
        amount: 15200.00,
        loggedBy: '2',
        department: 'Bar'
    },
    {
        id: 'exp-003',
        date: '2024-05-15T09:00:00Z',
        billerId: 'biller-007',
        billerName: 'Payroll',
        category: 'Salaries',
        description: 'Payroll for May 1-15',
        amount: 150500.00,
        loggedBy: '1',
        department: 'General'
    },
    {
        id: 'exp-004',
        date: '2024-05-05T14:00:00Z',
        billerId: 'biller-004',
        billerName: 'Building Admin',
        category: 'Rent',
        description: 'Monthly Rent for May',
        amount: 80000.00,
        loggedBy: '1',
        department: 'General'
    },
     {
        id: 'exp-005',
        date: '2024-05-22T11:00:00Z',
        billerId: 'biller-006',
        billerName: 'Monterey Meatshop',
        category: 'Supplier',
        description: 'Pork & Beef Restock',
        amount: 22500.00,
        loggedBy: '2',
        department: 'Kitchen'
    }
];