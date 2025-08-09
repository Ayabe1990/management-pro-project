import { EquipmentInventoryItem, UserRole } from '../../../types.ts';

export const initialEquipment: EquipmentInventoryItem[] = [
    // --- KITCHEN EQUIPMENT ---
    { id: 'EQ-KIT-001', name: 'Gas Range / Oven', description: '6-burner commercial range', category: 'Kitchen', quantity: 1, price: 85000, purchaseDate: '2023-01-15', status: 'Operational' },
    { id: 'EQ-KIT-002', name: 'Deep Fryer (Double Basket)', description: 'High-capacity fryer', category: 'Kitchen', quantity: 2, price: 30000, purchaseDate: '2023-01-15', status: 'Operational' },
    { id: 'EQ-KIT-003', name: 'Commercial Refrigerator', description: '2-door upright chiller', category: 'Kitchen', quantity: 2, price: 70000, purchaseDate: '2023-01-10', status: 'Operational' },
    { id: 'EQ-KIT-004', name: 'Chest Freezer', description: 'Large capacity freezer', category: 'Kitchen', quantity: 2, price: 40000, purchaseDate: '2023-01-10', status: 'Operational' },
    { id: 'EQ-KIT-005', name: 'Stainless Work Table', description: 'Prep table 120x60cm', category: 'Kitchen', quantity: 4, price: 8000, purchaseDate: '2023-01-20', status: 'Operational' },
    { id: 'EQ-KIT-006', name: 'Food Processor', description: '12-cup capacity', category: 'Kitchen', quantity: 1, price: 15000, purchaseDate: '2023-02-01', status: 'Maintenance Required' },
    { id: 'EQ-KIT-007', name: 'Chef Knives', description: 'Set of 5 professional knives', category: 'Kitchen', quantity: 3, price: 5000, purchaseDate: '2023-01-05', status: 'Operational', issuedTo: UserRole.Kitchen },

    // --- BAR EQUIPMENT ---
    { id: 'EQ-BAR-001', name: 'Underbar Fridge', description: '2-door bottle cooler', category: 'Bar', quantity: 2, price: 55000, purchaseDate: '2023-01-12', status: 'Operational' },
    { id: 'EQ-BAR-002', name: 'Ice Maker Machine', description: '100kg/day capacity', category: 'Bar', quantity: 1, price: 75000, purchaseDate: '2023-01-12', status: 'Operational' },
    { id: 'EQ-BAR-003', name: 'Boston Shaker', description: 'Set of tin and glass shakers', category: 'Bar', quantity: 10, price: 800, purchaseDate: '2023-01-25', status: 'Operational', issuedTo: UserRole.Bartender },
    { id: 'EQ-BAR-004', name: 'Jiggers (30/60ml)', description: 'Standard measuring tool', category: 'Bar', quantity: 15, price: 300, purchaseDate: '2023-01-25', status: 'Operational' },
    { id: 'EQ-BAR-005', name: 'Blender', description: 'Heavy-duty bar blender', category: 'Bar', quantity: 2, price: 12000, purchaseDate: '2023-02-05', status: 'Operational' },

    // --- SERVICE EQUIPMENT (DINING) ---
    { id: 'EQ-DIN-001', name: 'POS Terminal', description: 'Touchscreen POS system', category: 'Dining', quantity: 3, price: 45000, purchaseDate: '2023-01-05', status: 'Operational' },
    { id: 'EQ-DIN-002', name: 'Thermal Receipt Printer', description: '80mm receipt printer', category: 'Dining', quantity: 3, price: 5000, purchaseDate: '2023-01-05', status: 'Operational' },
    { id: 'EQ-DIN-003', name: 'Service Trays', description: '16-inch non-slip trays', category: 'Dining', quantity: 20, price: 400, purchaseDate: '2023-01-20', status: 'Operational', issuedTo: UserRole.Waiter },
    { id: 'EQ-DIN-004', name: 'Water Pitcher', description: '2L capacity, polycarbonate', category: 'Dining', quantity: 10, price: 350, purchaseDate: '2023-01-20', status: 'Operational', issuedTo: UserRole.Waiter },
    { id: 'EQ-DIN-005', name: 'Cutlery Set (per 12)', description: 'Spoon and fork set', category: 'Dining', quantity: 30, price: 600, purchaseDate: '2023-01-20', status: 'Operational' },
    { id: 'EQ-DIN-006', name: 'Linen Napkins (per 24)', description: 'White cotton napkins', category: 'Dining', quantity: 10, price: 1200, purchaseDate: '2023-01-20', status: 'Operational' },
    { id: 'EQ-DIN-007', name: 'Bill Folder', description: 'Leatherette bill presenter', category: 'Dining', quantity: 15, price: 250, purchaseDate: '2023-01-20', status: 'Operational', issuedTo: UserRole.Waiter },
    { id: 'EQ-DIN-008', name: 'Highball Glasses (per 12)', description: '10 oz. highball glasses', category: 'Dining', quantity: 5, price: 800, purchaseDate: '2023-01-20', status: 'Operational' },
    { id: 'EQ-DIN-009', name: 'Wine Glasses (per 6)', description: 'Standard red wine glasses', category: 'Dining', quantity: 8, price: 900, purchaseDate: '2023-01-20', status: 'Operational' },
    
    // --- GENERAL & CLEANING ---
    { id: 'EQ-GEN-001', name: 'Trash Bins (Large)', description: '120L capacity rolling bins', category: 'General', quantity: 5, price: 2500, purchaseDate: '2023-01-05', status: 'Operational' },
    { id: 'EQ-CLN-001', name: 'Mop & Bucket Set', description: 'Industrial grade mop set', category: 'Cleaning', quantity: 3, price: 1500, purchaseDate: '2023-01-05', status: 'Operational' },
    { id: 'EQ-CLN-002', name: 'Cleaning Towels (pack of 50)', description: 'Microfiber cleaning cloths', category: 'Cleaning', quantity: 5, price: 500, purchaseDate: '2023-01-05', status: 'Operational', issuedTo: UserRole.Waiter },
    { id: 'EQ-CLN-003', name: 'All-Purpose Cleaner (Gallon)', description: 'Concentrated cleaning solution', category: 'Cleaning', quantity: 4, price: 600, purchaseDate: '2023-01-05', status: 'Operational' },
];