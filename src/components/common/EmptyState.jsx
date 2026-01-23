import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
}

export default EmptyState;