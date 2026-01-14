import React, { useMemo } from 'react';

const ConfettiRain = () => {
    const particles = useMemo(() => Array.from({ length: 50 }), []);
    return (
        <div className="fixed inset-0 pointer-events-none z-[110] overflow-hidden">
            {particles.map((_, i) => (
                <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full animate-fall"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: ['#10b981', '#fbbf24', '#3b82f6', '#f43f5e', '#8b5cf6'][Math.floor(Math.random() * 5)],
                        top: `-20px`,
                        animationDelay: `${Math.random() * 4}s`,
                        animationDuration: `${2.5 + Math.random() * 2}s`,
                        opacity: 0.6 + Math.random() * 0.4
                    }}
                />
            ))}
            <style>{`
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg); }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                .animate-fall { animation-name: fall; animation-timing-function: cubic-bezier(0.4, 0, 1, 1); animation-iteration-count: infinite; }
            `}</style>
        </div>
    );
};

export default ConfettiRain;