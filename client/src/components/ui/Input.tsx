import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
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
  }
);
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(({ className, label, error, id, ...props }, ref) => {
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