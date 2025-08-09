import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, Page, UserRole, Notification } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { BellIcon, Bars3Icon, PencilIcon } from './icons.tsx';
import NetworkStatus from './NetworkStatus.tsx';
import NeonStatusIcon from './NeonStatusIcon.tsx';
import { useEditMode } from '../contexts/EditModeContext.tsx';

interface HeaderProps {
  user: User;
  title: string;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, title, onToggleSidebar }) => {
  const { toggleBusinessStatus, businessStatus } = useAuth();
  const { isEditMode, toggleEditMode } = useEditMode();

  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const loadNotifications = useCallback(() => {
      const stored = localStorage.getItem('notifications');
      const allNots: Notification[] = stored ? JSON.parse(stored) : [];
      const userNots = allNots.filter(n => n.userId === user.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(userNots);
      setUnreadCount(userNots.filter(n => !n.isRead).length);
  }, [user.id]);
  
  useEffect(() => {
      loadNotifications(); 
      document.addEventListener('notifications_updated', loadNotifications);
      return () => document.removeEventListener('notifications_updated', loadNotifications);
  }, [loadNotifications]);

  const handleBellClick = () => {
      setShowNotifications(prev => !prev);
      if (!showNotifications) { 
          const allStoredNots: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
          const updatedNots = allStoredNots.map(n => n.userId === user.id ? { ...n, isRead: true } : n);
          localStorage.setItem('notifications', JSON.stringify(updatedNots));
          setUnreadCount(0);
      }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canControlBusinessStatus = [UserRole.Manager, UserRole.Owner, UserRole.Developer, UserRole.SuperDeveloper].includes(user.role);
  const isOwner = user.role === UserRole.Owner;

  return (
      <header className="fixed top-0 left-0 right-0 h-20 bg-dark-card/80 backdrop-blur-sm border-b border-dark-border px-6 flex items-center justify-between z-40 lg:pl-72">
        <div className="flex items-center gap-4">
            <button onClick={onToggleSidebar} className="p-2 rounded-full hover:bg-white/10 transition-colors lg:hidden">
                <Bars3Icon className="w-8 h-8 text-light-text" />
            </button>
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold font-display text-white tracking-wider">{title}</h1>
            </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
              <div className="font-display text-lg tracking-wider">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
              <div className="text-xs text-medium-text">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          </div>
          {isOwner && (
            <button onClick={toggleEditMode} title="Toggle Edit Mode" className={`p-2 rounded-full transition-colors ${isEditMode ? 'bg-primary/30 text-primary' : 'hover:bg-white/10'}`}>
              <PencilIcon className="w-6 h-6" />
            </button>
          )}
          <NetworkStatus />
          {canControlBusinessStatus && (
                <div title="Toggle Business Status" className="cursor-pointer" onClick={toggleBusinessStatus}>
                    <NeonStatusIcon status={businessStatus} />
                </div>
          )}
          
          <div className="relative" ref={notificationRef}>
            <button onClick={handleBellClick} className="relative p-1">
              <BellIcon className="w-7 h-7 text-light-text hover:text-white transition-colors cursor-pointer" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-xs text-white animate-pulse">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-lg shadow-lg p-2 z-20">
                  <div className="p-2 font-semibold border-b border-dark-border mb-2">Notifications</div>
                  <ul className="space-y-1 max-h-80 overflow-y-auto hide-scrollbar">
                    {notifications.length === 0 && <li className="px-3 py-4 text-center text-sm text-medium-text">No new notifications.</li>}
                    {notifications.map(not => (
                      <li key={not.id} className="text-light-text text-sm p-3 rounded-md bg-dark-bg/50">
                          <p>{not.message}</p>
                          <p className="text-xs text-medium-text mt-1">{new Date(not.timestamp).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
              </div>
            )}
          </div>
        </div>
      </header>
  );
};

export default Header;