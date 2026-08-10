import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { getErrorMessage } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign in'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <HeartPulse className="h-6 w-6" />
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">MediCore</h1>
          <p className="text-sm text-slate-500">Hospital Management System</p>
        </div>

        <Card>
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
            <p className="mb-5 text-sm text-slate-500">Enter your credentials to access the system</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}
              <Button type="submit" className="w-full" loading={loading}>
                Sign in
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}