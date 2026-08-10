import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, KeyRound } from 'lucide-react';
import { authApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { getErrorMessage } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSent(true);
      setDevToken(res.data?.devToken ?? '');
    } catch (err) {
      setError(getErrorMessage(err, 'Something went wrong'));
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
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Reset password</h1>
        </div>

        <Card>
          <CardBody className="p-6">
            {sent ? (
              <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <KeyRound className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-base font-semibold text-slate-900">Check your email</h2>
                <p className="mt-1 text-sm text-slate-500">
                  If an account exists for <span className="font-medium">{email}</span>, a password
                  reset link has been sent.
                </p>
                {devToken && (
                  <div className="mt-4 rounded-lg bg-amber-50 p-3 text-left">
                    <p className="text-xs font-medium text-amber-800">
                      Development mode reset token:
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-amber-900">{devToken}</p>
                  </div>
                )}
                <Link
                  to="/reset-password"
                  className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  I have a token — reset now
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-slate-900">Forgot password</h2>
                <p className="mb-5 text-sm text-slate-500">
                  Enter the email associated with your account.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                  )}
                  <Button type="submit" className="w-full" loading={loading}>
                    Send reset link
                  </Button>
                </form>
              </>
            )}

            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                Back to sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}