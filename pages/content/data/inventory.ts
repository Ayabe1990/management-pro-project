import { MasterInventoryItem } from '../../../types.ts';

export const initialInventory: MasterInventoryItem[] = [
  // --- BAR: LIQUOR ---
  { id: 'LIQ-RUM-01', name: 'Tanduay Rhum Dark', brand: 'Tanduay', category: 'Spirits', department: 'Bar', stock: 24, volume: 750, unitType: 'ml', packagingType: 'bottle', caseQuantity: 12, supplier: 'Tanduay Distillers', barcode: '4800032301017', costPerUnit: 120, reorderLevel: 6, isArchived: false, price: 80, isEnabledOnPOS: true },
  
  // --- BAR: BEER ---
  { id: 'BEER-SMB-01', name: 'San Miguel Pale Pilsen', brand: 'San Miguel', category: 'Beer', department: 'Bar', stock: 120, volume: 330, unitType: 'ml', packagingType: 'bottle', caseQuantity: 24, supplier: 'San Miguel Brewery', barcode: '4801032111118', costPerUnit: 40, reorderLevel: 48, isArchived: false, price: 70, isEnabledOnPOS: true },
  
  // --- GENERAL: SODA & WATER ---
  { id: 'NON-SODA-01', name: 'Coca-Cola', brand: 'Coca-Cola', category: 'Soda', department: 'General', stock: 48, volume: 330, unitType: 'ml', packagingType: 'can', caseQuantity: 24, supplier: 'Coca-Cola FEMSA', barcode: '4800024133405', costPerUnit: 25, reorderLevel: 24, isArchived: false, price: 50, isEnabledOnPOS: true },

  // --- KITCHEN: MEAT ---
  { id: 'KIT-MEA-02', name: 'Pork - Liempo', brand: 'Monterey', category: 'Meat', department: 'Kitchen', stock: 15, weight: 1000, unitType: 'g', packagingType: 'pack', caseQuantity: 1, supplier: 'Monterey Meatshop', barcode: '9876543210123', costPerUnit: 350, reorderLevel: 5, isArchived: false },
  
  // --- KITCHEN: RICE & PANTRY ---
  { id: 'KIT-RICE-01', name: 'Rice - Sinandomeng', brand: 'Local', category: 'Rice', department: 'Kitchen', stock: 50, weight: 1000, unitType: 'g', packagingType: 'sack', caseQuantity: 1, supplier: 'Local Market', barcode: '1122334455667', costPerUnit: 45, reorderLevel: 25, isArchived: false },
  { id: 'KIT-PAN-01', name: 'Cooking Oil', brand: 'Golden Fiesta', category: 'Pantry', department: 'Kitchen', stock: 15, volume: 1000, unitType: 'ml', packagingType: 'bottle', caseQuantity: 1, supplier: 'Local Supermarket', barcode: '4800010123456', costPerUnit: 80, reorderLevel: 5, isArchived: false },
];