import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Lock, ShieldCheck } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import { ROLES } from '../lib/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import PortalOverlay from '../components/landing/PortalOverlay';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const PERKS = [
  { title: 'Book & manage appointments', desc: 'Schedule care on your own time.' },
  { title: 'Secure records & results', desc: 'Your history, encrypted and on demand.' },
  { title: 'Refills in seconds', desc: 'Request prescriptions without the phone tree.' },
];

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Prefer not to say',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [origin, setOrigin] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (form.name.trim().length < 2) return 'Please enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email address';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirm) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone || undefined,
        gender: form.gender,
        password: form.password,
        role: ROLES.PATIENT,
      });
      setOrigin({ x: e.nativeEvent?.clientX, y: e.nativeEvent?.clientY });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to create your account'));
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setDone(false);
    navigate('/login', { state: { registered: true } });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden flex-1 overflow-hidden bg-brand-gradient lg:flex">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div
          className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl"
          style={{ animationDelay: '-8s' }}
        />

        <div className="relative z-10 flex w-full max-w-xl flex-col justify-between p-12">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">MediCore</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
              Your care, finally in one place.
            </h2>
            <ul className="mt-8 space-y-5">
              {PERKS.map((p) => (
                <li key={p.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{p.title}</p>
                    <p className="text-sm text-white/80">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-white/70">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-white underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">MediCore</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Join the patient portal in under two minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Full name"
              name="name"
              autoComplete="name"
              required
              placeholder="Jane Doe"
              value={form.name}
              onChange={set('name')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
              />
              <Input
                label="Phone (optional)"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={set('phone')}
              />
            </div>

            <div>
              <label htmlFor="gender" className="label">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className="input"
                value={form.gender}
                onChange={set('gender')}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="6+ characters"
                value={form.password}
                onChange={set('password')}
              />
              <Input
                label="Confirm password"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                value={form.confirm}
                onChange={set('confirm')}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            Your information is encrypted and never shared.
          </p>

          <p className="mt-4 text-center text-sm text-slate-500 lg:hidden">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <PortalOverlay active={done} origin={origin} onComplete={handleComplete} />
    </div>
  );
}

export default Register;
