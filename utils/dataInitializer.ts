import { initialUsers } from '../pages/content/data/users.ts';
import { initialInventory } from '../pages/content/data/inventory.ts';
import { initialRecipes } from '../pages/content/data/recipes.ts';
import { initialTables } from '../pages/content/data/tables.ts';
import { initialEquipment } from '../pages/content/data/equipment.ts';
import { initialMarketList } from '../pages/content/data/market_list.ts';
import { initialMenu } from '../pages/content/data/menu.ts';
import { initialBillers, initialExpenses } from '../pages/content/data/finance.ts';

// Combine raw ingredients with finished menu items
const combinedInventory = [...initialInventory, ...initialMenu];

const dataStores = [
    { key: 'users', data: initialUsers },
    { key: 'inventory', data: combinedInventory },
    { key: 'recipes', data: initialRecipes },
    { key: 'tables_data', data: initialTables.tables },
    { key: 'tabs_data', data: initialTables.tabs },
    { key: 'equipment_inventory', data: initialEquipment },
    { key: 'equipment_logs', data: [] },
    { key: 'market_list', data: initialMarketList },
    { key: 'stock_requests', data: [] },
    { key: 'activity_logs', data: [] },
    { key: 'time_clock_entries', data: [] },
    { key: 'time_clock_break_entries', data: [] },
    { key: 'eod_summaries', data: [] },
    { key: 'schedule_approvals', data: [] },
    { key: 'service_charge_release_requests', data: [] },
    { key: 'incident_reports', data: [] },
    { key: 'waste_logs', data: [] },
    { key: 'batch_logs', data: [] },
    { key: 'inventory_logs', data: [] },
    { key: 'sale_logs', data: [] },
    { key: 'vouchers', data: [] },
    { key: 'event_tickets', data: [] },
    { key: 'notifications', data: [] },
    { key: 'overtime_requests', data: [] },
    { key: 'deleted_data_logs', data: [] },
    { key: 'billers', data: initialBillers },
    { key: 'expenses', data: initialExpenses },
    { key: 'app_settings', data: { 
        multiUserMode: false, 
        businessStatus: 'Closed', 
        hrModuleEnabled: true, 
        hasCompletedOnboarding: false, // New onboarding flag
        isFranchiseModeEnabled: false // New franchise flag
    } }
];

export const initializeAppData = () => {
    let initialized = false;
    dataStores.forEach(store => {
        if (!localStorage.getItem(store.key)) {
            localStorage.setItem(store.key, JSON.stringify(store.data));
            initialized = true;
        }
    });

    if (initialized) {
        console.log("App data initialization complete.");
    }
};