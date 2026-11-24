import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * A short, calm transition between the site and the portal.
 * Honours reduced motion by navigating immediately.
 */
function PortalOverlay({ active, onComplete }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      onComplete();
      return;
    }
    const timer = setTimeout(onComplete, 220);
    return () => clearTimeout(timer);
  }, [active, reduce, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="portal"
          className="pointer-events-none fixed inset-0 z-[100] bg-[#0e7490]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}

export default PortalOverlay;
