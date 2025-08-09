import { ActivityLog, User } from '../types.ts';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

export const logActivity = (action: string, user: User | null) => {
    if (!user) {
        console.warn("Cannot log activity for null user.");
        return;
    }
    
    try {
        const logs: ActivityLog[] = JSON.parse(localStorage.getItem('activity_logs') || '[]');
        
        const newLog: ActivityLog = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            userId: user.id,
            userName: user.name,
            action,
        };

        const updatedLogs = [newLog, ...logs];
        localStorage.setItem('activity_logs', JSON.stringify(updatedLogs));
        
        // Dispatch an event to notify pages (like the ActivityLogPage) to update
        document.dispatchEvent(new CustomEvent('activity_log_updated'));

    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};
