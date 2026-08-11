import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { authApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { getErrorMessage } from '../lib/api';
function ResetPassword() {
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') ?? '';
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to reset password'));
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
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Set a new password</h1>
        </div>

        <Card>
          <CardBody className="p-6">
            {done ? (
              <div className="text-center">
                <h2 className="text-base font-semibold text-slate-900">Password updated</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your password has been reset successfully. You can now sign in.
                </p>
                <Link
                  to="/login"
                  className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Go to sign in
                </Link>
              </div>
            ) : (
              <>
                <p className="mb-5 text-sm text-slate-500">Enter your new password below.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Reset token"
                    name="token"
                    required
                    placeholder="Paste the reset token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                  <Input
                    label="New password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Input
                    label="Confirm password"
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                  )}
                  <Button type="submit" className="w-full" loading={loading}>
                    Reset password
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
export default ResetPassword;
