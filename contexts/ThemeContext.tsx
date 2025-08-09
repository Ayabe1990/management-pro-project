import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext.tsx';
import { UserRole, RoleTheme } from '../types.ts';

const themes: Record<UserRole, RoleTheme> = {
    [UserRole.Bartender]: { bg: 'role-bg-bartender', primary: 'text-theme-bartender', accent: 'border-theme-bartender', name: 'Bartender Theme' },
    [UserRole.Kitchen]: { bg: 'role-bg-kitchen', primary: 'text-theme-kitchen', accent: 'border-theme-kitchen', name: 'Kitchen Theme' },
    [UserRole.Manager]: { bg: 'role-bg-manager', primary: 'text-theme-manager', accent: 'border-theme-manager', name: 'Manager Theme' },
    [UserRole.Owner]: { bg: 'role-bg-owner', primary: 'text-theme-owner', accent: 'border-theme-owner', name: 'Owner Theme' },
    // Default themes for other roles
    [UserRole.Waiter]: { bg: 'role-bg-default', primary: 'text-primary', accent: 'border-primary', name: 'Default Theme' },
    [UserRole.Security]: { bg: 'role-bg-default', primary: 'text-primary', accent: 'border-primary', name: 'Default Theme' },
    [UserRole.HR]: { bg: 'role-bg-manager', primary: 'text-theme-manager', accent: 'border-theme-manager', name: 'Manager Theme' },
    [UserRole.Developer]: { bg: 'role-bg-default', primary: 'text-primary', accent: 'border-primary', name: 'Default Theme' },
    [UserRole.SuperDeveloper]: { bg: 'role-bg-default', primary: 'text-primary', accent: 'border-primary', name: 'Default Theme' },
};

const defaultTheme: RoleTheme = { bg: 'role-bg-default', primary: 'text-primary', accent: 'border-primary', name: 'Default Theme' };

const ThemeContext = createContext<RoleTheme>(defaultTheme);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    
    const theme = useMemo(() => {
        if (user && themes[user.role]) {
            return themes[user.role];
        }
        return defaultTheme;
    }, [user]);

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
