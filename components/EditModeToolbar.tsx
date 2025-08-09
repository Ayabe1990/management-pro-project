import React from 'react';
import { useEditMode } from '../contexts/EditModeContext.tsx';
import { XMarkIcon } from './icons.tsx';

const EditModeToolbar: React.FC = () => {
    const { isEditMode, toggleEditMode } = useEditMode();

    if (!isEditMode) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-primary/30 flex items-center gap-6 z-50 animate-fade-in">
            <span>App Edit Mode is Active</span>
            <button onClick={toggleEditMode} className="bg-white/20 hover:bg-white/40 rounded-full p-1">
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default EditModeToolbar;
