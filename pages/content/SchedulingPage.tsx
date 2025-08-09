import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { UserRole, User, Shift, Schedule, ScheduleApprovalRequest, Break } from '../../types.ts';
import { GoogleGenAI } from '@google/genai';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, XMarkIcon } from '../../components/icons.tsx';
import { philippineHolidays2024 } from './data/holidays.ts';
import ShiftDetailsModal from '../../components/ShiftDetailsModal.tsx';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const getWeekStartDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const formatTimeForInput = (isoString: string) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        return date.toTimeString().substring(0, 5);
    } catch(e) {
        return '';
    }
}

const SchedulingPage: React.FC = () => {
    const { user, users } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
    const [editingSchedules, setEditingSchedules] = useState<Record<string, Schedule>>({});
    const [approvalRequests, setApprovalRequests] = useState<ScheduleApprovalRequest[]>([]);
    
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const schedulableUsers = useMemo(() => {
        const operationalRoles = [UserRole.Waiter, UserRole.Bartender, UserRole.Kitchen, UserRole.Security, UserRole.Manager];
        return users.filter(u => operationalRoles.includes(u.role));
    }, [users]);

    const loadData = useCallback(() => {
        const active = JSON.parse(localStorage.getItem('active_schedule') || 'null') as Schedule | null;
        setActiveSchedule(active);
        const editing = JSON.parse(localStorage.getItem('editing_schedules') || '{}') as Record<string, Schedule>;
        setEditingSchedules(editing);
        const approvals = JSON.parse(localStorage.getItem('schedule_approvals') || '[]') as ScheduleApprovalRequest[];
        setApprovalRequests(approvals);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);
    
    const handleMonthChange = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
    };
    
    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        
        const daysArray = [];
        for (let i = 0; i < dayOffset; i++) {
            daysArray.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            daysArray.push(new Date(year, month, i));
        }
        return daysArray;
    }, [currentDate]);
    
    const getScheduleForWeek = useCallback((weekStartISO: string) => {
        if (editingSchedules[weekStartISO]) {
            return editingSchedules[weekStartISO];
        }
        if (activeSchedule?.weekStartDate === weekStartISO) {
            return activeSchedule;
        }
        return null;
    }, [activeSchedule, editingSchedules]);

    const handleSaveEditingSchedule = (schedule: Schedule) => {
        const newEditingSchedules = { ...editingSchedules, [schedule.weekStartDate]: schedule };
        setEditingSchedules(newEditingSchedules);
        localStorage.setItem('editing_schedules', JSON.stringify(newEditingSchedules));
    };

    const handleAddShift = (date: Date, userId: string) => {
        if (!userId) return;
        const weekOfShiftISO = getWeekStartDate(date).toISOString().split('T')[0];
        const scheduleForWeek = getScheduleForWeek(weekOfShiftISO) || { weekStartDate: weekOfShiftISO, shifts: [] };

        const newShift: Shift = {
            id: uuidv4(), userId, userName: users.find(u => u.id === userId)?.name || 'Unknown',
            startTime: new Date(new Date(date).setHours(9, 0, 0, 0)).toISOString(),
            endTime: new Date(new Date(date).setHours(17, 0, 0, 0)).toISOString(),
            breaks: [],
        };
        
        const newSchedule: Schedule = { ...scheduleForWeek, shifts: [...scheduleForWeek.shifts, newShift] };
        handleSaveEditingSchedule(newSchedule);
    };

    const handleUpdateShift = (updatedShift: Shift) => {
        const weekOfShiftISO = getWeekStartDate(new Date(updatedShift.startTime)).toISOString().split('T')[0];
        const scheduleForWeek = getScheduleForWeek(weekOfShiftISO);
        if (!scheduleForWeek) return;

        const updatedShifts = scheduleForWeek.shifts.map(s => s.id === updatedShift.id ? updatedShift : s);
        handleSaveEditingSchedule({ ...scheduleForWeek, shifts: updatedShifts });
    };

    const handleRemoveShift = (shiftId: string, date: Date) => {
        const weekOfShiftISO = getWeekStartDate(date).toISOString().split('T')[0];
        const scheduleForWeek = getScheduleForWeek(weekOfShiftISO);
        if (!scheduleForWeek) return;
        
        const newShifts = scheduleForWeek.shifts.filter(s => s.id !== shiftId);
        const newSchedule = { ...scheduleForWeek, shifts: newShifts };
        handleSaveEditingSchedule(newSchedule);
    };

    const handleTimeChange = (shiftId: string, type: 'startTime' | 'endTime', timeValue: string, date: Date) => {
        const weekOfShiftISO = getWeekStartDate(date).toISOString().split('T')[0];
        const scheduleForWeek = getScheduleForWeek(weekOfShiftISO);
        if (!scheduleForWeek) return;

        const [hours, minutes] = timeValue.split(':').map(Number);
        const updatedShifts = scheduleForWeek.shifts.map(shift => {
            if (shift.id === shiftId) {
                const newDate = new Date(shift[type]);
                newDate.setHours(hours, minutes);
                return { ...shift, [type]: newDate.toISOString() };
            }
            return shift;
        });
        handleSaveEditingSchedule({ ...scheduleForWeek, shifts: updatedShifts });
    };

    const handleSubmitForApproval = (weekStartISO: string) => {
        if (!editingSchedules[weekStartISO] || !user) return;
        const newEditing = { ...editingSchedules };
        delete newEditing[weekStartISO];
        setEditingSchedules(newEditing);
        localStorage.setItem('editing_schedules', JSON.stringify(newEditing));

        const newRequest: ScheduleApprovalRequest = {
            id: uuidv4(), managerId: user.id, weekStartDate: weekStartISO,
            schedule: editingSchedules[weekStartISO], status: 'Pending', submittedAt: new Date().toISOString()
        };
        const allRequests = JSON.parse(localStorage.getItem('schedule_approvals') || '[]') as ScheduleApprovalRequest[];
        localStorage.setItem('schedule_approvals', JSON.stringify([newRequest, ...allRequests]));
        
        loadData();
        alert(`Schedule for week starting ${weekStartISO} submitted for approval.`);
    };

    const handleOpenDayModal = (date: Date) => {
        setSelectedDate(date);
        setIsDayModalOpen(true);
    };

    const handleCloseDayModal = () => {
        setIsDayModalOpen(false);
        setSelectedDate(null);
    };

    const canEditSchedule = user?.role === UserRole.Manager || user?.role === UserRole.Owner;
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const ApprovalStatusPill: React.FC<{status?: 'Pending' | 'Approved' | 'Rejected'}> = ({ status }) => {
        if (!status) return null;
        const styles = {
            Pending: 'bg-warning/20 text-warning',
            Approved: 'bg-success/20 text-success',
            Rejected: 'bg-danger/20 text-danger',
        };
        return <div className={`text-xs font-semibold px-2 py-1 rounded-full ${styles[status]} mt-1`}>{status}</div>;
    };

    return (
        <>
            <div className="h-full flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold font-display">Staff Schedule</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleMonthChange(-1)} className="p-1 rounded-full hover:bg-white/10"><ChevronLeftIcon /></button>
                        <span className="font-semibold text-lg w-48 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => handleMonthChange(1)} className="p-1 rounded-full hover:bg-white/10"><ChevronRightIcon /></button>
                    </div>
                </div>
                
                <div className="flex-grow bg-dark-card border border-dark-border rounded-2xl flex flex-col overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-dark-border">
                        {weekDays.map(day => <div key={day} className="p-2 text-center font-bold text-medium-text">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 flex-grow overflow-y-auto">
                        {calendarGrid.map((day, index) => {
                            if (!day) return <div key={`empty-${index}`} className="border-r border-b border-dark-border"></div>;
                            
                            const dayISO = day.toISOString().split('T')[0];
                            const holiday = philippineHolidays2024.find(h => h.date === dayISO);
                            const weekStartISO = getWeekStartDate(day).toISOString().split('T')[0];
                            const weekSchedule = getScheduleForWeek(weekStartISO);
                            const dayShifts = weekSchedule?.shifts.filter(s => new Date(s.startTime).toDateString() === day.toDateString()) || [];
                            const isToday = dayISO === new Date().toISOString().split('T')[0];
                            
                            const isFirstDayOfWeek = day.getDay() === 1;
                            const approvalRequest = approvalRequests.find(r => r.weekStartDate === weekStartISO);
                            const isBeingEdited = !!editingSchedules[weekStartISO];

                            return (
                                <div key={dayISO} onClick={() => handleOpenDayModal(day)} className={`p-2 border-r border-b border-dark-border flex flex-col gap-1 min-h-[120px] cursor-pointer hover:bg-white/5 transition-colors ${isToday ? 'bg-primary/10' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <span className={`font-bold ${isToday ? 'text-primary' : ''}`}>{day.getDate()}</span>
                                        {isFirstDayOfWeek && (
                                            <div className="flex flex-col items-end">
                                                <ApprovalStatusPill status={approvalRequest?.status} />
                                                {isBeingEdited && <button onClick={(e) => { e.stopPropagation(); handleSubmitForApproval(weekStartISO); }} className="text-xs bg-success/80 text-white px-2 py-1 rounded-md mt-1">Submit</button>}
                                            </div>
                                        )}
                                    </div>
                                    {holiday && <div className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${holiday.type === 'Regular' ? 'bg-danger/20 text-danger' : 'bg-accent/20 text-accent'}`}>{holiday.name}</div>}
                                    <div className="flex-grow space-y-1 overflow-hidden text-xs">
                                        {dayShifts.length > 0 && (
                                            <div className="bg-dark-bg p-1 rounded text-center text-medium-text mt-2">
                                                {dayShifts.length} shift{dayShifts.length > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {isShiftModalOpen && selectedShift && (
                <ShiftDetailsModal 
                    isOpen={isShiftModalOpen}
                    onClose={() => setIsShiftModalOpen(false)}
                    shift={selectedShift}
                    onSave={(updatedShift) => {
                        handleUpdateShift(updatedShift);
                        setIsShiftModalOpen(false);
                    }}
                />
            )}
            {isDayModalOpen && selectedDate && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseDayModal}>
                    <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-dark-border">
                            <h2 className="text-2xl font-bold text-primary">Schedule for {selectedDate.toLocaleDateString()}</h2>
                            <button onClick={handleCloseDayModal} className="text-medium-text hover:text-white"><XMarkIcon /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-2">
                            {(getScheduleForWeek(getWeekStartDate(selectedDate).toISOString().split('T')[0])?.shifts || []).filter(s => new Date(s.startTime).toDateString() === selectedDate.toDateString()).map(shift => (
                                <div key={shift.id} className="bg-dark-bg p-2 rounded flex items-center gap-4">
                                    <p className="font-semibold w-1/3">{shift.userName}</p>
                                    <div className="flex items-center gap-1 text-primary">
                                        <input type="time" value={formatTimeForInput(shift.startTime)} onChange={e => handleTimeChange(shift.id, 'startTime', e.target.value, selectedDate)} disabled={!canEditSchedule || !editingSchedules[getWeekStartDate(selectedDate).toISOString().split('T')[0]]} className="bg-dark-border p-1 rounded disabled:text-medium-text disabled:bg-dark-bg" />
                                        <span>-</span>
                                        <input type="time" value={formatTimeForInput(shift.endTime)} onChange={e => handleTimeChange(shift.id, 'endTime', e.target.value, selectedDate)} disabled={!canEditSchedule || !editingSchedules[getWeekStartDate(selectedDate).toISOString().split('T')[0]]} className="bg-dark-border p-1 rounded disabled:text-medium-text disabled:bg-dark-bg" />
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        {(canEditSchedule && editingSchedules[getWeekStartDate(selectedDate).toISOString().split('T')[0]]) &&
                                            <>
                                                <button onClick={() => { setSelectedShift(shift); setIsShiftModalOpen(true); }} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Breaks</button>
                                                <button onClick={() => handleRemoveShift(shift.id, selectedDate)} className="text-danger/70 hover:text-danger"><XMarkIcon className="w-4 h-4"/></button>
                                            </>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                        {(canEditSchedule && editingSchedules[getWeekStartDate(selectedDate).toISOString().split('T')[0]]) && (
                             <div className="p-4 border-t border-dark-border">
                                <h3 className="text-lg font-semibold mb-2">Add Shift</h3>
                                <div className="flex gap-2">
                                    <select onChange={(e) => { handleAddShift(selectedDate, e.target.value); e.target.value = ''; }} value="" className="flex-grow bg-dark-bg border border-dark-border text-sm p-2 rounded">
                                        <option value="">-- Select Staff --</option>
                                        {schedulableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default SchedulingPage;