

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { User, UserRole, Page, AIReview, IncidentReport, TimeClockEntry } from '../../types.ts';
import { SparklesIcon, PlusCircleIcon, EyeIcon } from '../../components/icons.tsx';
import AddStaffModal from '../../components/AddStaffModal.tsx';
import StaffProfilePage from './StaffProfilePage.tsx';
import AIReviewModal from '../../components/AIReviewModal.tsx';
import { GoogleGenAI, Type } from "@google/genai";

interface StaffPageProps {
    onNavigate?: (page: Page) => void;
}

const StaffPage: React.FC<StaffPageProps> = ({ onNavigate }) => {
    const { user, users } = useAuth();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    
    // State for AI Review Modal
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedStaffForReview, setSelectedStaffForReview] = useState<User | null>(null);
    const [aiReview, setAiReview] = useState<AIReview | null>(null);
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);


    const canManage = user?.role === UserRole.Owner || user?.role === UserRole.Manager || user?.role === UserRole.HR;

    const displayUsers = useMemo(() => {
        const nonDevRoles = [UserRole.SuperDeveloper, UserRole.Developer];
        return users.filter(u => !nonDevRoles.includes(u.role));
    }, [users]);
    
    const handleViewProfile = (staff: User) => {
        if (onNavigate) {
            onNavigate({
                title: 'Staff Profile',
                component: StaffProfilePage,
                props: { userId: staff.id },
                group: 'Staff'
            });
        }
    };
    
    const handleAiReviewClick = (staff: User) => {
        setSelectedStaffForReview(staff);
        setAiReview(null); // Reset previous review
        setIsReviewModalOpen(true);
    };

    const handleGenerateReview = async () => {
        if (!selectedStaffForReview) return;
        setIsGeneratingReview(true);
        setAiReview(null);

        try {
            const staff = selectedStaffForReview;
            const allIncidents: IncidentReport[] = JSON.parse(localStorage.getItem('incident_reports') || '[]');
            const allTimeEntries: TimeClockEntry[] = JSON.parse(localStorage.getItem('time_clock_entries') || '[]');
            
            const userIncidents = allIncidents.filter(inc => inc.involvedStaffIds.includes(staff.id));
            const timeEntries = allTimeEntries.filter(entry => entry.userId === staff.id);

            const prompt = `
                Analyze the performance of a restaurant staff member named ${staff.name} who works as a ${staff.role} in the ${staff.department} department.
                Provide a concise and professional performance review based on the following data points.
                The output MUST be a JSON object with the structure: { "summary": "string", "strengths": ["string"], "areasForImprovement": ["string"] }.

                Staff Data:
                - Name: ${staff.name}
                - Role: ${staff.role}
                - Department: ${staff.department || 'N/A'}
                - Date Hired: ${staff.dateHired || 'N/A'}

                Performance Metrics:
                - Total Incidents Involved In: ${userIncidents.length}
                - Notes from Incidents: ${userIncidents.map(i => i.notes).join('; ') || 'None'}
                - Total Shifts Recorded: ${timeEntries.length}

                Instructions:
                - The 'summary' should be a brief paragraph (2-3 sentences) summarizing their performance.
                - The 'strengths' array should contain 2-3 specific positive points.
                - The 'areasForImprovement' array should contain 1-2 constructive suggestions for growth.
                - Keep the tone professional, balanced, and constructive. Do not invent data not present here.
            `;
            
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING, description: "A brief summary of the staff member's performance." },
                            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of key strengths." },
                            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of areas for improvement." }
                        },
                        required: ["summary", "strengths", "areasForImprovement"]
                    }
                }
            });

            const reviewData = JSON.parse(response.text.trim());
            setAiReview(reviewData);

        } catch (error) {
            console.error("Error generating AI review:", error);
            setAiReview({
                summary: "An error occurred while generating the review. Please check the console and try again.",
                strengths: [],
                areasForImprovement: ["Ensure the Gemini API is configured correctly."],
            });
        } finally {
            setIsGeneratingReview(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold font-display">Staff Management</h2>
                {canManage && (
                    <button onClick={() => setAddModalOpen(true)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2">
                        <PlusCircleIcon className="w-5 h-5"/>
                        Add New Staff
                    </button>
                )}
            </div>
            <div className="flex-grow bg-dark-card border border-dark-border rounded-2xl p-4 overflow-hidden">
                <div className="h-full overflow-auto hide-scrollbar">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="sticky top-0 bg-dark-card border-b border-dark-border">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Department</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {displayUsers.map(staff => (
                                <tr key={staff.id} className="hover:bg-white/5">
                                    <td className="p-3 font-semibold">{staff.name}</td>
                                    <td className="p-3">{staff.role}</td>
                                    <td className="p-3">{staff.department || 'N/A'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${staff.isClockedIn ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                            {staff.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                         <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleViewProfile(staff)} className="text-xs bg-primary/80 hover:bg-primary text-white px-3 py-1.5 rounded-md transition flex items-center gap-1.5">
                                                <EyeIcon className="w-4 h-4" />
                                                Profile
                                            </button>
                                            <button onClick={() => handleAiReviewClick(staff)} className="text-xs bg-accent/80 hover:bg-accent text-dark-bg px-3 py-1.5 rounded-md transition flex items-center gap-1.5">
                                                <SparklesIcon className="w-4 h-4" />
                                                AI Review
                                            </button>
                                         </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isAddModalOpen && canManage && (
                <AddStaffModal 
                    isOpen={isAddModalOpen}
                    onClose={() => setAddModalOpen(false)}
                />
            )}

            {isReviewModalOpen && selectedStaffForReview && (
                 <AIReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    staffMember={selectedStaffForReview}
                    onGenerate={handleGenerateReview}
                    review={aiReview}
                    isLoading={isGeneratingReview}
                 />
            )}
        </div>
    );
};

export default StaffPage;