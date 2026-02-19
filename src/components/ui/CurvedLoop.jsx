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
    const [offset, setOffset] = useState(0);
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
        // 8 repetitions: Perfect balance between coverage and performance
        return Array(8).fill(text).join('');
    }, [text, spacing]);

    const ready = spacing > 0;

    useEffect(() => {
        const measure = () => {
            if (measureRef.current) {
                const len = measureRef.current.getComputedTextLength();
                if (len > 0) {
                    setSpacing(len);
                    currentOffsetRef.current = -len * 2; // Start in the middle
                }
            }
        };

        // Final precision measurement when fonts are ready
        if (document.fonts) {
            document.fonts.ready.then(measure);
        }

        measure();
        const timers = [100, 500].map(ms => setTimeout(measure, ms));

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

                // Seamless Modulo: ( (n % m) + m ) % m ensures positive range
                // We offset it by -spacing * 3 to stay in the middle of repetitions
                const wrapped = ((currentOffsetRef.current % spacing) + spacing) % spacing;
                const finalOffset = -spacing * 3 + wrapped;

                textPathRef.current.setAttribute('startOffset', finalOffset + 'px');
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

        const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
        let newOffset = currentOffset + dx;

        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;

        textPathRef.current.setAttribute('startOffset', newOffset + 'px');
        setOffset(newOffset);
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
                        <textPath ref={textPathRef} href={`#${pathId}`} startOffset={offset + 'px'} xmlSpace="preserve">
                            {totalText}
                        </textPath>
                    </text>
                )}
            </svg>
        </div>
    );
};

export default CurvedLoop;
