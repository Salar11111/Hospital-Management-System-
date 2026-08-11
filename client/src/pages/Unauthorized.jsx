import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
function Unauthorized() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Access denied</h1>
          <p className="mt-2 text-sm text-slate-500">
            You don't have permission to view this page. Contact an administrator if you believe
            this is a mistake.
          </p>
          <Link to="/dashboard" className="mt-6">
            <Button>Back to dashboard</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
export default Unauthorized;
