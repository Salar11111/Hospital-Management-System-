import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Menu, X } from 'lucide-react';
import PortalButton from './PortalButton';
import { cn } from '../../lib/utils';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#testimonials', label: 'Testimonials' },
];

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'glass-strong shadow-card' : 'bg-transparent'
      )}
    >
      <nav className="section-shell flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" aria-label="MediCore home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">MediCore</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-600"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Sign in
          </Link>
          <PortalButton className="px-5 py-2 text-sm">Enter Portal</PortalButton>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 md:hidden',
          open ? 'max-h-96 border-t border-slate-200 bg-white' : 'max-h-0'
        )}
      >
        <div className="section-shell flex flex-col gap-1 py-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Sign in
          </Link>
          <PortalButton className="mt-1 px-5 py-2.5 text-sm">Enter Portal</PortalButton>
        </div>
      </div>
    </header>
  );
}

export default LandingNav;
