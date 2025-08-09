import React from 'react';

interface NeonStatusIconProps {
    status: 'Open' | 'Closed';
}

const NeonStatusIcon: React.FC<NeonStatusIconProps> = ({ status }) => {
    const isOpen = status === 'Open';

    const baseStyle = {
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        letterSpacing: '2px',
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid',
        textTransform: 'uppercase' as 'uppercase',
        fontSize: '10px',
    };

    const openStyle = {
        ...baseStyle,
        color: '#34d399', // emerald-400
        borderColor: '#34d399',
        textShadow: '0 0 5px #34d399, 0 0 10px #34d399',
        animation: 'blink 1.5s infinite',
    };

    const closedStyle = {
        ...baseStyle,
        color: '#f87171', // red-400
        borderColor: '#f87171',
        textShadow: '0 0 5px #f87171',
    };

    return (
        <>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                `}
            </style>
            <div style={isOpen ? openStyle : closedStyle}>
                {isOpen ? 'Open' : 'Close'}
            </div>
        </>
    );
};

export default NeonStatusIcon;