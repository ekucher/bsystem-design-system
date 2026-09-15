import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { join } from "./button.js";

export interface DropdownItem {
  id: string;
  label: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
}

export interface DropdownProps {
  /** The trigger's visible text. */
  label: ReactNode;
  items: DropdownItem[];
  className?: string;
}

/**
 * A menu of actions behind a trigger.
 *
 * It is a menu, not a listbox: the items perform actions rather than choosing
 * a value, so they are `menuitem`s and the trigger reports `aria-haspopup`.
 *
 * Opening with ArrowDown focuses the first item and ArrowUp the last, which is
 * what lets a keyboard user reach the end of a long menu in one keystroke.
 * Escape closes and returns focus to the trigger, and a click outside closes
 * without stealing focus.
 */
export function Dropdown({ label, items, className = "" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const base = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());

  const usable = items.filter((item) => !item.disabled);

  const focusItem = (index: number) => {
    const item = usable[(index + usable.length) % usable.length];
    if (item) itemRefs.current.get(item.id)?.focus();
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpen(true);
    // The menu has not rendered yet on this tick.
    queueMicrotask(() => focusItem(event.key === "ArrowDown" ? 0 : usable.length - 1));
  };

  // Escape is handled on the container rather than on the menu, because a
  // menu opened with a mouse click leaves focus on the trigger: a handler on
  // the menu alone would never see the key the user actually pressed.
  const onContainerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (open && event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = usable.findIndex((item) => itemRefs.current.get(item.id) === document.activeElement);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusItem(current + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusItem(current - 1);
        break;
      case "Home":
        event.preventDefault();
        focusItem(0);
        break;
      case "End":
        event.preventDefault();
        focusItem(usable.length - 1);
        break;
      case "Tab":
        // Tabbing away from a menu closes it, but focus continues onwards
        // rather than snapping back to the trigger.
        close(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={join("bs-dropdown", className)} ref={container} onKeyDown={onContainerKeyDown}>
      <button
        type="button"
        className="bs-button bs-button--secondary bs-dropdown__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${base}-menu` : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
        ref={trigger}
      >
        {label}
      </button>

      {open && (
        <div className="bs-dropdown__menu" role="menu" id={`${base}-menu`} onKeyDown={onMenuKeyDown}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="bs-dropdown__item"
              disabled={item.disabled}
              onClick={() => {
                item.onSelect();
                close();
              }}
              ref={(node) => {
                if (node) itemRefs.current.set(item.id, node);
                else itemRefs.current.delete(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
