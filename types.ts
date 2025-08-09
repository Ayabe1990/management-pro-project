import { ReactNode } from 'react';

export enum UserRole {
  Owner = 'OWNER',
  Manager = 'MANAGER',
  HR = 'HR',
  Bartender = 'BARTENDER',
  Kitchen = 'KITCHEN',
  Waiter = 'WAITER',
  Security = 'SECURITY',
  Developer = 'DEVELOPER',
  SuperDeveloper = 'SUPER_DEVELOPER',
}

export interface EmergencyContact {
    fullName: string;
    relationship: 'Parent' | 'Spouse' | 'Sibling' | 'Friend' | 'Other';
    contactNumber: string;
    alternateNumber?: string;
    medicalNotes?: string;
}

export interface Allowance {
    id: string;
    name: string;
    amount: number;
    enabled: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  password?: string;
  pin: string;
  isClockedIn: boolean;
  isOnBreak?: boolean;
  profileComplete?: boolean;
  faceRegistered?: boolean;
  isArchived?: boolean;
  hasCompletedOnboarding?: boolean; // New for onboarding flow
  
  // New comprehensive fields
  nickname?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  mobileNumber?: string;
  address?: string;
  department?: Department;
  employmentType?: 'Full-Time' | 'Part-Time' | 'Contractual' | 'Probationary';
  dateHired?: string;
  assignedTableZones?: number[];
  branchLocation?: string;
  loginMethod?: 'pin' | 'password' | 'both';
  emergencyContact?: EmergencyContact;
  profilePhotoUrl?: string;

  // Payroll specific fields
  basicSalary?: number;
  allowances?: Allowance[];
  sssNumber?: string;
  philhealthNumber?: string;
  pagibigNumber?: string;
  tinNumber?: string;
}

export interface TimeClockEntry {
    id: string;
    userId: string;
    clockInTime: string;
    clockOutTime: string | null;
    durationMinutes: number | null;
}

export interface TimeClockBreakEntry {
    id: string;
    timeClockEntryId: string;
    breakStartTime: string;
    breakEndTime: string | null;
    durationMinutes: number | null;
}

export interface Page {
  title: string;
  component: React.ComponentType<any>;
  icon?: React.ComponentType<any>;
  props?: any;
  group: 'POS & Sales' | 'Inventory' | 'Staff' | 'Reporting & Analytics' | 'Settings & Device' | 'Operations';
}

export interface Notification {
  id: string;
  userId: string;
  timestamp: string;
  message: string;
  isRead: boolean;
}

export interface StaffMember {
    id: string;
    name: string;
    role: UserRole;
    started: string;
    totalSales: number;
    avgPrepTime: number;
    tablesServed: number;
}

export interface AIReview {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
}

export type EquipmentStatus = 'Operational' | 'Maintenance Required' | 'Out of Service' | 'Broken' | 'Lost' | 'Retired';

export interface EquipmentInventoryItem {
    id: string;
    name: string;
    description: string;
    category: 'Kitchen' | 'Bar' | 'Dining' | 'General' | 'Cleaning';
    quantity: number;
    price: number;
    purchaseDate: string;
    status: EquipmentStatus;
    issuedTo?: UserRole;
    size?: string;
    color?: string;
}

export interface EquipmentLog {
    id: string;
    equipmentId: string;
    equipmentName: string;
    date: string;
    type: 'Added' | 'Issued' | 'Returned' | 'Transfer' | 'Maintenance' | 'Retired' | 'Status Change';
    notes: string;
    userId: string;
    quantityChange: number;
}

export type IncidentReason = 'Breakage' | 'Spillage' | 'Cooking Error' | 'Customer Complaint' | 'Staff Misconduct' | 'Other';

export interface IncidentReport {
    id: string;
    date: string;
    involvedStaffIds: string[];
    menuItemId?: string;
    quantity?: number;
    reason: IncidentReason;
    notes: string;
    createdWasteLog: boolean;
    loggedBy: string; // userId
    videoUrl?: string;
}

export interface Voucher {
    id: string;
    code: string;
    menuItemId: string;
    itemName: string;
    expiryDate: string;
    status: 'Active' | 'Claimed' | 'Expired';
}

export interface EventTicket {
    id: string;
    eventName: string;
    attendeeName: string;
    expiryDate: string;
    status: 'Active' | 'Used' | 'Expired';
}

export interface ManagerPerformanceData {
    totalSales: number;
    totalExpenses: {
        cogs: number;
        labor: number;
        other: number;
    };
    barSales: number;
    barExpenses: number;
    netIncome: number;
    profitMargin: number;
}

