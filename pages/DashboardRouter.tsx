import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserRole, Page } from '../types.ts';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';
import Sidebar from '../components/Sidebar.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import FaceRegistration from '../components/FaceRegistration.tsx';
import { useEditMode } from '../contexts/EditModeContext.tsx';
import EditModeToolbar from '../components/EditModeToolbar.tsx';

// --- NEW PAGE IMPORTS ---
import MasterInventoryPage from './content/MasterInventoryPage.tsx';
import DepartmentInventoryPage from './content/DepartmentInventoryPage.tsx';
import POSPage from './content/POSPage.tsx';
import BarPOSPage from './content/BarPOSPage.tsx';
import KitchenDisplayPage from './content/KitchenDisplayPage.tsx';
import BatchProductionPage from './content/BatchProductionPage.tsx';
import BatchLogsPage from './content/BatchLogsPage.tsx';
import RequestStockPage from './content/RequestStockPage.tsx';
import ReceiveStockPage from './content/ReceiveStockPage.tsx';
import MarketListPage from './content/MarketListPage.tsx';
import ScanItemPage from './content/ScanItemPage.tsx';
import InventoryLogsPage from './content/InventoryLogsPage.tsx';
import WastageLogPage from './content/WastageLogPage.tsx';
import EndOfDaySummaryPage from './content/EndOfDaySummaryPage.tsx';
import WaiterDashboardPage from './content/WaiterDashboardPage.tsx';
import PayrollCenterPage from './content/PayrollCenterPage.tsx';
import VoucherGeneratorPage from './content/VoucherGeneratorPage.tsx';
import TicketGeneratorPage from './content/TicketGeneratorPage.tsx';
import ReportsPage from './content/ReportsPage.tsx';
import FinanceCenterPage from './content/FinanceCenterPage.tsx';
import FunctionControlPage from '../components/FunctionControlPage.tsx';
import StaffProfilePage from './content/StaffProfilePage.tsx';
import WaiterInventoryPage from './content/WaiterInventoryPage.tsx';
import DataManagementPage from './content/DataManagementPage.tsx';
import DeploymentGuidePage from './content/DeploymentGuidePage.tsx';


// --- EXISTING PAGE IMPORTS ---
import StaffPage from './content/StaffPage.tsx';
import SettingsPage from './content/SettingsPage.tsx';
import SystemPage from './content/SystemPage.tsx';
import TablesPage from './content/TablesPage.tsx';
import RecipePage from './content/RecipePage.tsx';
import EquipmentInventoryPage from './content/EquipmentInventoryPage.tsx';
import IncidentReportPage from './content/IncidentReportPage.tsx';
import TimeClockPage from './content/TimeClockPage.tsx';
import SchedulingPage from './content/SchedulingPage.tsx';
import ServiceChargePage from './content/ServiceChargePage.tsx';
import UnifiedApprovalsPage from './content/UnifiedApprovalsPage.tsx';
import OverviewPage from './content/HomeDashboard.tsx';
import ManagerReportsPage from './content/ManagerReportsPage.tsx';
import ActivityLogPage from './content/ActivityLogPage.tsx';


// --- ICON IMPORTS ---
import { QrCodeIcon, TableCellsIcon, DocumentTextIcon, TicketIcon } from '../components/icons.tsx';

const BusinessClosedOverlay: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
    <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 text-center p-4">
        <h2 className="text-4xl font-bold text-danger">Business is Closed</h2>
        <p className="text-medium-text mt-2 mb-8">Functionality is limited. Please contact a manager to open.</p>
        <button 
            onClick={onLogout} 
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition"
        >
            Logout
        </button>
    </div>
);

const getModuleSettings = () => {
    const settings = localStorage.getItem('app_settings');
    const defaults = {
        inventorySystem: true, posSystem: true, batchProduction: true,
        procurement: true, marketList: true, barcodeScanner: true,
        loggingAndReports: true, payrollSystem: true, financeSystem: true,
        hrModuleEnabled: true,
    };
    if (!settings) return defaults;
    
    try {
        const parsed = JSON.parse(settings);
        const modules = parsed.modules || defaults;
        return {
            ...modules,
            hrModuleEnabled: parsed.hrModuleEnabled !== false,
        };
    } catch (e) {
        return defaults;
    }
};


