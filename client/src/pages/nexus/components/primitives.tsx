/**
 * Shared neo-brutalist primitives for the LSAT Nexus app.
 * Thin wrappers over the .nexus-app CSS scope defined in index.css.
 */
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function NxCard({
  children,
  className,
  flat = false,
  accent,
}: {
  children: ReactNode;
  className?: string;
  flat?: boolean;
  accent?: string;
}) {
  return (
    <div
      className={cn(flat ? "nx-card-flat" : "nx-card", className)}
      style={accent ? { borderTopColor: accent, borderTopWidth: 6 } : undefined}
    >
      {children}
    </div>
  );
}

/** Uppercase mono kicker label, e.g. section eyebrows. */
export function NxLabel({
  children,
  className,
  color,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn("nx-label", className)}
      style={color ? { color } : undefined}
    >
      {children}
    </span>
  );
}

/** Section header with a colored bar, title, and optional blurb. */
export function NxSectionHeader({
  eyebrow,
  title,
  blurb,
  color,
}: {
  eyebrow: string;
  title: string;
  blurb?: string;
  color: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span className="inline-block h-6 w-2" style={{ background: color }} />
        <NxLabel color={color}>{eyebrow}</NxLabel>
      </div>
      <h2 className="nx-display mt-2 text-2xl leading-tight md:text-3xl">
        {title}
      </h2>
      {blurb && <p className="mt-1 max-w-2xl text-sm text-black/60">{blurb}</p>}
    </div>
  );
}

/** Small monospace pill / badge. */
export function NxBadge({
  children,
  color = "#111111",
  filled = false,
}: {
  children: ReactNode;
  color?: string;
  filled?: boolean;
}) {
  return (
    <span
      className="nx-mono inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={
        filled
          ? {
              background: color,
              color: "#FFFDF8",
              border: `2px solid ${color}`,
            }
          : { color, border: `2px solid ${color}` }
      }
    >
      {children}
    </span>
  );
}

export function NxButton({
  children,
  onClick,
  type = "button",
  variant = "solid",
  color = "#111111",
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "outline";
  color?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "nx-mono inline-flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-40",
        "border-2 active:translate-x-[2px] active:translate-y-[2px]",
        className
      )}
      style={
        variant === "solid"
          ? {
              background: color,
              color: "#FFFDF8",
              borderColor: "#111111",
              boxShadow: "3px 3px 0 0 #111111",
            }
          : {
              background: "transparent",
              color: "#111111",
              borderColor: "#111111",
            }
      }
    >
      {children}
    </button>
  );
}
