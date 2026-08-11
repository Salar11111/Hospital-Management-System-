import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FileQuestion className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Page not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <Link to="/" className="mt-6">
            <Button>Back to dashboard</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
export default NotFound;