export interface StockCountLog {
    id: string;
    date: string;
    countedBy: string; // userId
    status: 'Pending' | 'Approved' | 'Rejected';
    items: {
        itemId: string;
        itemName: string;
        systemStock: number;
        systemOpenVolume: number;
        physicalStock: number;
        physicalOpenVolume: number;
        variance: number;
    }[];
}

export interface ActivityLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string;
}

export interface Break {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
}

export interface Shift {
    id: string;
    userId: string;
    userName: string;
    startTime: string;
    endTime: string;
    breaks?: Break[];
}

export interface Schedule {
    weekStartDate: string; // YYYY-MM-DD
    shifts: Shift[];
}

export interface ScheduleApprovalRequest {
    id: string;
    managerId: string;
    weekStartDate: string;
    schedule: Schedule;
    status: 'Pending' | 'Approved' | 'Rejected';
    submittedAt: string;
}

export interface ServiceChargeReleaseRequest {
    id: string;
    requestedBy: string; // manager's userId
    date: string;
    periodStartDate: string;
    periodEndDate: string;
    totalServiceCharge: number;
    distribution: {
        staffId: string;
        staffName: string;
        shareAmount: number;
    }[];
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface OvertimeRequest {
    id: string;
    userId: string;
    userName: string;
    timeClockEntryId: string;
    date: string; // Date of the shift
    requestedMinutes: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    reviewedBy?: string; // userId of approver/rejecter
    reviewedAt?: string;
}


// --- INVENTORY & PROCUREMENT ---

export type InventoryUnit = 'ml' | 'g' | 'pcs' | 'kg' | 'bottle' | 'box' | 'pack' | 'bundle' | 'can' | 'liter';
export type Department = 'Bar' | 'Kitchen' | 'General' | 'Admin';

export interface MasterInventoryItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  department: Department;
  type?: 'raw' | 'finished'; // For distinguishing between ingredients and sellable items
  
  // Stock
  stock: number; // For sealed items or discrete units
  openVolume?: number; // For tracking open liquor bottles
  isTrackOpenVolume?: boolean; // Flag for items like liquor that need open volume tracking
  containerSize?: number; // e.g. 750 for a 750ml bottle, used for variance calculation
  
  // Unit & Packaging
  volume?: number; // e.g., 750 for a 750ml bottle
  weight?: number;
  unitType: InventoryUnit;
  packagingType: 'bottle' | 'pack' | 'case' | 'box' | 'bundle' | 'can' | 'sack';
  caseQuantity: number; // e.g., 24 for a case of beer
  
  // Supplier & Cost
  supplier: string;
  barcode: string;
  costPerUnit: number;
  reorderLevel: number;

  // Status
  isArchived: boolean;
  recipeId?: string;
  price?: number; // Selling price if it's a finished good
  srp?: number; // Suggested Retail Price
  isEnabledOnPOS?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  department: Department;
  producesInventoryId: string;
  yieldQty: number;
  prepLoss: number; // Percentage
  instructions: string[];
  ingredients: {
    inventoryId: string;
    quantity: number; // in base unit of the ingredient (ml, g, pcs)
  }[];
  status: 'Pending Approval' | 'Approved' | 'Rejected';
}

