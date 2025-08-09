import React, { useState, useEffect } from 'react';
import { WifiIcon } from './icons.tsx';

const NetworkStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div title={isOnline ? 'Online' : 'Offline'}>
            <WifiIcon isOnline={isOnline} className={`w-6 h-6 ${isOnline ? 'text-green-400' : 'text-red-500'}`} />
        </div>
    );
};

export default NetworkStatus;