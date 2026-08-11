import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
const Input = forwardRef(({ className, label, error, hint, id, ...props }, ref) => {
  const fieldId = id ?? props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={fieldId}
        className={cn('input', error && 'border-red-400 focus:border-red-400 focus:ring-red-100')}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
const Textarea = forwardRef(({ className, label, error, id, ...props }, ref) => {
  const fieldId = id ?? props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        className={cn('input min-h-24 resize-y', error && 'border-red-400')}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';
export { Input, Textarea };
