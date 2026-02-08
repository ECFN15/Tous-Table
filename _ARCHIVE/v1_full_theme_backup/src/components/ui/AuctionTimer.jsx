import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { getMillis } from '../../utils/time';

const AuctionTimer = ({ endDate, onFinished }) => {
    const [label, setLabel] = useState("");
    const [isFinished, setIsFinished] = useState(false);
    
    useEffect(() => {
        if (!endDate) return;
        const tick = () => {
            const distance = getMillis(endDate) - Date.now();
            if (distance <= 0) {
                setLabel("TERMINEE");
                if (!isFinished) {
                    setIsFinished(true);
                    if (onFinished) onFinished();
                }
                return true;
            } else {
                const h = Math.floor((distance % 86400000) / 3600000);
                const m = Math.floor((distance % 3600000) / 60000);
                const s = Math.floor((distance % 60000) / 1000);
                setLabel(`${h}h ${m}m ${s}s`);
                return false;
            }
        };
        tick();
        const interval = setInterval(() => { if (tick()) clearInterval(interval); }, 1000);
        return () => clearInterval(interval);
    }, [endDate, isFinished]);

    return (
        <div className={`flex items-center gap-2 font-black text-[9px] uppercase tracking-widest ${isFinished ? 'text-stone-400' : 'text-amber-600'}`}>
            <Timer size={12} className={!isFinished ? 'animate-pulse' : ''} />
            {label}
        </div>
    );
};

export default AuctionTimer;