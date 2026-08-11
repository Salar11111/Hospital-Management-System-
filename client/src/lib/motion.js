const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

function viewportOnce(amount = 0.2) {
  return { once: true, amount };
}

function stagger(delay = 0.12, initialDelay = 0) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: delay, delayChildren: initialDelay } },
  };
}

function toVisible(duration = 0.6) {
  return { transition: { duration, ease: EASE } };
}

export { EASE, fadeIn, fadeUp, scaleIn, stagger, toVisible, viewportOnce };
