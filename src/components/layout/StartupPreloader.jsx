import React from 'react';
import { gsap } from 'gsap';
import { Hammer } from 'lucide-react';

const BRAND_CHARS = 'TOUS \u00c0 TABLE'.split('');

const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
const waitForPaint = () => new Promise((resolve) => {
  if (typeof requestAnimationFrame !== 'function') {
    setTimeout(resolve, 0);
    return;
  }

  requestAnimationFrame(() => requestAnimationFrame(resolve));
});

const StartupPreloader = ({
  warmup,
  onComplete,
  minDuration = 0,
  maxDuration = 3200,
}) => {
  const rootRef = React.useRef(null);
  const completeRef = React.useRef(false);
  const onCompleteRef = React.useRef(onComplete);

  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  React.useLayoutEffect(() => {
    let cancelled = false;
    let introTimeline = null;
    let exitTimeline = null;
    let resolveIntro = null;
    const root = rootRef.current;

    if (!root) return undefined;

    const secondary = root.querySelector('.tat-startup-preloader-secondary');
    const panel = root.querySelector('.tat-startup-preloader-panel');
    const content = root.querySelector('.tat-startup-preloader-content');
    const icon = root.querySelector('.tat-startup-preloader-icon');
    const chars = root.querySelectorAll('.tat-startup-preloader-char');
    const footer = root.querySelector('.tat-startup-preloader-footer');
    const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
    const initialCharBlur = isCoarsePointer ? 'blur(6px)' : 'blur(10px)';
    const initialIconBlur = isCoarsePointer ? 'blur(3px)' : 'blur(5px)';

    completeRef.current = false;
    document.body.classList.add('tat-startup-preloading');
    if (typeof window !== 'undefined') {
      window.hasShownPreloader = true;
    }

    const finish = () => {
      if (completeRef.current) return;
      completeRef.current = true;
      document.body.classList.remove('tat-startup-preloading');
      onCompleteRef.current?.();
    };

    gsap.set(content, { opacity: 0 });
    gsap.set(icon, { scale: 0.8, opacity: 0, filter: initialIconBlur, force3D: true });
    gsap.set(chars, { y: 40, opacity: 0, filter: initialCharBlur, force3D: true });
    gsap.set(footer, { opacity: 0 });
    gsap.set([secondary, panel], { yPercent: 0, force3D: true });

    const introTask = new Promise((resolve) => {
      resolveIntro = resolve;
      introTimeline = gsap.timeline({ onComplete: resolve });

      introTimeline
        .to(content, { opacity: 1, duration: 0.1 })
        .to(icon, {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.0,
          ease: 'expo.out',
          force3D: true,
        })
        .to(chars, {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.0,
          stagger: 0.06,
          ease: 'expo.out',
          force3D: true,
        }, '-=0.5')
        .to(footer, {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        }, '-=0.8');
    });

    const run = async () => {
      const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

      await Promise.allSettled([
        introTask,
        wait(minDuration),
      ]);

      if (cancelled) return;
      await waitForPaint();

      const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt;
      const remainingBudget = Math.max(450, maxDuration - elapsed);
      const warmupBudget = Math.min(isCoarsePointer ? 850 : 1100, remainingBudget);
      const warmupTask = Promise.resolve()
        .then(() => warmup?.())
        .catch(() => undefined);

      await Promise.race([warmupTask, wait(warmupBudget)]);

      if (cancelled) return;
      await waitForPaint();

      exitTimeline = gsap.timeline({ onComplete: finish });
      exitTimeline
        .to(secondary, {
          yPercent: -100,
          duration: 0.8,
          ease: 'expo.inOut',
          force3D: true,
        }, 'exit')
        .to(panel, {
          yPercent: -100,
          duration: 0.8,
          ease: 'expo.inOut',
          force3D: true,
        }, 'exit+=0.05');
    };

    run();

    return () => {
      cancelled = true;
      introTimeline?.kill();
      exitTimeline?.kill();
      resolveIntro?.();
      document.body.classList.remove('tat-startup-preloading');
    };
  }, [warmup, minDuration, maxDuration]);

  return (
    <div
      ref={rootRef}
      className="tat-startup-preloader"
      role="status"
      aria-label="Chargement de Tous a Table"
    >
      <div className="tat-startup-preloader-secondary" />
      <div className="tat-startup-preloader-panel">
        <div className="tat-startup-preloader-content">
          <div className="tat-startup-preloader-icon" aria-hidden="true">
            <Hammer size={56} strokeWidth={1} />
          </div>

          <div className="tat-startup-preloader-brand">
            <div className="tat-startup-preloader-title" aria-hidden="true">
              {BRAND_CHARS.map((char, index) => (
                <span
                  key={`${char}-${index}`}
                  className="tat-startup-preloader-char"
                  style={{ '--tat-char-index': index }}
                >
                  {char === ' ' ? '\u00a0' : char}
                </span>
              ))}
            </div>
            <span className="sr-only">Chargement de Tous a Table</span>

            <div className="tat-startup-preloader-footer" aria-hidden="true">
              <span />
              <span>Atelier Normand</span>
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupPreloader;
