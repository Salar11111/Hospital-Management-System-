import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { fadeUp, stagger, toVisible, viewportOnce } from '../../lib/motion';

const TESTIMONIALS = [
  {
    quote:
      'I booked a specialist appointment during my lunch break. The reminder alerts meant I never missed a follow-up.',
    name: 'Amara Osei',
    role: 'Patient since 2023',
  },
  {
    quote:
      'Finally, my entire medical history in one place. Refilling prescriptions takes me ten seconds now.',
    name: 'Daniel Reyes',
    role: 'Patient since 2024',
  },
  {
    quote:
      'Lab results arrived before my doctor even called. The secure messaging with my care team is a game changer.',
    name: 'Priya Natarajan',
    role: 'Patient since 2022',
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28">
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
            Testimonials
          </motion.span>
          <motion.h2
            variants={fadeUp}
            {...toVisible()}
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Loved by thousands of patients
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce(0.15)}
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.name}
              variants={fadeUp}
              {...toVisible()}
              className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <Quote className="h-8 w-8 text-primary-100" />
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;
