import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import PortalButton from './PortalButton';
import { fadeUp, stagger, toVisible, viewportOnce } from '../../lib/motion';

function CtaBand() {
  return (
    <section className="pb-20 sm:pb-28">
      <div className="section-shell">
        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce()}
          className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-16 text-center shadow-elevated sm:px-12"
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

          <motion.span
            variants={fadeUp}
            {...toVisible()}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur"
          >
            <HeartPulse className="h-7 w-7" />
          </motion.span>

          <motion.h2
            variants={fadeUp}
            {...toVisible()}
            className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Ready to take control of your health?
          </motion.h2>

          <motion.p variants={fadeUp} {...toVisible()} className="mx-auto mt-4 max-w-xl text-white/90">
            Join MediCore today and bring your entire care journey into one secure,
            beautifully simple portal.
          </motion.p>

          <motion.div variants={fadeUp} {...toVisible()} className="mt-8">
            <PortalButton variant="light" className="text-base">Create your free account</PortalButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default CtaBand;
