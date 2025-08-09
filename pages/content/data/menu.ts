import { MasterInventoryItem } from '../../../types.ts';

export const initialMenu: MasterInventoryItem[] = [
  // --- APPETIZERS ---
  {
    id: 'MENU-APP-01', name: 'Sizzling Sisig', brand: 'House Special', category: 'Appetizers', department: 'Kitchen', type: 'finished',
    stock: 50, recipeId: 'R-SISIG', price: 250, srp: 260, isEnabledOnPOS: true,
    unitType: 'pcs', packagingType: 'pack', costPerUnit: 120, reorderLevel: 10, supplier: 'Internal', barcode: '', isArchived: false, caseQuantity: 1,
  },
  {
    id: 'MENU-APP-02', name: 'Calamares', brand: 'House Special', category: 'Appetizers', department: 'Kitchen', type: 'finished',
    stock: 50, price: 220, srp: 220, isEnabledOnPOS: true,
    unitType: 'pcs', packagingType: 'pack', costPerUnit: 100, reorderLevel: 10, supplier: 'Internal', barcode: '', isArchived: false, caseQuantity: 1,
  },

  // --- MAIN COURSE ---
  {
    id: 'MENU-MAIN-01', name: 'Chicken Adobo', brand: 'House Special', category: 'Main Course', department: 'Kitchen', type: 'finished',
    stock: 30, recipeId: 'R-ADOBO', price: 280, srp: 280, isEnabledOnPOS: true,
    unitType: 'pcs', packagingType: 'pack', costPerUnit: 130, reorderLevel: 5, supplier: 'Internal', barcode: '', isArchived: false, caseQuantity: 1,
  },
  {
    id: 'MENU-MAIN-02', name: 'Crispy Pata', brand: 'House Special', category: 'Main Course', department: 'Kitchen', type: 'finished',
    stock: 20, price: 750, srp: 780, isEnabledOnPOS: true,
    unitType: 'pcs', packagingType: 'pack', costPerUnit: 400, reorderLevel: 5, supplier: 'Internal', barcode: '', isArchived: false, caseQuantity: 1,
  },

  // --- DESSERTS ---
  {
    id: 'MENU-DSRT-01', name: 'Leche Flan', brand: 'House Special', category: 'Desserts', department: 'Kitchen', type: 'finished',
    stock: 40, price: 120, srp: 120, isEnabledOnPOS: true,
    unitType: 'pcs', packagingType: 'pack', costPerUnit: 50, reorderLevel: 10, supplier: 'Internal', barcode: '', isArchived: false, caseQuantity: 1,
  },

  // --- BEVERAGES (NON-ALCOHOLIC) ---
   {
    id: 'MENU-BEV-01', name: 'House Iced Tea', brand: 'House Blend', category: 'Beverages', department: 'Bar', type: 'finished',
    stock: 100, recipeId: 'R-ICEDTEA', price: 60, srp: 60, isEnabledOnPOS: true,
    unitType: 'pcs', packagingType: 'pack', costPerUnit: 15, reorderLevel: 20, supplier: 'Internal', barcode: '', isArchived: false, caseQuantity: 1,
  },
   {
    id: 'MENU-BEV-02', name: 'Coke in Can', brand: 'Coca-Cola', category: 'Beverages', department: 'General', type: 'finished',
    stock: 100, price: 70, srp: 70, isEnabledOnPOS: true, isTrackOpenVolume: false,
    unitType: 'can', packagingType: 'can', costPerUnit: 25, reorderLevel: 48, supplier: 'Coca-Cola FEMSA', barcode: '4801234567890', isArchived: false, caseQuantity: 24
  },
   {
    id: 'MENU-BEV-03', name: 'Bottled Water', brand: 'Wilkins', category: 'Beverages', department: 'General', type: 'finished',
    stock: 100, price: 50, srp: 50, isEnabledOnPOS: true,
    unitType: 'bottle', packagingType: 'bottle', costPerUnit: 15, reorderLevel: 48, supplier: 'Coca-Cola FEMSA', barcode: '', isArchived: false, caseQuantity: 24,
  },

  // --- COCKTAILS ---
  {
    id: 'MENU-CKTL-01', name: 'Mojito', brand: 'House Mix', category: 'Cocktails', department: 'Bar', type: 'finished',
    stock: 50, recipeId: 'R-MOJITO', price: 180, srp: 200, isEnabledOnPOS: true,
    unitType: 'pcs', packagingType: 'pack', costPerUnit: 80, reorderLevel: 10, supplier: 'Internal', barcode: '', isArchived: false, caseQuantity: 1,
  },
  {
    id: 'MENU-CKTL-02', name: 'Margarita', brand: 'House Mix', category: 'Cocktails', department: 'Bar', type: 'finished',
    stock: 50, price: 200, srp: 220, isEnabledOnPOS: true,
    unitType: 'pcs', packagingType: 'pack', costPerUnit: 90, reorderLevel: 10, supplier: 'Internal', barcode: '', isArchived: false, caseQuantity: 1,
  },
];