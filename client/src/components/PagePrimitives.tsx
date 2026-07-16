import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageFrame({
  children,
  className,
  width = "wide",
}: {
  children: ReactNode;
  className?: string;
  width?: "reading" | "wide" | "full";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8",
        width === "reading" && "max-w-[76ch]",
        width === "wide" && "max-w-7xl",
        width === "full" && "max-w-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 border-b border-border pb-6", className)}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          {eyebrow ? (
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-3xl font-bold tracking-[-0.025em] text-foreground sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <div className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function SectionCard({
  title,
  description,
  children,
  actions,
  className,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-border bg-card text-card-foreground shadow-[var(--shadow-card)]", className)}>
      {title || description || actions ? (
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            {title ? <h2 className="font-display text-lg font-bold tracking-[-0.015em]">{title}</h2> : null}
            {description ? <div className="mt-1 text-sm leading-6 text-muted-foreground">{description}</div> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function MetadataRow({ items, className }: { items: Array<{ label: string; value: ReactNode }>; className?: string }) {
  return (
    <dl className={cn("grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="border-l-2 border-secondary/60 pl-3">
          <dt className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 font-semibold text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type StateTone = "neutral" | "info" | "success" | "warning" | "error";

const toneClasses: Record<StateTone, { icon: string; border: string }> = {
  neutral: { icon: "bg-muted text-foreground", border: "border-border" },
  info: { icon: "bg-info/12 text-info", border: "border-info/35" },
  success: { icon: "bg-success/12 text-success", border: "border-success/35" },
  warning: { icon: "bg-warning/16 text-warning-foreground", border: "border-warning/45" },
  error: { icon: "bg-destructive/12 text-destructive", border: "border-destructive/35" },
};

export function StatePanel({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  tone = "neutral",
  className,
}: {
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  eyebrow?: string;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  tone?: StateTone;
  className?: string;
}) {
  const styles = toneClasses[tone];
  return (
    <section
      className={cn("academic-surface border bg-card p-6 text-card-foreground shadow-[var(--shadow-card)] sm:p-8", styles.border, className)}
      aria-labelledby={`state-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    >
      {Icon ? (
        <div className={cn("mb-5 flex h-11 w-11 items-center justify-center rounded-sm", styles.icon)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      ) : null}
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p> : null}
      <h1 id={`state-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
        {title}
      </h1>
      <div className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{description}</div>
      {action || secondaryAction ? (
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  );
}
