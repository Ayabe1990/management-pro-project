import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';

const FaceRegistration: React.FC = () => {
    const { user, markFaceAsRegistered } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isRegistering, setIsRegistering] = useState(false);
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
                setError("Camera access denied. Please enable camera permissions in your browser settings to continue.");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleRegister = () => {
        if (!user) return;
        setIsRegistering(true);
        // Simulate a network request to save the face data
        setTimeout(() => {
            markFaceAsRegistered(user.id);
            // The AuthContext will update the user, and DashboardRouter will re-render,
            // removing this component and showing the main dashboard.
        }, 2000);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-dark-bg animate-fade-in">
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg p-8 text-center">
                <h1 className="text-3xl font-bold font-display text-primary">First-Time Setup</h1>
                <h2 className="text-xl font-semibold text-light-text mt-1">Facial Recognition</h2>
                
                <p className="text-medium-text my-6">Welcome, {user?.name}! For security, we need to register your face for clock-in and clock-out verification. Please position your face within the oval.</p>

                <div className="w-full aspect-video rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center relative overflow-hidden mb-6">
                    {error ? (
                        <p className="text-danger p-4">{error}</p>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2/3 h-5/6 border-4 border-primary/50 rounded-[50%] animate-pulse"></div>
                            </div>
                        </>
                    )}
                </div>

                {isRegistering ? (
                    <div className="flex flex-col items-center justify-center py-3 space-y-2">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-primary animate-pulse">Registering your face...</p>
                    </div>
                ) : (
                    <button
                        onClick={handleRegister}
                        disabled={!!error || isRegistering}
                        className="w-full bg-success hover:bg-success/80 text-white font-bold py-3 px-5 rounded-lg transition text-lg disabled:opacity-50"
                    >
                        Register My Face
                    </button>
                )}
            </div>
        </div>
    );
};

export default FaceRegistration;