import { PackageOpen } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon = PackageOpen,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-20 text-center">
      <Icon className="size-10 text-muted-foreground/50" />
      <h3 className="mt-4 font-medium">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
