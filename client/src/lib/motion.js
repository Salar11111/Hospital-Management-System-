/** Shared motion tokens.
 * The clinical UI uses no reveal-on-scroll or kinetic motion; these variants
 * keep existing call sites working while rendering content immediately.
 */
const EASE = [0.22, 1, 0.36, 1];

const visibleOnly = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const fadeUp = visibleOnly;
const fadeIn = visibleOnly;
const scaleIn = visibleOnly;

function viewportOnce() {
  return { once: true };
}

function stagger() {
  return { hidden: {}, visible: {} };
}

function toVisible(duration = 0.16) {
  return { transition: { duration, ease: EASE } };
}

export { EASE, fadeIn, fadeUp, scaleIn, stagger, toVisible, viewportOnce };
