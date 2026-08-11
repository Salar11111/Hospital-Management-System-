import { Suspense, lazy } from 'react';
import { Spinner } from '../components/ui/Button';

function loadable(loader) {
  const Component = lazy(loader);

  function Loadable(props) {
    return (
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center p-12">
            <Spinner className="h-8 w-8 text-primary-600" />
          </div>
        }
      >
        <Component {...props} />
      </Suspense>
    );
  }
  return Loadable;
}

export default loadable;
