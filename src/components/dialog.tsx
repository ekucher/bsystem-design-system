import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { join } from "./button.js";

export interface DialogProps {
  open: boolean;
  /** Called on Escape, on a scrim click, and from the close control. */
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Actions, rendered after the content and inside the focus trap. */
  footer?: ReactNode;
  /** Accessible name for the close control. */
  closeLabel?: string;
  className?: string;
}

/** Elements that can take focus, used to find the trap's boundaries. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A modal dialog.
 *
 * Three behaviours are what make a modal usable rather than a visual overlay,
 * and all three are easy to omit:
 *
 *  - Focus moves into the dialog when it opens and returns to whatever opened
 *    it when it closes. Without the return, a keyboard user is dropped at the
 *    top of the document.
 *  - Tab is trapped. Without it, focus walks out into the page behind, which
 *    is visually obscured, so the user is typing into something they cannot
 *    see.
 *  - Escape closes. A modal with no keyboard exit is a trap in the literal
 *    sense.
 *
 * The native `<dialog>` element provides all of this, but it is not
 * implemented in the environment these components are tested in, so the
 * behaviour is implemented here where it can be verified.
 */
export function Dialog({ open, onClose, title, children, footer, closeLabel = "Close", className = "" }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const titleId = useId();

  const focusable = useCallback(
    () => Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((node) => node.offsetParent !== null || true),
    [],
  );

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement;
    // Focus the first control, or the panel itself when there is nothing to
    // focus, so the reader's position is inside the dialog either way.
    const first = focusable()[0];
    (first ?? panel.current)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = focusable();
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      // Returning focus is what lets a keyboard user carry on from where they
      // were rather than from the top of the page.
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus();
    };
  }, [open, onClose, focusable]);

  if (!open) return null;

  return (
    <div className="bs-dialog__scrim" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className={join("bs-dialog", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panel}
        tabIndex={-1}
      >
        <div className="bs-dialog__header">
          <h2 className="bs-dialog__title" id={titleId}>
            {title}
          </h2>
          <button type="button" className="bs-dialog__close" onClick={onClose} aria-label={closeLabel}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="bs-dialog__content">{children}</div>
        {footer && <div className="bs-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}
