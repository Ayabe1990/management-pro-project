import React, { useState, useMemo } from 'react';
import { Page, User, UserRole } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { LogoutIcon, UserCircleIcon, ChevronRightIcon, XMarkIcon } from './icons.tsx';

interface SidebarProps {
  user: User;
  pages: Page[];
  activePage: Page;
  onSelectPage: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{ page: Page; isActive: boolean; onClick: () => void; }> = ({ page, isActive, onClick }) => (
    <li>
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-200 flex items-center gap-3 ${isActive ? 'bg-primary/20 text-primary font-bold shadow-glow-sm-primary' : 'text-light-text hover:bg-white/10'}`}
        >
            {page.icon && <page.icon className="w-5 h-5 flex-shrink-0" />}
            <span>{page.title}</span>
        </button>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ user, pages, activePage, onSelectPage, isOpen, onClose }) => {
    const { logout } = useAuth();
    const [isMultiUserMode] = useState(JSON.parse(localStorage.getItem('app_settings') || '{}').multiUserMode === true);

    const groupedPages = useMemo(() => pages.reduce((acc, page) => {
        const group = page.group || 'Other';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(page);
        return acc;
    }, {} as Record<string, Page[]>), [pages]);
    
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
        Object.keys(groupedPages).reduce((acc, groupName) => {
            acc[groupName] = true;
            return acc;
        }, {} as Record<string, boolean>)
    );


    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({...prev, [groupName]: !prev[groupName]}));
    };

    const handleSelect = (page: Page) => {
        onSelectPage(page);
        onClose();
    };
    
    return (
        <>
            <aside className={`fixed top-0 left-0 h-full w-64 bg-dark-card border-r border-dark-border z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-4 border-b border-dark-border flex-shrink-0 flex items-center justify-between">
                    <h1 className="text-2xl font-bold font-display text-white">
                        Management<span className="text-primary">Pro</span>
                    </h1>
                     <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 lg:hidden">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </div>

                <div className="flex-grow p-4 overflow-y-auto hide-scrollbar">
                    <nav className="space-y-4">
                        {Object.entries(groupedPages).map(([groupName, groupPages]) => (
                            <div key={groupName}>
                                <button onClick={() => toggleGroup(groupName)} className="w-full flex justify-between items-center text-xs font-bold uppercase text-medium-text tracking-wider px-2 py-1 mb-2">
                                    {groupName}
                                    <ChevronRightIcon className={`w-4 h-4 transition-transform ${expandedGroups[groupName] ? 'rotate-90' : ''}`} />
                                </button>
                                {expandedGroups[groupName] && (
                                     <ul className="space-y-1 animate-fade-in">
                                        {groupPages.map(page => (
                                            <NavItem key={page.title} page={page} isActive={activePage.title === page.title} onClick={() => handleSelect(page)} />
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
                
                <div className="p-4 border-t border-dark-border flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <UserCircleIcon className="w-10 h-10 text-primary"/>
                        <div>
                            <p className="font-bold text-light-text">{user.name.split('(')[0].trim()}</p>
                            <p className="text-xs text-medium-text font-mono">{user.role}</p>
                        </div>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-2 text-left px-4 py-2 text-sm text-danger hover:bg-danger/20 rounded-lg transition-colors"
                    >
                      <LogoutIcon className="w-5 h-5" />
                      {isMultiUserMode ? 'Logout to Lobby' : 'Logout'}
                    </button>
                </div>
            </aside>
            {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />}
        </>
    );
};

export default Sidebar;