import { motion } from 'framer-motion';
import {
  CalendarCheck,
  ClipboardList,
  Pill,
  FlaskConical,
  MessageSquareHeart,
  CreditCard,
} from 'lucide-react';
import { fadeUp, stagger, toVisible, viewportOnce } from '../../lib/motion';

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Smart scheduling',
    desc: 'Book, reschedule, or cancel appointments with a few taps — no phone calls needed.',
  },
  {
    icon: ClipboardList,
    title: 'Medical records',
    desc: 'Your full history, visit notes, and diagnoses organized and available 24/7.',
  },
  {
    icon: Pill,
    title: 'Prescription refills',
    desc: 'Request refills in seconds and track approval status in real time.',
  },
  {
    icon: FlaskConical,
    title: 'Lab results',
    desc: 'Test results delivered securely the moment your provider releases them.',
  },
  {
    icon: MessageSquareHeart,
    title: 'Secure messaging',
    desc: 'Ask your care team questions through encrypted, in-app conversations.',
  },
  {
    icon: CreditCard,
    title: 'Billing made clear',
    desc: 'View invoices, pay online, and keep an eye on outstanding balances.',
  },
];

function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="section-shell">
        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce()}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.span
            variants={fadeUp}
            {...toVisible()}
            className="inline-block rounded-full border border-primary-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-700 backdrop-blur"
          >
            Features
          </motion.span>
          <motion.h2
            variants={fadeUp}
            {...toVisible()}
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Everything your care needs
          </motion.h2>
          <motion.p variants={fadeUp} {...toVisible()} className="mt-4 text-lg text-slate-600">
            A complete toolkit for managing your health, designed to feel effortless.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce(0.1)}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              {...toVisible()}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-elevated"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Features;
