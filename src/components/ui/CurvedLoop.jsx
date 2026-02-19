import { useRef, useEffect, useState, useMemo, useId } from 'react';
import { useScroll, useVelocity, useAnimationFrame } from 'framer-motion';
import './CurvedLoop.css';

const CurvedLoop = ({
    marqueeText = '',
    speed = 2,
    className,
    curveAmount = 400,
    direction = 'left',
    interactive = true
}) => {
    const text = useMemo(() => {
        const hasTrailing = /\s|\u00A0$/.test(marqueeText);
        return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0';
    }, [marqueeText]);

    const measureRef = useRef(null);
    const textPathRef = useRef(null);
    const pathRef = useRef(null);
    const [spacing, setSpacing] = useState(0);
    const uid = useId();
    const pathId = `curve-${uid}`;
    const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

    const dragRef = useRef(false);
    const lastXRef = useRef(0);
    const dirRef = useRef(direction);
    const velRef = useRef(0);

    const currentOffsetRef = useRef(0);
    const totalText = useMemo(() => {
        if (!spacing) return '';
        // 6 repetitions are enough to cover the path twice for a seamless loop
        return Array(6).fill(text).join('');
    }, [text, spacing]);

    const ready = spacing > 0;

    useEffect(() => {
        const measure = () => {
            if (measureRef.current) {
                const len = measureRef.current.getComputedTextLength();
                if (len > 0) {
                    setSpacing(len);
                    // Initialize offset to a clean wrap point
                    currentOffsetRef.current = -len * 2;
                    if (textPathRef.current) {
                        textPathRef.current.setAttribute('startOffset', currentOffsetRef.current + 'px');
                    }
                }
            }
        };

        if (document.fonts) document.fonts.ready.then(measure);
        measure();
        const timers = [100, 500, 1000].map(ms => setTimeout(measure, ms));

        window.addEventListener('resize', measure);
        return () => {
            timers.forEach(clearTimeout);
            window.removeEventListener('resize', measure);
        };
    }, [text, className]);

    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);

    // Sync direction with scroll
    useAnimationFrame(() => {
        const velocity = scrollVelocity.get();
        if (velocity > 5) {
            dirRef.current = 'left'; // Scroll Down -> Move Left
        } else if (velocity < -5) {
            dirRef.current = 'right'; // Scroll Up -> Move Right
        }
    });

    useEffect(() => {
        if (!spacing || !ready) return;
        let frame = 0;
        const step = () => {
            if (!dragRef.current && textPathRef.current) {
                const delta = dirRef.current === 'right' ? speed : -speed;
                currentOffsetRef.current += delta;

                // Infinite loop logic: Keep offset between -spacing*2 and -spacing*3
                // This ensures we always have text on both sides of the visible path
                if (currentOffsetRef.current <= -spacing * 3) currentOffsetRef.current += spacing;
                if (currentOffsetRef.current >= -spacing * 1) currentOffsetRef.current -= spacing;

                textPathRef.current.setAttribute('startOffset', currentOffsetRef.current + 'px');
            }
            frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [spacing, speed, ready]);

    const onPointerDown = e => {
        if (!interactive) return;
        dragRef.current = true;
        lastXRef.current = e.clientX;
        velRef.current = 0;
        e.target.setPointerCapture(e.pointerId);
    };

    const onPointerMove = e => {
        if (!interactive || !dragRef.current || !textPathRef.current) return;
        const dx = e.clientX - lastXRef.current;
        lastXRef.current = e.clientX;
        velRef.current = dx;

        const currentOffset = currentOffsetRef.current;
        let newOffset = currentOffset + dx;

        if (newOffset <= -spacing * 3) newOffset += spacing;
        if (newOffset >= -spacing * 1) newOffset -= spacing;

        currentOffsetRef.current = newOffset;
        textPathRef.current.setAttribute('startOffset', newOffset + 'px');
    };

    const endDrag = () => {
        if (!interactive) return;
        dragRef.current = false;
        dirRef.current = velRef.current > 0 ? 'right' : 'left';
    };

    const cursorStyle = interactive ? (dragRef.current ? 'grabbing' : 'grab') : 'auto';

    return (
        <div
            className="curved-loop-jacket"
            style={{ visibility: ready ? 'visible' : 'hidden', cursor: cursorStyle }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
        >
            <svg className="curved-loop-svg" viewBox="0 0 1440 120">
                <text ref={measureRef} xmlSpace="preserve" style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}>
                    {text}
                </text>
                <defs>
                    <path ref={pathRef} id={pathId} d={pathD} fill="none" stroke="transparent" />
                </defs>
                {ready && (
                    <text fontWeight="bold" xmlSpace="preserve" className={className}>
                        <textPath ref={textPathRef} href={`#${pathId}`} xmlSpace="preserve">
                            {totalText}
                        </textPath>
                    </text>
                )}
            </svg>
        </div>
    );
};

export default CurvedLoop;
