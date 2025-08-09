import { MarketListItem } from '../../../types.ts';

export const initialMarketList: MarketListItem[] = [
    // --- DRY GOODS ---
    { id: 'ML-DG-001', name: 'White Rice', volume: '25 kg', supplier: 'Puregold', price: 1500, category: 'Dry Goods', priority: 'Essential', status: 'Not Ordered', brand: 'Sinandomeng' },
    { id: 'ML-DG-002', name: 'All-purpose Flour', volume: '1 kg', piecesPerBox: 12, caseQuantity: 12, brand: 'Gold Medal', supplier: 'MSCS PrimeGoods', price: 360, category: 'Dry Goods', priority: 'Essential', status: 'Not Ordered' },
    { id: 'ML-DG-003', name: 'Calumet Baking Powder', volume: '1 kg', piecesPerBox: 6, caseQuantity: 6, brand: 'Calumet', supplier: 'MSCS PrimeGoods', price: 1800, category: 'Dry Goods', priority: 'Recommended', status: 'Not Ordered' },
    { id: 'ML-DG-004', name: 'White Sugar', volume: '1 kg', piecesPerBox: 12, caseQuantity: 12, brand: 'Victorias', supplier: 'Gaisano', price: 900, category: 'Dry Goods', priority: 'Essential', status: 'Ordered' },

    // --- FRUITS ---
    { id: 'ML-FR-001', name: 'Lemons', weight: '5 kg', supplier: 'Carbon Market', price: 1000, category: 'Fruits', priority: 'Essential', status: 'Delivered' },
    { id: 'ML-FR-002', name: 'Limes', weight: '5 kg', supplier: 'MetroMart', price: 1200, category: 'Fruits', priority: 'Essential', status: 'Delivered' },
    { id: 'ML-FR-003', name: 'Mangoes', weight: '10 kg', brand: 'Local Cebu Mango', supplier: 'Carbon Market', price: 1500, category: 'Fruits', priority: 'Recommended', status: 'Not Ordered' },
    { id: 'ML-FR-004', name: 'Calamansi', weight: '5 kg', supplier: 'Carbon Market', price: 900, category: 'Fruits', priority: 'Essential', status: 'Not Ordered' },

    // --- LIQUOR ---
    { id: 'ML-LQ-001', name: 'San Miguel Pale Pilsen', volume: '330 ml', piecesPerBox: 24, caseQuantity: 24, brand: 'San Miguel', supplier: 'Puregold', price: 1200, category: 'Liquor', priority: 'Essential', status: 'Ordered' },
    { id: 'ML-LQ-002', name: 'Ginebra Gin', volume: '700 ml', piecesPerBox: 12, caseQuantity: 12, brand: 'Ginebra San Miguel', supplier: 'MetroMart', price: 2000, category: 'Liquor', priority: 'Essential', status: 'Not Ordered' },
    { id: 'ML-LQ-003', name: 'Tanduay Rum', volume: '1 L', piecesPerBox: 12, caseQuantity: 12, brand: 'Tanduay', supplier: 'Puregold', price: 2500, category: 'Liquor', priority: 'Essential', status: 'Not Ordered' },
    { id: 'ML-LQ-004', name: 'Red Horse Beer', volume: '500 ml', piecesPerBox: 12, caseQuantity: 12, brand: 'San Miguel', supplier: 'Gaisano', price: 1500, category: 'Liquor', priority: 'Recommended', status: 'Not Ordered' },
    { id: 'ML-LQ-005', name: 'Absolut Vodka', volume: '750 ml', piecesPerBox: 12, caseQuantity: 12, brand: 'Absolut', supplier: 'MetroMart', price: 7500, category: 'Liquor', priority: 'Recommended', status: 'Not Ordered' },
    { id: 'ML-LQ-006', name: 'Johnnie Walker Whiskey', volume: '750 ml', piecesPerBox: 12, caseQuantity: 12, brand: 'Johnnie Walker', supplier: 'Shopee Philippines', price: 9000, category: 'Liquor', priority: 'Recommended', status: 'Not Ordered' },
];