export interface Holiday {
    date: string; // YYYY-MM-DD
    name: string;
    type: 'Regular' | 'Special';
}

export const philippineHolidays2024: Holiday[] = [
    { date: '2024-01-01', name: "New Year's Day", type: 'Regular' },
    { date: '2024-02-10', name: 'Chinese New Year', type: 'Special' },
    { date: '2024-03-28', name: 'Maundy Thursday', type: 'Regular' },
    { date: '2024-03-29', name: 'Good Friday', type: 'Regular' },
    { date: '2024-03-30', name: 'Black Saturday', type: 'Special' },
    { date: '2024-04-09', name: 'Araw ng Kagitingan', type: 'Regular' },
    { date: '2024-05-01', name: 'Labor Day', type: 'Regular' },
    { date: '2024-06-12', name: 'Independence Day', type: 'Regular' },
    { date: '2024-08-21', name: 'Ninoy Aquino Day', type: 'Special' },
    { date: '2024-08-26', name: 'National Heroes Day', type: 'Regular' },
    { date: '2024-11-01', name: "All Saints' Day", type: 'Special' },
    { date: '2024-11-30', name: 'Bonifacio Day', type: 'Regular' },
    { date: '2024-12-08', name: 'Immaculate Conception', type: 'Special' },
    { date: '2024-12-25', name: 'Christmas Day', type: 'Regular' },
    { date: '2024-12-30', name: 'Rizal Day', type: 'Regular' },
    { date: '2024-12-31', name: 'Last Day of the Year', type: 'Special' },
];
