import { cn } from '../../lib/utils';
function Card({ className, ...props }) {
  return <div className={cn('card', className)} {...props} />;
}
function CardHeader({ className, ...props }) {
  return <div className={cn('card-header', className)} {...props} />;
}
function CardBody({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />;
}
function CardTitle({ className, ...props }) {
  return <h3 className={cn('card-title', className)} {...props} />;
}
export { Card, CardBody, CardHeader, CardTitle };
