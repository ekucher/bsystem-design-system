import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { join } from "./button.js";

type FieldOwnProps = {
  /** The visible label. Always rendered: a placeholder is not a label. */
  label: ReactNode;
  /** Guidance shown under the control and announced with it. */
  description?: ReactNode;
  /** An error message. Its presence marks the control invalid. */
  error?: ReactNode;
  className?: string;
};

/**
 * Wires a control to its label, description and error.
 *
 * The association is what makes a field usable with a screen reader: the label
 * names the control, and `aria-describedby` makes the description and any
 * error part of what is announced when the control receives focus. Doing this
 * per usage is exactly where it gets forgotten.
 */
function useField(props: FieldOwnProps, providedId?: string) {
  const generated = useId();
  const id = providedId ?? generated;
  const descriptionId = props.description ? `${id}-description` : undefined;
  const errorId = props.error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  return { id, descriptionId, errorId, describedBy, invalid: Boolean(props.error) };
}

function FieldShell({
  id,
  label,
  description,
  error,
  descriptionId,
  errorId,
  className,
  children,
}: FieldOwnProps & {
  id: string;
  descriptionId?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <div className={join("bs-field", error && "bs-field--invalid", className)}>
      <label className="bs-field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {description && (
        <p className="bs-field__description" id={descriptionId}>
          {description}
        </p>
      )}
      {/* The error is a live region so that a validation failure appearing
          after submission is announced, not just rendered. */}
      {error && (
        <p className="bs-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className">, FieldOwnProps {}

export function Input({ label, description, error, className, id: providedId, ...props }: InputProps) {
  const field = useField({ label, description, error }, providedId);
  return (
    <FieldShell
      id={field.id}
      label={label}
      description={description}
      error={error}
      descriptionId={field.descriptionId}
      errorId={field.errorId}
      className={className}
    >
      <input
        id={field.id}
        className="bs-input"
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        {...props}
      />
    </FieldShell>
  );
}

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">, FieldOwnProps {}

export function Textarea({ label, description, error, className, id: providedId, ...props }: TextareaProps) {
  const field = useField({ label, description, error }, providedId);
  return (
    <FieldShell
      id={field.id}
      label={label}
      description={description}
      error={error}
      descriptionId={field.descriptionId}
      errorId={field.errorId}
      className={className}
    >
      <textarea
        id={field.id}
        className="bs-input bs-textarea"
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        {...props}
      />
    </FieldShell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children">, FieldOwnProps {
  options: SelectOption[];
  /** A leading option for "nothing chosen", which a required select needs. */
  placeholder?: string;
}

/**
 * A select built on the native element.
 *
 * A custom listbox would need its own keyboard model, its own screen-reader
 * semantics and its own mobile behaviour, and would still be worse than what
 * the platform provides.
 */
export function Select({ label, description, error, className, id: providedId, options, placeholder, ...props }: SelectProps) {
  const field = useField({ label, description, error }, providedId);
  return (
    <FieldShell
      id={field.id}
      label={label}
      description={description}
      error={error}
      descriptionId={field.descriptionId}
      errorId={field.errorId}
      className={className}
    >
      <select
        id={field.id}
        className="bs-input bs-select"
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
