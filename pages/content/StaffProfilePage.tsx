import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { User, UserRole, EmergencyContact } from '../../types.ts';
import { UserCircleIcon } from '../../components/icons.tsx';

interface StaffProfilePageProps {
    userId: string;
}

const ProfileField: React.FC<{ label: string; value: string | undefined; isEditing?: boolean; onChange?: (val: string) => void; type?: string }> = 
({ label, value, isEditing, onChange, type = 'text' }) => (
    <div>
        <label className="text-xs text-medium-text font-semibold">{label}</label>
        {isEditing ? (
            <input type={type} value={value || ''} onChange={(e) => onChange && onChange(e.target.value)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1 text-sm"/>
        ) : (
            <p className="text-light-text text-base mt-1">{value || 'Not set'}</p>
        )}
    </div>
);

const StaffProfilePage: React.FC<StaffProfilePageProps> = ({ userId }) => {
    const { user: currentUser, users, updateUser } = useAuth();
    const [staff, setStaff] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<User>>({});

    useEffect(() => {
        const userToView = users.find(u => u.id === userId);
        if (userToView) {
            setStaff(userToView);
            setEditData(userToView);
        }
    }, [userId, users]);
    
    const canEdit = currentUser?.role === UserRole.Manager || currentUser?.role === UserRole.Owner || currentUser?.role === UserRole.HR;

    const handleInputChange = (field: keyof User, value: any) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleEmergencyContactChange = (field: keyof EmergencyContact, value: string) => {
        setEditData(prev => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact,
                fullName: prev.emergencyContact?.fullName || '',
                relationship: prev.emergencyContact?.relationship || 'Other',
                contactNumber: prev.emergencyContact?.contactNumber || '',
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        updateUser(userId, editData);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        if(staff) setEditData(staff);
        setIsEditing(false);
    }

    if (!staff) {
        return <div className="text-center">Staff member not found.</div>;
    }

    const ProfileCard: React.FC = () => (
         <div className="col-span-1 lg:col-span-1 bg-dark-card border border-dark-border rounded-xl p-6 text-center h-fit">
            <UserCircleIcon className="w-24 h-24 mx-auto text-medium-text mb-4"/>
            <h2 className="text-2xl font-bold">{staff.name}</h2>
            <p className="text-primary font-semibold">{staff.role}</p>
            <div className="flex justify-center gap-4 mt-4">
                 <span className={`px-3 py-1 text-xs font-semibold rounded-full ${staff.isClockedIn ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {staff.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                </span>
                {staff.isClockedIn && staff.isOnBreak && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-warning/20 text-warning">On Break</span>}
            </div>
        </div>
    );
    
    const DetailsForm: React.FC = () => (
        <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
                <h3 className="font-semibold text-lg mb-4">Personal & Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField label="Full Name" value={editData.name} isEditing={isEditing} onChange={(v) => handleInputChange('name', v)} />
                    <ProfileField label="Email" value={editData.email} isEditing={isEditing} onChange={(v) => handleInputChange('email', v)} />
                    <ProfileField label="Mobile Number" value={editData.mobileNumber} isEditing={isEditing} onChange={(v) => handleInputChange('mobileNumber', v)} />
                    <ProfileField label="Date of Birth" value={editData.dob} isEditing={isEditing} onChange={(v) => handleInputChange('dob', v)} type="date" />
                     <div>
                        <label className="text-xs text-medium-text font-semibold">Address</label>
                        {isEditing ? <textarea value={editData.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1 text-sm h-20"/> : <p className="text-light-text text-base mt-1">{staff.address || 'Not set'}</p>}
                    </div>
                </div>
            </div>

            <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
                 <h3 className="font-semibold text-lg mb-4">Emergency Contact</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField label="Full Name" value={editData.emergencyContact?.fullName} isEditing={isEditing} onChange={(v) => handleEmergencyContactChange('fullName', v)}/>
                    <ProfileField label="Contact Number" value={editData.emergencyContact?.contactNumber} isEditing={isEditing} onChange={(v) => handleEmergencyContactChange('contactNumber', v)}/>
                     <div>
                        <label className="text-xs text-medium-text font-semibold">Relationship</label>
                        {isEditing ? (
                             <select value={editData.emergencyContact?.relationship || 'Other'} onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)} className="w-full bg-dark-bg border-dark-border border p-2 rounded-md mt-1 text-sm">
                                <option>Parent</option><option>Spouse</option><option>Sibling</option><option>Friend</option><option>Other</option>
                            </select>
                        ) : <p className="text-light-text text-base mt-1">{staff.emergencyContact?.relationship || 'Not set'}</p>}
                    </div>
                 </div>
            </div>

            <div className="p-6 bg-dark-card border border-dark-border rounded-xl">
                 <h3 className="font-semibold text-lg mb-4">Government IDs</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField label="SSS Number" value={editData.sssNumber} isEditing={isEditing} onChange={(v) => handleInputChange('sssNumber', v)}/>
                    <ProfileField label="PhilHealth Number" value={editData.philhealthNumber} isEditing={isEditing} onChange={(v) => handleInputChange('philhealthNumber', v)}/>
                    <ProfileField label="Pag-IBIG Number" value={editData.pagibigNumber} isEditing={isEditing} onChange={(v) => handleInputChange('pagibigNumber', v)}/>
                    <ProfileField label="TIN" value={editData.tinNumber} isEditing={isEditing} onChange={(v) => handleInputChange('tinNumber', v)}/>
                 </div>
            </div>
        </div>
    );

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-display">Staff Profile</h2>
                {canEdit && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} className="bg-medium-text/30 hover:bg-medium-text/50 text-white font-bold py-2 px-4 rounded-lg transition">Cancel</button>
                                <button onClick={handleSave} className="bg-success hover:bg-success/80 text-white font-bold py-2 px-4 rounded-lg transition">Save Changes</button>
                            </>
                        ) : (
                             <button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition">Edit Profile</button>
                        )}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ProfileCard />
                <DetailsForm />
            </div>
        </div>
    );
};

export default StaffProfilePage;
