import { motion } from 'framer-motion';
import { UserPlus, CalendarPlus, Stethoscope, ShieldCheck } from 'lucide-react';
import { fadeUp, stagger, toVisible, viewportOnce } from '../../lib/motion';

const STEPS = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Create your account',
    desc: 'Register in under two minutes with basic personal details.',
  },
  {
    icon: CalendarPlus,
    step: '02',
    title: 'Book an appointment',
    desc: 'Pick a provider and time that fits your schedule instantly.',
  },
  {
    icon: Stethoscope,
    step: '03',
    title: 'Get care',
    desc: 'Attend in person or virtually — your provider documents everything.',
  },
  {
    icon: ShieldCheck,
    step: '04',
    title: 'Follow up securely',
    desc: 'Access results, refills, and notes from anywhere, anytime.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-brand-gradient-soft" />
      <div className="absolute inset-0 -z-10 grid-pattern opacity-60" />

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
            className="inline-block rounded-full border border-primary-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-700"
          >
            How it works
          </motion.span>
          <motion.h2
            variants={fadeUp}
            {...toVisible()}
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            From sign-up to care in minutes
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce(0.15)}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((s) => (
            <motion.div
              key={s.step}
              variants={fadeUp}
              {...toVisible()}
              className="relative rounded-2xl border border-white/80 bg-white p-6 shadow-card"
            >
              <span className="absolute right-5 top-4 text-4xl font-black text-slate-100">
                {s.step}
              </span>
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-600 shadow-card">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-4 text-base font-bold text-slate-900">{s.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorks;
