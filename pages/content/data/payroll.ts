import { User, Payslip, PayrollSettings, ContributionBracket, OvertimeRequest } from '../../../types.ts';

// Based on simplified 2024 brackets for demonstration purposes.
export const payrollSettings: PayrollSettings = {
    sssBrackets: [
        { range: [0, 4249.99], employeeShare: 180, employerShare: 360, total: 540 },
        { range: [4250, 4749.99], employeeShare: 202.5, employerShare: 405, total: 607.5 },
        // ... more brackets up to 29750
        { range: [29750, null], employeeShare: 1350, employerShare: 2700, total: 4050 },
    ],
    philhealthRate: 0.05, // 5% of monthly basic salary
    pagibigRate: 0.02, // 2% of monthly basic salary (employee share, max 100)
    taxBrackets: [
        { range: [0, 20833], baseTax: 0, rate: 0 },
        { range: [20833, 33332], baseTax: 0, rate: 0.15 }, // 15% over 20,833
        { range: [33333, 66666], baseTax: 1875, rate: 0.20 }, // 1,875 + 20% over 33,333
        { range: [66667, 166666], baseTax: 8541.80, rate: 0.25 }, // 8,541.80 + 25% over 66,667
        // ... and so on
    ],
};

export const calculatePayroll = (employee: User, startDate: string, endDate: string): Payslip => {
    const monthlySalary = employee.basicSalary || 0;
    
    // --- EARNINGS ---
    const basicPay = monthlySalary; // Assuming monthly payroll for simplicity
    const totalAllowances = employee.allowances?.filter(a => a.enabled).reduce((sum, a) => sum + a.amount, 0) || 0;
    
    // --- OVERTIME PAY CALCULATION ---
    const allOvertimeRequests = JSON.parse(localStorage.getItem('overtime_requests') || '[]') as OvertimeRequest[];
    const approvedRequests = allOvertimeRequests.filter(req =>
        req.userId === employee.id &&
        req.status === 'Approved' &&
        new Date(req.date) >= new Date(startDate) &&
        new Date(req.date) <= new Date(endDate)
    );
    const totalOvertimeMinutes = approvedRequests.reduce((sum, req) => sum + req.requestedMinutes, 0);

    let overtimePay = 0;
    if (totalOvertimeMinutes > 0 && monthlySalary > 0) {
        // Simplified hourly rate: monthly salary / 22 working days / 8 hours
        const hourlyRate = monthlySalary / 22 / 8;
        const overtimeRate = 1.25; // Standard OT rate
        overtimePay = (totalOvertimeMinutes / 60) * hourlyRate * overtimeRate;
    }
    
    const grossPay = basicPay + totalAllowances + overtimePay;
    
    // --- DEDUCTIONS ---
    // SSS
    const sssBracket = payrollSettings.sssBrackets.find(b => grossPay >= b.range[0] && (b.range[1] === null || grossPay <= b.range[1]));
    const sssContribution = sssBracket ? sssBracket.employeeShare : 0;
    
    // PhilHealth
    const philhealthContribution = Math.min(Math.max(grossPay * payrollSettings.philhealthRate / 2, 250), 2500); // Employee share is half, with cap
    
    // Pag-IBIG
    const pagibigContribution = Math.min(monthlySalary * payrollSettings.pagibigRate, 100);

    // Withholding Tax
    const taxableIncome = grossPay - sssContribution - philhealthContribution - pagibigContribution;
    let tax = 0;
    const taxBracket = payrollSettings.taxBrackets.find(b => taxableIncome >= b.range[0] && (b.range[1] === null || taxableIncome <= b.range[1]));
    if (taxBracket) {
        tax = taxBracket.baseTax + (taxableIncome - taxBracket.range[0]) * taxBracket.rate;
    }
    const withholdingTax = Math.max(0, tax);

    const totalDeductions = sssContribution + philhealthContribution + pagibigContribution + withholdingTax;
    
    // --- NET PAY ---
    const netPay = grossPay - totalDeductions;

    return {
        id: `PS-${employee.id}-${new Date().getTime()}`,
        runId: '', // Will be assigned by the run
        employeeId: employee.id,
        employeeName: employee.name,
        cutoffStartDate: startDate,
        cutoffEndDate: endDate,
        basicPay,
        allowances: totalAllowances,
        overtimePay,
        holidayPay: 0, // Placeholder
        grossPay,
        sssContribution,
        philhealthContribution,
        pagibigContribution,
        withholdingTax,
        otherDeductions: 0, // Placeholder
        totalDeductions,
        netPay,
    };
};