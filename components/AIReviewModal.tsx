import React from 'react';
import { User, AIReview } from '../types.ts';
import { XMarkIcon, SparklesIcon } from './icons.tsx';

interface AIReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    staffMember: User | null;
    onGenerate: () => void;
    review: AIReview | null;
    isLoading: boolean;
}

const AIReviewModal: React.FC<AIReviewModalProps> = ({ isOpen, onClose, staffMember, onGenerate, review, isLoading }) => {
    if (!isOpen || !staffMember) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-dark-border flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">
                        AI Performance Analysis for <span className="text-primary">{staffMember.name}</span>
                    </h2>
                    <button onClick={onClose} className="text-medium-text hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {!review && !isLoading && (
                        <div className="text-center py-8">
                            <p className="text-medium-text mb-6">Analyze {staffMember.name}'s performance data to generate a review summary, strengths, and areas for improvement.</p>
                            <button
                                onClick={onGenerate}
                                disabled={isLoading}
                                className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2 mx-auto disabled:bg-primary/50 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                Generate with AI
                            </button>
                        </div>
                    )}

                    {isLoading && (
                         <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-primary animate-pulse">Generating analysis... This may take a moment.</p>
                        </div>
                    )}

                    {review && !isLoading && (
                        <div className="space-y-6 text-left animate-fade-in">
                            <div>
                                <h3 className="text-lg font-semibold text-accent mb-2 border-b border-dark-border pb-1">Overall Summary</h3>
                                <p className="text-light-text">{review.summary}</p>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-accent mb-2 border-b border-dark-border pb-1">Key Strengths</h3>
                                <ul className="list-disc list-inside space-y-2 pl-2 text-light-text">
                                    {review.strengths.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-accent mb-2 border-b border-dark-border pb-1">Areas for Improvement</h3>
                                <ul className="list-disc list-inside space-y-2 pl-2 text-light-text">
                                    {review.areasForImprovement.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                
                 <div className="p-4 border-t border-dark-border mt-auto flex justify-end gap-4 flex-shrink-0">
                     {review && !isLoading && (
                         <button
                            onClick={onGenerate}
                            disabled={isLoading}
                            className="bg-medium-text/30 hover:bg-medium-text/50 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Regenerate
                        </button>
                     )}
                    <button onClick={onClose} className="bg-danger/80 hover:bg-danger text-white font-bold py-2 px-4 rounded-lg transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIReviewModal;