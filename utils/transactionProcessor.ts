import { Tab, MasterInventoryItem, Table, SaleLog, Recipe, InventoryLog } from '../types.ts';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

export const processOrderPayment = (tab: Tab, paymentDetails: { paymentMethod: string; totalAmount: number; }) => {
    try {
        // --- 1. Load all necessary data from localStorage ---
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        const tables = JSON.parse(localStorage.getItem('tables_data') || '[]') as Table[];
        const tabs = JSON.parse(localStorage.getItem('tabs_data') || '{}') as Record<string, Tab>;
        const saleLogs = JSON.parse(localStorage.getItem('sale_logs') || '[]') as SaleLog[];
        const recipes = JSON.parse(localStorage.getItem('recipes') || '[]') as Recipe[];
        const inventoryLogs = JSON.parse(localStorage.getItem('inventory_logs') || '[]') as InventoryLog[];

        // --- 2. Deplete inventory based on order items (WITH RECIPE LOGIC) ---
        let stockSufficient = true;
        tab.items.forEach(orderItem => {
            const finishedGood = inventory.find(inv => inv.id === orderItem.menuItemId);
            if (!finishedGood) {
                stockSufficient = false;
                console.error(`SOLD ITEM NOT FOUND in inventory: ${orderItem.name}`);
                return; // continue to next item
            }

            // A. If item has a recipe, deplete ingredients
            if (finishedGood.recipeId) {
                const recipe = recipes.find(r => r.id === finishedGood.recipeId);
                if (recipe) {
                    for (const ingredient of recipe.ingredients) {
                        const ingInvIndex = inventory.findIndex(i => i.id === ingredient.inventoryId);
                        if (ingInvIndex > -1) {
                            const requiredQty = ingredient.quantity * orderItem.qty;
                            if (inventory[ingInvIndex].stock >= requiredQty) {
                                inventory[ingInvIndex].stock -= requiredQty;
                                // Log ingredient depletion
                                inventoryLogs.unshift({
                                    id: `log-${uuidv4()}`, timestamp: new Date().toISOString(), itemId: ingredient.inventoryId, itemName: inventory[ingInvIndex].name,
                                    action: 'Sales Depletion', quantityChange: -requiredQty, responsibleUser: tab.waiterId,
                                    notes: `Used for ${orderItem.qty}x ${finishedGood.name}`
                                });
                            } else {
                                stockSufficient = false;
                                console.error(`INSUFFICIENT INGREDIENT: ${inventory[ingInvIndex].name} for ${finishedGood.name}`);
                            }
                        } else {
                             stockSufficient = false;
                             console.error(`INGREDIENT NOT FOUND: ${ingredient.inventoryId} for ${finishedGood.name}`);
                        }
                    }
                } else {
                    console.warn(`Recipe with ID ${finishedGood.recipeId} not found for item ${finishedGood.name}. Depleting item directly.`);
                     inventory[inventory.findIndex(i => i.id === finishedGood.id)].stock -= orderItem.qty;
                }
            } 
            // B. If no recipe, deplete the item itself
            else {
                const invItemIndex = inventory.findIndex(inv => inv.id === orderItem.menuItemId);
                if (inventory[invItemIndex].stock >= orderItem.qty) {
                    inventory[invItemIndex].stock -= orderItem.qty;
                     inventoryLogs.unshift({
                        id: `log-${uuidv4()}`, timestamp: new Date().toISOString(), itemId: finishedGood.id, itemName: finishedGood.name,
                        action: 'Sales Depletion', quantityChange: -orderItem.qty, responsibleUser: tab.waiterId,
                        notes: `Direct sale`
                    });
                } else {
                    stockSufficient = false;
                    console.error(`INSUFFICIENT STOCK for ${finishedGood.name}.`);
                }
            }
        });

        if (!stockSufficient) {
            alert("Transaction failed due to insufficient stock for one or more items. Please check inventory.");
            return false;
        }

        // --- 3. Create a new sales log entry ---
        const subtotal = tab.items.reduce((acc, item) => acc + item.price * item.qty, 0);
        const newSaleLog: SaleLog = {
            id: `sale-${uuidv4()}`,
            timestamp: new Date().toISOString(),
            waiterId: tab.waiterId,
            tableNumber: tab.tableNumber,
            items: tab.items,
            subtotal: subtotal,
            total: paymentDetails.totalAmount,
            paymentMethod: paymentDetails.paymentMethod,
            discount: tab.discount,
        };
        saleLogs.unshift(newSaleLog); // Add to the beginning of the array

        // --- 4. Update table status (if it's not a walk-in) ---
        let updatedTables = tables;
        if (tab.tableNumber > 0) {
            updatedTables = tables.map(t =>
                t.number === tab.tableNumber
                    ? { ...t, status: 'Available', tabId: null }
                    : t
            );
        }

        // --- 5. Remove the closed tab ---
        delete tabs[tab.id];

        // --- 6. Save all updated data back to localStorage ---
        localStorage.setItem('inventory', JSON.stringify(inventory));
        localStorage.setItem('tables_data', JSON.stringify(updatedTables));
        localStorage.setItem('tabs_data', JSON.stringify(tabs));
        localStorage.setItem('sale_logs', JSON.stringify(saleLogs));
        localStorage.setItem('inventory_logs', JSON.stringify(inventoryLogs));

        // --- 7. Dispatch events to notify the UI to re-render ---
        document.dispatchEvent(new CustomEvent('data_updated'));
        document.dispatchEvent(new CustomEvent('finance_updated'));

        console.log(`Transaction for Tab ID ${tab.id} processed successfully.`);
        return true;

    } catch (error) {
        console.error("Failed to process order payment:", error);
        alert("An unexpected error occurred while processing the payment. Please check the console.");
        return false;
    }
};