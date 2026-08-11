import { motion } from 'framer-motion';
import { CalendarCheck, FileText, ShieldCheck } from 'lucide-react';
import PortalButton from './PortalButton';
import { cn } from '../../lib/utils';
import { fadeUp, stagger, toVisible } from '../../lib/motion';

const APPOINTMENTS = [
  { time: '09:30 AM', label: 'General checkup', doctor: 'Dr. Sarah Chen', tone: 'bg-indigo-100 text-indigo-700' },
  { time: '11:15 AM', label: 'Dental cleaning', doctor: 'Dr. Marcus Webb', tone: 'bg-cyan-100 text-cyan-700' },
  { time: '02:00 PM', label: 'Lab results review', doctor: 'Dr. Amara Diallo', tone: 'bg-amber-100 text-amber-700' },
];

const STATS = [
  { value: '50K+', label: 'Active patients' },
  { value: '120+', label: 'Partner clinics' },
  { value: '4.9/5', label: 'Patient rating' },
];

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-36">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-aurora rounded-full bg-indigo-200/70 blur-3xl" />
        <div
          className="absolute -right-24 top-24 h-80 w-80 animate-aurora rounded-full bg-cyan-200/70 blur-3xl"
          style={{ animationDelay: '-8s' }}
        />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <div className="section-shell grid items-center gap-14 lg:grid-cols-2">
        <motion.div
          variants={stagger(0.12, 0.1)}
          initial="hidden"
          animate="visible"
          className="max-w-xl"
        >
          <motion.span
            variants={fadeUp}
            {...toVisible()}
            className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-700 backdrop-blur"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure · Private · Trusted
          </motion.span>

          <motion.h1
            variants={fadeUp}
            {...toVisible()}
            className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Your health, <span className="gradient-text">one portal</span> away.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            {...toVisible()}
            className="mt-5 text-lg leading-relaxed text-slate-600"
          >
            Book appointments, view medical records, refill prescriptions, and track lab
            results — all in one secure place.
          </motion.p>

          <motion.div variants={fadeUp} {...toVisible()} className="mt-8 flex flex-wrap items-center gap-4">
            <PortalButton className="px-6 py-3 text-base">Enter Patient Portal</PortalButton>
            <a
              href="#features"
              className="rounded-full px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Explore features →
            </a>
          </motion.div>

          <motion.div variants={fadeUp} {...toVisible()} className="mt-12 flex gap-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="animate-float">
            <div className="glass rounded-3xl p-6 shadow-elevated">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Today
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">Your appointments</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white">
                  <CalendarCheck className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {APPOINTMENTS.map((a) => (
                  <div
                    key={a.time}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3"
                  >
                    <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold', a.tone)}>
                      {a.time}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{a.label}</p>
                      <p className="truncate text-xs text-slate-500">{a.doctor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="absolute -left-8 -top-6 hidden animate-float rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-card backdrop-blur sm:block"
            style={{ animationDelay: '-2s' }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Record shared</p>
                <p className="text-[11px] text-slate-500">Just now</p>
              </div>
            </div>
          </div>

          <div
            className="absolute -right-6 -bottom-8 hidden animate-float rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-card backdrop-blur sm:block"
            style={{ animationDelay: '-4s' }}
          >
            <p className="text-xs font-semibold text-slate-800">Next available</p>
            <p className="text-[11px] text-primary-600">Today, 2:00 PM</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
