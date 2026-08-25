import type { ComponentType, CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LedgerFrame({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1360px] px-4 py-6 md:px-8 md:py-8", className)} {...props} />;
}

export function LedgerHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("grid gap-4 border-b-2 border-[var(--ledger-rule-strong)] pb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end", className)}>
      <div>
        {eyebrow ? <LedgerLabel>{eyebrow}</LedgerLabel> : null}
        <h1 className="mt-1 font-display text-[1.75rem] font-semibold leading-tight text-[var(--ledger-ink)] md:text-[2rem]">{title}</h1>
        {description ? <div className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</div> : null}
      </div>
      {meta || actions ? <div className="flex flex-wrap items-center gap-3 md:justify-end">{meta}{actions}</div> : null}
    </header>
  );
}

export function LedgerSection({
  title,
  eyebrow,
  action,
  children,
  className,
  as: Tag = "section",
}: {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "aside" | "div";
}) {
  return (
    <Tag className={cn("border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] text-[var(--ledger-ink)]", className)}>
      {title || eyebrow || action ? (
        <div className="flex items-end justify-between gap-4 border-b-2 border-[var(--ledger-rule)] px-5 py-4 md:px-6">
          <div>
            {eyebrow ? <LedgerLabel>{eyebrow}</LedgerLabel> : null}
            {title ? <h2 className="mt-1 font-display text-xl font-semibold leading-tight">{title}</h2> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </Tag>
  );
}

export function LedgerRule({ strong = false, className }: { strong?: boolean; className?: string }) {
  return <div aria-hidden="true" className={cn(strong ? "border-t-2 border-[var(--ledger-rule-strong)]" : "border-t-2 border-[var(--ledger-rule)]", className)} />;
}

export function LedgerLabel({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <p className={cn("font-mono text-[0.67rem] font-semibold uppercase tracking-[0.12em] text-[var(--ledger-faint)]", className)} style={style}>{children}</p>;
}

export function LedgerProgress({ value, label, className }: { value: number; label: string; className?: string }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-4 text-xs font-semibold">
        <span>{label}</span><span className="tabular-nums">{normalized}%</span>
      </div>
      <div className="h-1.5 bg-[var(--ledger-track)]" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalized}>
        <div className="h-full bg-[var(--ledger-accent)] transition-transform duration-200 motion-reduce:transition-none" style={{ transform: `scaleX(${normalized / 100})`, transformOrigin: "left" }} />
      </div>
    </div>
  );
}

const evidenceStyles = {
  positive: "border-[var(--ledger-positive)] bg-[var(--ledger-positive-tint)] text-[var(--ledger-positive)]",
  negative: "border-[var(--ledger-negative)] bg-[var(--ledger-negative-tint)] text-[var(--ledger-negative)]",
  provisional: "border-[var(--ledger-provisional)] bg-[#FBF7EE] text-[var(--ledger-provisional)]",
  neutral: "border-[var(--ledger-rule)] bg-[var(--ledger-paper)] text-[var(--ledger-ink)]",
};

export function EvidenceStatus({
  tone = "neutral",
  label,
  detail,
  icon: Icon,
  className,
}: {
  tone?: keyof typeof evidenceStyles;
  label: string;
  detail?: ReactNode;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className?: string;
}) {
  return (
    <div className={cn("border-l-4 px-3 py-2.5", evidenceStyles[tone], className)}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}<span>{label}</span>
      </div>
      {detail ? <div className="mt-1 text-xs leading-5 text-[var(--ledger-ink)]">{detail}</div> : null}
    </div>
  );
}

export function LedgerEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-2 border-dashed border-[var(--ledger-rule)] bg-[var(--ledger-paper)] p-5", className)}>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <div className="mt-1 text-sm leading-6 text-muted-foreground">{description}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
