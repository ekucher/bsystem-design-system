import type { HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { join, type Tone } from "./button.js";

// `title` is deliberately not the HTML attribute of that name: a tooltip is a
// poor way to carry a heading, and it is unreachable by touch and by keyboard.
export interface AlertProps extends PropsWithChildren<Omit<HTMLAttributes<HTMLDivElement>, "title">> {
  tone?: Exclude<Tone, "neutral">;
  /** An optional heading, announced before the body. */
  title?: ReactNode;
}

/**
 * A message about the state of something.
 *
 * Warnings and errors use `role="alert"`, which interrupts a screen-reader
 * user, because they describe something that needs attention now. Information
 * and success use `role="status"`, which waits for a pause — an interruption
 * to say a thing worked is an interruption for nothing.
 *
 * Every tone is also prefixed with a word, so the tone is never the only thing
 * carrying the meaning.
 */
export function Alert({ tone = "info", title, className = "", children, ...props }: AlertProps) {
  const assertive = tone === "danger" || tone === "warning";
  return (
    <div
      className={join("bs-alert", `bs-alert--${tone}`, className)}
      role={assertive ? "alert" : "status"}
      {...props}
    >
      <span className="bs-visually-hidden">{TONE_LABELS[tone]}: </span>
      <div className="bs-alert__body">
        {title && <p className="bs-alert__title">{title}</p>}
        {children}
      </div>
    </div>
  );
}

const TONE_LABELS: Record<Exclude<Tone, "neutral">, string> = {
  info: "Information",
  success: "Success",
  warning: "Warning",
  danger: "Error",
};

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** What is being waited for. Announced to assistive technology. */
  label?: string;
}

/**
 * An indeterminate progress indicator.
 *
 * The spinning shape is hidden from assistive technology and replaced by text,
 * because a rotating element conveys nothing to a screen reader.
 */
export function Spinner({ label = "Loading", className = "", ...props }: SpinnerProps) {
  return (
    <span className={join("bs-spinner", className)} role="status" {...props}>
      <span className="bs-spinner__mark" aria-hidden="true" />
      <span className="bs-visually-hidden">{label}</span>
    </span>
  );
}

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** How many placeholder lines to draw. */
  lines?: number;
  /** CSS width of the placeholder. */
  width?: string;
}

/**
 * A placeholder for content that has not arrived.
 *
 * It is hidden from assistive technology entirely: a screen-reader user should
 * hear that something is loading once, from the region's own status message,
 * not hear a description of grey rectangles. Announce loading with a Spinner
 * or a live region alongside it.
 */
export function Skeleton({ lines = 1, width, className = "", style, ...props }: SkeletonProps) {
  return (
    <span className={join("bs-skeleton", className)} aria-hidden="true" style={{ width, ...style }} {...props}>
      {Array.from({ length: Math.max(1, lines) }, (_, index) => (
        <span className="bs-skeleton__line" key={index} />
      ))}
    </span>
  );
}
