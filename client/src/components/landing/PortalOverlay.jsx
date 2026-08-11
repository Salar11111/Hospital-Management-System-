import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const PARTICLES = 22;
const BURST_AT = 950;
const DURATION = 1400;

function PortalOverlay({ active, origin, onComplete }) {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      onComplete();
      return;
    }
    setBurst(false);
    const burstTimer = setTimeout(() => setBurst(true), BURST_AT);
    const doneTimer = setTimeout(onComplete, DURATION);
    return () => {
      clearTimeout(burstTimer);
      clearTimeout(doneTimer);
    };
  }, [active, reduce, onComplete]);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, i) => {
        const angle = (i / PARTICLES) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 90 + Math.random() * 150;
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          size: 3 + Math.random() * 4,
          delay: 0.05 + Math.random() * 0.4,
          color: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#06b6d4' : '#ffffff',
        };
      }),
    []
  );

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="portal"
          className="pointer-events-none fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute inset-0 bg-indigo-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          />

          <motion.div
            className="absolute"
            style={{ left: x, top: y }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 1.15], opacity: [0, 1, 1] }}
            transition={{ duration: 0.95, times: [0, 0.55, 1], ease: 'easeOut' }}
          >
            <motion.span
              className="absolute rounded-full border-2 border-indigo-400/70"
              style={{ width: 340, height: 340, left: -170, top: -170, boxShadow: '0 0 70px rgba(99,102,241,0.55)' }}
              animate={{ scale: [1, 1.35, 1.1], opacity: [0.9, 0.5, 0.9] }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute rounded-full"
              style={{
                width: 230,
                height: 230,
                left: -115,
                top: -115,
                background:
                  'conic-gradient(from 0deg, transparent 0deg, rgba(6,182,212,0.95) 90deg, transparent 200deg)',
                WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
                maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
              }}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: 'linear' }}
            />
            <motion.span
              className="absolute rounded-full border border-cyan-300/90"
              style={{ width: 140, height: 140, left: -70, top: -70, boxShadow: '0 0 40px rgba(6,182,212,0.6)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute rounded-full bg-gradient-to-br from-indigo-400 to-cyan-300"
              style={{ width: 56, height: 56, left: -28, top: -28 }}
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.85, 1, 0.85],
                boxShadow: [
                  '0 0 40px rgba(99,102,241,0.8)',
                  '0 0 90px rgba(6,182,212,0.95)',
                  '0 0 40px rgba(99,102,241,0.8)',
                ],
              }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: 'mirror' }}
            />
          </motion.div>

          {!burst &&
            particles.map((p, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{ width: p.size, height: p.size, background: p.color, left: x, top: y }}
                initial={{ x: p.dx, y: p.dy, scale: 1, opacity: 0 }}
                animate={{ x: 0, y: 0, scale: 0, opacity: [0, 1, 0] }}
                transition={{ duration: 1, delay: p.delay, ease: 'easeIn' }}
              />
            ))}

          <AnimatePresence>
            {burst && (
              <motion.div
                key="burst"
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(224,231,255,0.96) 45%, rgba(165,180,252,0.92) 100%)',
                }}
                initial={{ opacity: 0, scale: 0.35 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PortalOverlay;
