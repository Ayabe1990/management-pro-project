import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  className?: string;
}

const Barcode = forwardRef<HTMLCanvasElement | null, BarcodeProps>(({ value, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useImperativeHandle(ref, () => canvasRef.current);

    useEffect(() => {
        if (canvasRef.current && value) {
            try {
                JsBarcode(canvasRef.current, value, {
                    format: 'CODE128',
                    displayValue: false,
                    margin: 10,
                    width: 2,
                    height: 50,
                    background: '#161B22', // bg-dark-card
                    lineColor: '#E6EDF3', // text-light-text
                });
            } catch (error) {
                console.error("Failed to generate barcode:", error);
            }
        }
    }, [value]);

    return <canvas ref={canvasRef} className={className} />;
});

export default Barcode;