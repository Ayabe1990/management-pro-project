import React, { useState, useEffect, useRef } from 'react';
import { Voucher, MasterInventoryItem } from '../../types.ts';
import Barcode from '../../components/Barcode.tsx';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const VoucherGeneratorPage: React.FC = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [menuItems, setMenuItems] = useState<MasterInventoryItem[]>([]);
    const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [lastGeneratedBatch, setLastGeneratedBatch] = useState<Voucher[]>([]);

    useEffect(() => {
        try {
            const storedVouchers = localStorage.getItem('vouchers');
            if (storedVouchers) setVouchers(JSON.parse(storedVouchers));

            const storedInventory = localStorage.getItem('inventory');
            if (storedInventory) {
                const finishedGoods = (JSON.parse(storedInventory) as MasterInventoryItem[])
                    .filter(item => item.type === 'finished' && item.isEnabledOnPOS);
                setMenuItems(finishedGoods);
                if (finishedGoods.length > 0) {
                    setSelectedMenuItemId(finishedGoods[0].id);
                }
            }
        } catch (error) {
            console.error("Error loading data from localStorage:", error);
        }
    }, []);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedItem = menuItems.find(item => item.id === selectedMenuItemId);
        if (!selectedItem || !expiryDate || quantity < 1) return;
        
        const newVouchers: Voucher[] = [];
        for (let i = 0; i < quantity; i++) {
            const newVoucher: Voucher = {
                id: `VOUCHER-${uuidv4().toUpperCase()}`,
                code: `VCHR-${Date.now() + i}`,
                menuItemId: selectedItem.id,
                itemName: selectedItem.name,
                expiryDate,
                status: 'Active',
            };
            newVouchers.push(newVoucher);
        }

        const updatedVouchers = [...newVouchers, ...vouchers];
        setVouchers(updatedVouchers);
        setLastGeneratedBatch(newVouchers);
        localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));
        
        alert(`Successfully generated ${quantity} voucher(s) for ${selectedItem.name}.`);

        setExpiryDate('');
        setQuantity(1);
    };
    
    const handleDownloadAllAsPDF = () => {
        if (lastGeneratedBatch.length === 0) return;

        const doc = new jsPDF();
        const tempCanvas = document.createElement('canvas');

        lastGeneratedBatch.forEach((voucher, index) => {
            if (index > 0) doc.addPage();
            
            doc.setFontSize(22);
            doc.text('Promotional Voucher', 105, 20, { align: 'center' });
            doc.setFontSize(16);
            doc.text(voucher.itemName, 105, 40, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Expires: ${new Date(voucher.expiryDate).toLocaleDateString()}`, 105, 50, { align: 'center' });

            try {
                JsBarcode(tempCanvas, voucher.id, {
                    format: 'CODE128', displayValue: true, margin: 10,
                    width: 2, height: 60, fontSize: 12
                });
                const barcodeDataUrl = tempCanvas.toDataURL('image/png');
                doc.addImage(barcodeDataUrl, 'PNG', 40, 70, 130, 50);
            } catch (e) {
                console.error(e);
                doc.text(`Error generating barcode for ${voucher.id}`, 20, 80);
            }
        });
        doc.save(`Vouchers-${lastGeneratedBatch[0].itemName.replace(/\s/g, '_')}.pdf`);
    };

    return (
        <div className="h-full">
            <h2 className="text-3xl font-bold font-display mb-6">Promotional Voucher Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form onSubmit={handleGenerate} className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-primary">Voucher Details</h3>
                    <div>
                        <label className="text-sm text-medium-text">Select Menu Item</label>
                        <select
                            value={selectedMenuItemId}
                            onChange={(e) => setSelectedMenuItemId(e.target.value)}
                            className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1"
                            required
                        >
                            {menuItems.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-medium-text">Expiry Date</label>
                        <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1"
                            required
                        />
                    </div>
                     <div>
                        <label className="text-sm text-medium-text">Quantity to Generate</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-success hover:bg-success/80 text-white font-bold py-3 rounded-lg transition">
                        Generate Voucher(s)
                    </button>
                </form>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center flex flex-col items-center justify-center">
                    {lastGeneratedBatch.length > 0 ? (
                        <div className="animate-fade-in w-full flex flex-col items-center">
                            <h3 className="text-xl font-semibold text-primary mb-2">Generated Vouchers</h3>
                            {lastGeneratedBatch.length > 5 && (
                                <p className="text-sm text-medium-text mb-4">
                                    Showing 5 of {lastGeneratedBatch.length} generated vouchers.
                                </p>
                            )}
                            <button onClick={handleDownloadAllAsPDF} className="mb-4 w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-lg transition">
                                Download All as PDF
                            </button>
                            <div className="w-full space-y-4 overflow-y-auto max-h-96 hide-scrollbar">
                                {lastGeneratedBatch.slice(0, 5).map(voucher => (
                                    <div key={voucher.id} className="bg-dark-bg p-4 rounded-lg">
                                        <p className="font-bold text-lg">{voucher.itemName}</p>
                                        <p className="text-sm text-medium-text">Expires: {new Date(voucher.expiryDate).toLocaleDateString()}</p>
                                        <Barcode value={voucher.id} className="max-w-full mt-2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-medium-text">Your generated voucher(s) will appear here.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoucherGeneratorPage;