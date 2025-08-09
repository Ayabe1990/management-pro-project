import React, { useState, useEffect, useRef } from 'react';
import { EventTicket } from '../../types.ts';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const QRCodePreview: React.FC<{ value: string; className?: string }> = ({ value, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasRef.current && value) {
            QRCode.toCanvas(canvasRef.current, value, {
                width: 128,
                margin: 1,
                color: { dark: '#E6EDF3', light: '#161B22' }
            }, (err) => {
                if (err) console.error("QR Code Preview Error:", err);
            });
        }
    }, [value]);
    return <canvas ref={canvasRef} className={className} />;
};


const TicketGeneratorPage: React.FC = () => {
    const [tickets, setTickets] = useState<EventTicket[]>([]);
    const [eventName, setEventName] = useState('');
    const [attendeeName, setAttendeeName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [lastGeneratedBatch, setLastGeneratedBatch] = useState<EventTicket[]>([]);
    
    useEffect(() => {
        try {
            const storedTickets = localStorage.getItem('event_tickets');
            if (storedTickets) {
                setTickets(JSON.parse(storedTickets));
            }
        } catch (error) {
            console.error("Error loading tickets from localStorage:", error);
        }
    }, []);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventName || !attendeeName || !expiryDate || quantity < 1) return;

        const newTickets: EventTicket[] = [];
        for (let i = 0; i < quantity; i++) {
            const finalAttendeeName = quantity > 1 ? `${attendeeName} (${i + 1}/${quantity})` : attendeeName;
            const newTicket: EventTicket = {
                id: `TICKET-${uuidv4().toUpperCase()}`,
                eventName,
                attendeeName: finalAttendeeName,
                expiryDate,
                status: 'Active',
            };
            newTickets.push(newTicket);
        }

        const updatedTickets = [...newTickets, ...tickets];
        setTickets(updatedTickets);
        setLastGeneratedBatch(newTickets);
        localStorage.setItem('event_tickets', JSON.stringify(updatedTickets));
        
        alert(`Successfully generated ${quantity} ticket(s) for ${eventName}.`);

        setAttendeeName('');
        setExpiryDate('');
        setQuantity(1);
    };
    
    const handleDownloadAllAsPDF = async () => {
        if (lastGeneratedBatch.length === 0) return;
        const doc = new jsPDF();

        for (let i = 0; i < lastGeneratedBatch.length; i++) {
            const ticket = lastGeneratedBatch[i];
            if (i > 0) doc.addPage();

            doc.setFontSize(22);
            doc.text(ticket.eventName, 105, 20, { align: 'center' });

            doc.setFontSize(16);
            doc.text(`Admit One: ${ticket.attendeeName}`, 105, 40, { align: 'center' });

            doc.setFontSize(10);
            doc.text(`Valid until: ${new Date(ticket.expiryDate).toLocaleDateString()}`, 105, 50, { align: 'center' });

            try {
                const qrCodeDataUrl = await QRCode.toDataURL(ticket.id, { width: 256, margin: 2, errorCorrectionLevel: 'H' });
                doc.addImage(qrCodeDataUrl, 'PNG', 65, 70, 80, 80);
            } catch (e) {
                console.error("PDF QR Generation Error:", e);
                doc.text(`Error generating QR code for ${ticket.id}`, 20, 80);
            }
        }
        doc.save(`Tickets-${lastGeneratedBatch[0].eventName.replace(/\s/g, '_')}.pdf`);
    };

    return (
        <div className="h-full">
            <h2 className="text-3xl font-bold font-display mb-6">Event Ticket Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form onSubmit={handleGenerate} className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-primary">Ticket Details</h3>
                    <div>
                        <label className="text-sm text-medium-text">Event Name</label>
                        <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g., New Year's Eve Party" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1" required />
                    </div>
                    <div>
                        <label className="text-sm text-medium-text">Attendee Name</label>
                        <input type="text" value={attendeeName} onChange={e => setAttendeeName(e.target.value)} placeholder="e.g., Juan Dela Cruz" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1" required />
                    </div>
                    <div>
                        <label className="text-sm text-medium-text">Expiry Date</label>
                        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1" required />
                    </div>
                     <div>
                        <label className="text-sm text-medium-text">Quantity of Tickets</label>
                        <input 
                            type="number" 
                            value={quantity} 
                            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                            min="1"
                            className="w-full bg-dark-bg p-2 rounded-md border border-dark-border mt-1" 
                            required 
                        />
                    </div>
                    <button type="submit" className="w-full bg-success hover:bg-success/80 text-white font-bold py-3 rounded-lg transition">Generate Ticket(s)</button>
                </form>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center flex flex-col items-center justify-center">
                    {lastGeneratedBatch.length > 0 ? (
                        <div className="animate-fade-in w-full flex flex-col items-center">
                            <h3 className="text-xl font-semibold text-primary mb-2">Generated Tickets</h3>
                            
                            {lastGeneratedBatch.length > 5 && (
                                <p className="text-sm text-medium-text mb-4">Showing 5 of {lastGeneratedBatch.length} generated tickets.</p>
                            )}
                            
                            <button onClick={handleDownloadAllAsPDF} className="mb-4 w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-lg transition">
                                Download All as PDF
                            </button>
                            
                            <div className="w-full space-y-4 overflow-y-auto max-h-96 hide-scrollbar">
                                {lastGeneratedBatch.slice(0, 5).map(ticket => (
                                    <div key={ticket.id} className="bg-dark-bg p-4 rounded-lg flex flex-col items-center">
                                        <p className="font-bold text-lg">{ticket.eventName}</p>
                                        <p className="text-sm text-light-text">For: {ticket.attendeeName}</p>
                                        <p className="text-xs text-medium-text">Valid until: {new Date(ticket.expiryDate).toLocaleDateString()}</p>
                                        <QRCodePreview value={ticket.id} className="rounded-lg mt-2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-medium-text">Your generated ticket QR code(s) will appear here.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketGeneratorPage;