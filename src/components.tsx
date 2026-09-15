import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`bs-button bs-button--${variant} ${className}`.trim()} {...props} />;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = "", ...props }: CardProps) {
  return <div className={`bs-card${elevated ? " bs-card--elevated" : ""} ${className}`.trim()} {...props} />;
}

export interface BadgeProps extends PropsWithChildren<HTMLAttributes<HTMLSpanElement>> {
  tone?: "neutral" | "success" | "warning" | "danger";
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return <span className={`bs-badge bs-badge--${tone} ${className}`.trim()} {...props} />;
}
