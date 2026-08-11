import { HeartPulse } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Patients',
    links: ['Find a doctor', 'Book appointment', 'Medical records', 'Prescriptions'],
  },
  {
    title: 'Company',
    links: ['About us', 'Careers', 'Press', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy policy', 'Terms of service', 'HIPAA notice'],
  },
];

function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 backdrop-blur">
      <div className="section-shell py-14">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <HeartPulse className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">MediCore</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              A secure patient portal for appointments, records, prescriptions, and lab results.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold text-slate-900">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="text-sm text-slate-500 transition-colors hover:text-primary-600"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} MediCore Health Inc. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">Demo application — not for real medical use.</p>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
