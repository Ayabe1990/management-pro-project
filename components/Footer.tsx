import React from 'react';
import { Page } from '../types.ts';

interface FooterProps {
    pages: Page[];
    onNavigate: (page: Page) => void;
    activePageTitle: string;
}

const Footer: React.FC<FooterProps> = ({ pages, onNavigate, activePageTitle }) => {
    if (pages.length === 0) {
        return null;
    }

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-20 bg-dark-card/80 backdrop-blur-sm border-t border-dark-border z-30 md:hidden">
            <div className="flex justify-around items-center h-full">
                {pages.map(page => {
                    const Icon = page.icon;
                    const isActive = activePageTitle === page.title;
                    return (
                        <button 
                            key={page.title} 
                            onClick={() => onNavigate(page)}
                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors duration-300 ${isActive ? 'text-primary' : 'text-medium-text hover:text-white'}`}
                        >
                           {Icon && <Icon className={`w-7 h-7 transition-all duration-300 ${isActive ? 'drop-shadow-glow-primary scale-110' : ''}`} />}
                            <span className="text-xs font-semibold">{page.title}</span>
                        </button>
                    )
                })}
            </div>
        </footer>
    );
};

export default Footer;