export interface StockRequest {
  id: string;
  requestedBy: string; // userId
  department: Department;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Received';
  items: {
    itemId: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface PurchaseOrder {
    id: string;
    requestId: string;
    orderDate: string;
    status: 'Pending' | 'Sent' | 'Partially Received' | 'Received';
    items: {
        itemId: string;
        quantityOrdered: number;
        quantityReceived: number;
        costPerUnit: number;
    }[];
}

export interface ReceivingLog {
    id: string;
    poId: string;
    receivedBy: string; // userId
    date: string;
    items: {
        itemId: string;
        quantityExpected: number;
        quantityReceived: number;
        discrepancyReason?: 'Damaged' | 'Out of Stock' | 'Backorder' | 'Other';
    }[];
}


// --- LOGGING & REPORTING ---

export type LogActionType = 'Purchase' | 'Transfer' | 'Batch Production' | 'Wastage' | 'Sales Depletion' | 'Correction' | 'Receiving';

export interface InventoryLog {
    id: string;
    timestamp: string;
    itemId: string;
    itemName: string;
    action: LogActionType;
    quantityChange: number; // Can be negative
    responsibleUser: string; // userId
    notes?: string;
}

export interface WastageLog {
    id: string;
    date: string;
    itemId: string;
    quantity: number;
    reason: 'Spoilage' | 'Trimming' | 'Cooking Error' | 'Expired' | 'Spillage' | 'Breakage';
    cost: number;
    loggedBy: string; // userId
}

export interface BatchLog {
    id: string;
    date: string;
    recipeId: string;
    yield: number;
    totalCost: number;
    loggedBy: string; // userId
}

export interface EndOfDaySummary {
    id:string;
    date: string;
    submittedBy: string; // userId
    salesData: any;
    wastageSummary: any;
    batchSummary: any;
    notes: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface SaleLog {
    id: string;
    timestamp: string;
    waiterId: string;
    tableNumber: number;
    items: OrderItem[];
    subtotal: number;
    total: number;
    paymentMethod: string;
    discount?: { type: 'percent' | 'fixed'; value: number; amount: number; authorizedBy: string; };
}

// --- POS & ORDERS ---
export type OrderItemStatus = 'New' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';
export type CancellationReason = 'Guest Complaint' | 'Mistaken Order' | 'Item Unavailable' | 'Other';

export interface OrderItemCancellation {
    reason: CancellationReason;
    notes: string;
    cancelledBy: string; // User ID
    timestamp: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string; // Links to MasterInventoryItem ID
  name: string;
  price: number;
  qty: number;
  status: OrderItemStatus;
  cancellation?: OrderItemCancellation;
  statusTimestamps: { [K in OrderItemStatus]?: string | null };
}

export type TableStatus = 'Available' | 'Occupied' | 'Billing';

export interface Table {
    number: number;
    status: TableStatus;
    tabId: string | null;
}

export interface Tab {
    id: string;
    tableNumber: number;
    waiterId: string;
    items: OrderItem[];
    createdAt: string;
    orderType: 'Dine-In' | 'Takeout';
    previousTableNumber?: number;
    discount?: { type: 'percent' | 'fixed'; value: number; amount: number; authorizedBy: string; };
}


// --- MARKET LIST ---
export type MarketCategory = 'Dry Goods' | 'Wet Goods' | 'Vegetables' | 'Fruits' | 'Liquor';
export type ItemPriority = 'Essential' | 'Recommended' | 'Optional';
export type OrderStatus = 'Not Ordered' | 'Ordered' | 'Delivered';

export interface MarketListItem {
    id: string;
    name: string;
    volume?: string;
    weight?: string;
    piecesPerBox?: number;
    caseQuantity?: number;
    brand?: string;
    supplier: string;
    price: number;
    category: MarketCategory;
    priority: ItemPriority;
    status: OrderStatus;
}


// --- PAYROLL ---
export interface ContributionBracket {
    range: [number, number | null];
    employeeShare: number;
    employerShare: number;
    total: number;
}

export interface PayrollSettings {
    sssBrackets: ContributionBracket[];
    philhealthRate: number;
    pagibigRate: number;
    taxBrackets: {
        range: [number, number | null];
        baseTax: number;
        rate: number;
    }[];
}

export interface Payslip {
    id: string;
    runId: string;
    employeeId: string;
    employeeName: string;
    cutoffStartDate: string;
    cutoffEndDate: string;
    basicPay: number;
    allowances: number;
    overtimePay: number;
    holidayPay: number;
    grossPay: number;
    sssContribution: number;
    philhealthContribution: number;
    pagibigContribution: number;
    withholdingTax: number;
    otherDeductions: number;
    totalDeductions: number;
    netPay: number;
}

export interface PayrollRun {
    id: string;
    cutoffStartDate: string;
    cutoffEndDate: string;
    dateRun: string;
    runBy: string; // userId
    payslips: Payslip[];
}

// --- FINANCE ---
export interface Biller {
    id: string;
    name: string;
    category: 'Utilities' | 'Rent' | 'Supplier' | 'Government' | 'Salaries' | 'Other';
}

export interface Expense {
    id: string;
    date: string; // ISO string
    billerId: string;
    billerName: string;
    category: Biller['category'];
    description: string;
    amount: number;
    loggedBy: string; // userId
    department: Department;
}

// --- DATA MANAGEMENT ---
export interface DeletedDataLog {
    id: string;
    timestamp: string;
    deletedBy: string; // user name
    userId: string;
    dateRange: [string, string];
    dataType: string[];
    recordCounts: Record<string, number>;
}


// --- UI & THEME ---

export interface RoleTheme {
  bg: string;
  primary: string;
  accent: string;
  name: string;
}