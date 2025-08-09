import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from './icons.tsx';

interface FaceAuthProps {
    onSuccess: () => void;
    onClose: () => void;
}

const FaceAuth: React.FC<FaceAuthProps> = ({ onSuccess, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Camera access denied. Please enable camera permissions in your browser settings.");
            }
        };

        startCamera();

        return () => {
            // Stop the camera stream when the component unmounts
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleVerify = () => {
        setIsVerifying(true);
        // Simulate a network request for face verification
        setTimeout(() => {
            // In a real app, you would send a snapshot to a verification service.
            // For this demo, we will always succeed.
            onSuccess();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Facial Verification</h2>
                    <button onClick={onClose} className="text-medium-text hover:text-white"><XMarkIcon /></button>
                </div>
                
                <p className="text-medium-text mb-4">Position your face within the oval to clock in or out.</p>

                <div className="w-full aspect-square rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center relative overflow-hidden mb-4">
                    {error ? (
                        <p className="text-danger p-4">{error}</p>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3/4 h-3/4 border-4 border-primary/50 rounded-[50%] animate-pulse"></div>
                            </div>
                        </>
                    )}
                </div>

                {isVerifying ? (
                    <div className="flex flex-col items-center justify-center py-3 space-y-2">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-primary animate-pulse">Verifying...</p>
                    </div>
                ) : (
                    <button
                        onClick={handleVerify}
                        disabled={!!error || isVerifying}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        Verify Identity
                    </button>
                )}
            </div>
        </div>
    );
};

export default FaceAuth;
