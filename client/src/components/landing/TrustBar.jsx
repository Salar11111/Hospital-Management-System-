import { motion } from 'framer-motion';
import { HeartPulse, Hospital, ShieldPlus, Activity } from 'lucide-react';

const TRUST = [
  { icon: ShieldPlus, label: 'HIPAA aligned' },
  { icon: Hospital, label: '120+ clinics' },
  { icon: Activity, label: '24/7 monitoring' },
  { icon: HeartPulse, label: 'Board certified' },
];

function TrustBar() {
  return (
    <section className="border-y border-slate-200/70 bg-white py-5">
      <div className="section-shell flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {TRUST.map((t) => (
          <motion.div
            key={t.label}
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <t.icon className="h-5 w-5 text-primary-500" />
            <span className="text-sm font-semibold text-slate-600">{t.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default TrustBar;