const DashboardRouter: React.FC = () => {
    const { user, businessStatus, logout } = useAuth();
    const { isEditMode } = useEditMode();
    const [mainPages, setMainPages] = useState<Page[]>([]);
    const [footerPages, setFooterPages] = useState<Page[]>([]);
    const [activePage, setActivePage] = useState<Page | null>(null);
    const [isMultiUserMode, setIsMultiUserMode] = useState(false);
    const [allNavigablePages, setAllNavigablePages] = useState<Page[]>([]);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const moduleSettings = useMemo(() => getModuleSettings(), []);
    
    const needsFaceRegistration = useMemo(() => {
        if (!user) return false;
        if (user.role === UserRole.SuperDeveloper || user.role === UserRole.Developer) return false;

        const requiredRoles = [UserRole.Manager, UserRole.Kitchen, UserRole.Bartender, UserRole.Security, UserRole.Waiter, UserRole.HR, UserRole.Owner];
        return requiredRoles.includes(user.role) && !user.faceRegistered;
    }, [user]);

    useEffect(() => {
        const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
        setIsMultiUserMode(settings.multiUserMode === true);

        const handleStorageChange = () => {
             const newSettings = JSON.parse(localStorage.getItem('app_settings') || '{}');
             if(newSettings.multiUserMode !== isMultiUserMode) {
                setIsMultiUserMode(newSettings.multiUserMode === true);
             }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);

    }, [isMultiUserMode]);

    useEffect(() => {
        if (!user) {
            setIsInitializing(true);
            return;
        }
        
        setIsInitializing(true);

        let roleMainPages: Page[] = [];
        let roleFooterPages: Page[] = [];
        let homePage: Page;

        // --- PAGE DEFINITIONS ---
        const overview = { title: 'Overview', component: OverviewPage, group: 'Operations' } as Page;
        const waiterOverview = { title: 'My Tables', component: WaiterDashboardPage, group: 'POS & Sales' } as Page;
        const approvals = { title: 'Approvals', component: UnifiedApprovalsPage, group: 'Operations' } as Page;
        const timeClock = { title: 'Time Clock', component: TimeClockPage, group: 'Staff' } as Page;
        const staff = { title: 'Staff Management', component: StaffPage, group: 'Staff' } as Page;
        const settingsPage = { title: 'Settings', component: SettingsPage, group: 'Settings & Device' } as Page;
        const system = { title: 'System', component: SystemPage, group: 'Settings & Device' } as Page;
        const recipes = { title: 'Recipes', component: RecipePage, group: 'Inventory' } as Page;
        const equipment = { title: 'Equipment', component: EquipmentInventoryPage, group: 'Inventory' } as Page;
        const incidents = { title: 'Incident Reports', component: IncidentReportPage, group: 'Staff' } as Page;
        const scheduling = { title: 'Scheduling', component: SchedulingPage, group: 'Staff' } as Page;
        const serviceCharge = { title: 'Service Charge', component: ServiceChargePage, group: 'Staff' } as Page;
        const activityLog = { title: 'Activity Log', component: ActivityLogPage, group: 'Reporting & Analytics' } as Page;
        
        // --- MODULAR PAGES ---
        const payrollCenter = { title: 'Payroll Center', component: PayrollCenterPage, group: 'Staff' } as Page;
        const financeCenter = { title: 'Finance Center', component: FinanceCenterPage, group: 'Reporting & Analytics', props: { user } } as Page;
        const functionControl = { title: 'Function Control', component: FunctionControlPage, group: 'Settings & Device' } as Page;
        const dataManagementPage = { title: 'Data Management', component: DataManagementPage, group: 'Settings & Device' } as Page;
        const deploymentGuide = { title: 'Deployment Guide', component: DeploymentGuidePage, group: 'Settings & Device' } as Page;
        const masterInventory = { title: 'Master Inventory', component: MasterInventoryPage, group: 'Inventory' } as Page;
        const deptInventory = { title: 'Department Inventory', component: DepartmentInventoryPage, group: 'Inventory' } as Page;
        const pos = { title: 'POS', component: POSPage, icon: DocumentTextIcon, group: 'POS & Sales' } as Page;
        const barPos = { title: 'Bar POS', component: BarPOSPage, group: 'POS & Sales' } as Page;
        const kitchenDisplay = { title: 'Kitchen Display', component: KitchenDisplayPage, group: 'POS & Sales' } as Page;
        const batchProduction = { title: 'Batch Production', component: BatchProductionPage, group: 'Inventory' } as Page;
        const batchLogs = { title: 'Batch Logs', component: BatchLogsPage, group: 'Inventory' } as Page;
        const requestStock = { title: 'Request Stock', component: RequestStockPage, group: 'Inventory' } as Page;
        const receiveStock = { title: 'Receive Stock', component: ReceiveStockPage, group: 'Inventory' } as Page;
        const marketList = { title: 'Market List', component: MarketListPage, group: 'Inventory' } as Page;
        const scanItem = { title: 'Scan Item', component: () => <ScanItemPage mode="inventory" />, icon: QrCodeIcon, group: 'Inventory' } as Page;
        const inventoryLogs = { title: 'Inventory Logs', component: InventoryLogsPage, group: 'Inventory' } as Page;
        const wastageLog = { title: 'Wastage Log', component: WastageLogPage, group: 'Inventory' } as Page;
        const eodSummary = { title: 'End of Day Summary', component: EndOfDaySummaryPage, group: 'Reporting & Analytics' } as Page;
        const tables = { title: 'Table Management', component: TablesPage, icon: TableCellsIcon, group: 'POS & Sales' } as Page;
        const reports = { title: 'Reports Hub', component: ReportsPage, group: 'Reporting & Analytics' } as Page;
        const managerReports = { title: 'Manager Performance', component: ManagerReportsPage, group: 'Reporting & Analytics' } as Page;
        const staffProfile = { title: 'My Profile', component: StaffProfilePage, group: 'Staff', props: { userId: user.id } } as Page;
        const voucherGen = { title: 'Voucher Generator', component: VoucherGeneratorPage, group: 'POS & Sales' } as Page;
        const ticketGen = { title: 'Ticket Generator', component: TicketGeneratorPage, group: 'POS & Sales' } as Page;
        const ticketScanner = { title: 'Ticket Scanner', component: () => <ScanItemPage mode="event_ticket" />, icon: TicketIcon, group: 'Operations' } as Page;
        const waiterInventory = { title: 'My Equipment', component: WaiterInventoryPage, group: 'Inventory' } as Page;


        const allPages = [overview, approvals, timeClock, staff, settingsPage, system, recipes, equipment, incidents, scheduling, serviceCharge, masterInventory, deptInventory, pos, barPos, kitchenDisplay, batchProduction, batchLogs, requestStock, receiveStock, marketList, scanItem, inventoryLogs, wastageLog, eodSummary, tables, reports, voucherGen, ticketGen, managerReports, staffProfile, activityLog, ticketScanner, waiterInventory, deploymentGuide];
        if (moduleSettings.payrollSystem) allPages.push(payrollCenter);
        if (moduleSettings.financeSystem) allPages.push(financeCenter);
        setAllNavigablePages(allPages);
        
        const baseStaffPages = [staffProfile, timeClock, serviceCharge, scheduling, incidents];
        if (moduleSettings.payrollSystem) baseStaffPages.push(payrollCenter);

        switch (user.role) {
            case UserRole.Manager:
                homePage = overview;
                const managerPages = [overview, approvals, scheduling, staff, recipes, equipment, incidents, reports, settingsPage, activityLog];
                 if (moduleSettings.payrollSystem) managerPages.splice(2, 0, payrollCenter);
                 if (moduleSettings.inventorySystem) managerPages.splice(2, 0, masterInventory, inventoryLogs, batchLogs);
                 if (moduleSettings.marketList) managerPages.push(marketList);
                 if (moduleSettings.loggingAndReports) managerPages.push(eodSummary);
                 if (moduleSettings.barcodeScanner) managerPages.push(voucherGen, ticketGen);

                if (!moduleSettings.hrModuleEnabled) {
                    if(!managerPages.includes(serviceCharge)) managerPages.push(serviceCharge);
                    if(!managerPages.includes(timeClock)) managerPages.push(timeClock);
                }

                roleMainPages = [...managerPages, pos, barPos, kitchenDisplay, tables];
                break;
            
            case UserRole.Owner:
                homePage = overview;
                let ownerPages = [...allPages.filter(p => p.title !== 'Manager Performance'), functionControl, dataManagementPage, deploymentGuide];
                // Replace generic 'Reports Hub' with powerful 'Finance Center' if module enabled
                const reportsIndex = ownerPages.findIndex(p => p.title === 'Reports Hub');
                if (moduleSettings.financeSystem) {
                    if (reportsIndex > -1) {
                        ownerPages[reportsIndex] = financeCenter;
                    } else {
                        ownerPages.push(financeCenter);
                    }
                }
                roleMainPages = ownerPages;
                break;

            case UserRole.Bartender:
                homePage = moduleSettings.posSystem ? barPos : deptInventory;
                roleMainPages = [...baseStaffPages];
                if(moduleSettings.posSystem) roleMainPages.unshift(barPos);
                if(moduleSettings.inventorySystem) roleMainPages.push(deptInventory);
                if(moduleSettings.batchProduction) roleMainPages.push(batchProduction);
                if(moduleSettings.procurement) roleMainPages.push(requestStock, receiveStock);
                if(moduleSettings.loggingAndReports) roleMainPages.push(wastageLog);
                if(moduleSettings.barcodeScanner) roleMainPages.push(scanItem);
                break;

            case UserRole.Kitchen:
                homePage = moduleSettings.posSystem ? kitchenDisplay : deptInventory;
                roleMainPages = [...baseStaffPages];
                if(moduleSettings.posSystem) roleMainPages.unshift(kitchenDisplay);
                if(moduleSettings.inventorySystem) roleMainPages.push(deptInventory);
                if(moduleSettings.batchProduction) roleMainPages.push(batchProduction);
                if(moduleSettings.procurement) roleMainPages.push(requestStock, receiveStock);
                if(moduleSettings.loggingAndReports) roleMainPages.push(wastageLog);
                if(moduleSettings.barcodeScanner) roleMainPages.push(scanItem);
                break;

            case UserRole.Waiter:
                homePage = waiterOverview;
                roleMainPages = [waiterOverview, ...baseStaffPages, waiterInventory];
                if(moduleSettings.loggingAndReports) roleMainPages.push(eodSummary);
                if (moduleSettings.procurement) roleMainPages.push(requestStock);
                if(moduleSettings.posSystem) {
                    roleMainPages.push(tables, pos);
                    roleFooterPages = [tables, pos];
                }
                break;
            
            case UserRole.Security:
                homePage = overview;
                roleMainPages = [overview, ticketScanner, ...baseStaffPages];
                roleFooterPages = [ticketScanner];
                break;
            
            case UserRole.HR:
                homePage = staff;
                let hrPages = [staff, approvals, scheduling, serviceCharge, incidents, timeClock];
                
                if (moduleSettings.payrollSystem && !hrPages.some(p => p.title === 'Payroll Center')) {
                    hrPages.push(payrollCenter);
                }
                
                if (moduleSettings.hrModuleEnabled) {
                    roleMainPages = hrPages;
                } else {
                    homePage = timeClock;
                    roleMainPages = [timeClock];
                }
                break;

            case UserRole.Developer:
            case UserRole.SuperDeveloper:
                homePage = functionControl;
                roleMainPages = [...allPages.filter(p => p.title !== 'Manager Performance'), functionControl, dataManagementPage];
                break;
                
            default:
                homePage = timeClock;
                roleMainPages = [timeClock];
        }

        setMainPages(roleMainPages);
        setFooterPages(roleFooterPages);
        setActivePage(homePage);
        setIsInitializing(false);

    }, [user, moduleSettings, isMultiUserMode]);

    const handleNavigate = (page: Page) => {
        setActivePage(page);
    };

    if (!user) {
        return <div className="h-screen w-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (needsFaceRegistration) {
        return <FaceRegistration />;
    }
    
    if (isInitializing || !activePage) {
        return <div className="h-screen w-screen flex items-center justify-center"><LoadingSpinner message="Preparing your dashboard..." /></div>;
    }

    const isFooterVisible = footerPages.length > 0;
    const canBypassClosed = [UserRole.Manager, UserRole.Owner, UserRole.Developer, UserRole.SuperDeveloper].includes(user.role);
    const isAppDisabled = businessStatus === 'Closed' && !canBypassClosed;
    const PageComponent = activePage.component;

    return (
        <div className="w-full h-screen flex bg-dark-bg">
            <Sidebar 
                user={user} 
                pages={mainPages} 
                activePage={activePage} 
                onSelectPage={handleNavigate}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-grow flex flex-col w-full lg:pl-64">
                <Header
                    user={user}
                    title={activePage.title}
                    onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                />
                 {isAppDisabled && activePage.title !== 'Scheduling' && activePage.title !== 'Time Clock' && <BusinessClosedOverlay onLogout={logout} />}

                <main className={`flex-grow w-full pt-20 overflow-hidden ${isFooterVisible ? 'pb-20' : ''}`}>
                    <div key={`${activePage.title}-${activePage.props?.userId || ''}`} className="w-full h-full p-4 sm:p-6 md:p-8 overflow-y-auto hide-scrollbar animate-fade-in">
                       <PageComponent {...activePage.props} onNavigate={handleNavigate} allPages={allNavigablePages} />
                    </div>
                </main>
                {isEditMode && <EditModeToolbar />}
                {isFooterVisible && <Footer pages={footerPages} onNavigate={handleNavigate} activePageTitle={activePage.title} />}
            </div>
        </div>
    );
};

export default DashboardRouter;