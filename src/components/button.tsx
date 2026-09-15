import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/**
 * A button.
 *
 * `type` defaults to "button" because the HTML default is "submit", which
 * makes any button inside a form submit it by accident.
 */
export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={join("bs-button", `bs-button--${variant}`, className)} {...props} />;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = "", ...props }: CardProps) {
  return <div className={join("bs-card", elevated && "bs-card--elevated", className)} {...props} />;
}

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export interface BadgeProps extends PropsWithChildren<HTMLAttributes<HTMLSpanElement>> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return <span className={join("bs-badge", `bs-badge--${tone}`, className)} {...props} />;
}

export interface StatusBadgeProps extends Omit<BadgeProps, "children" | "tone"> {
  /** The status to display. */
  status: string;
  /**
   * The tone to render it in. Defaults to a mapping of the statuses BSYSTEM
   * uses for adapters and platform health.
   */
  tone?: Tone;
  /**
   * A textual description of what the status means. Rendered for assistive
   * technology so the badge does not rely on colour alone to carry meaning.
   */
  description?: string;
}

/** The tone BSYSTEM's own status vocabulary maps to. */
const STATUS_TONES: Record<string, Tone> = {
  ready: "success",
  ok: "success",
  available: "success",
  closed: "success",
  degraded: "warning",
  half_open: "warning",
  warning: "warning",
  error: "danger",
  open: "danger",
  failed: "danger",
  disabled: "neutral",
  unknown: "neutral",
};

/**
 * A badge for a platform status.
 *
 * Colour never carries the meaning on its own: the status text is always
 * shown, and an optional description is exposed to assistive technology.
 */
export function StatusBadge({ status, tone, description, className = "", ...props }: StatusBadgeProps) {
  const resolved = tone ?? STATUS_TONES[status.toLowerCase()] ?? "neutral";
  return (
    <Badge tone={resolved} className={join("bs-status-badge", className)} {...props}>
      {status}
      {description && <span className="bs-visually-hidden"> — {description}</span>}
    </Badge>
  );
}

/** Joins class names, dropping anything falsy. */
export function join(...values: Array<unknown>): string {
  return values.filter((value): value is string => typeof value === "string" && value.length > 0).join(" ");
}
