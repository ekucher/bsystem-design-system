import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { join } from "./button.js";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  /** Controlled selection. Omit to let the component manage it. */
  value?: string;
  onChange?: (id: string) => void;
  /** Names the tab list when a page has more than one. */
  label?: string;
  className?: string;
}

/**
 * A tab set.
 *
 * Tabs use a roving tabindex: the list is one stop in the page's tab order and
 * arrow keys move between the tabs within it. Making every tab its own tab
 * stop would force a keyboard user to step through all of them to reach the
 * panel.
 *
 * Selection follows focus, which is the expected behaviour when panels are
 * already rendered, and Home and End jump to the ends of the list.
 */
export function Tabs({ items, value, onChange, label = "Tabs", className = "" }: TabsProps) {
  const base = useId();
  const [internal, setInternal] = useState(() => items.find((item) => !item.disabled)?.id ?? items[0]?.id ?? "");
  const selected = value ?? internal;
  const refs = useRef(new Map<string, HTMLButtonElement>());

  const select = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const usable = items.filter((item) => !item.disabled);
    if (usable.length === 0) return;
    const position = usable.findIndex((item) => item.id === items[index].id);

    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        next = (position + 1) % usable.length;
        break;
      case "ArrowLeft":
        next = (position - 1 + usable.length) % usable.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = usable.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const target = usable[next];
    select(target.id);
    refs.current.get(target.id)?.focus();
  };

  return (
    <div className={join("bs-tabs", className)}>
      <div className="bs-tabs__list" role="tablist" aria-label={label}>
        {items.map((item, index) => {
          const active = item.id === selected;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${base}-tab-${item.id}`}
              className={join("bs-tabs__tab", active && "bs-tabs__tab--selected")}
              aria-selected={active}
              aria-controls={`${base}-panel-${item.id}`}
              // Only the selected tab is in the tab order; the rest are
              // reached with the arrow keys.
              tabIndex={active ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.id)}
              onKeyDown={(event) => move(event, index)}
              ref={(node) => {
                if (node) refs.current.set(item.id, node);
                else refs.current.delete(item.id);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          className="bs-tabs__panel"
          hidden={item.id !== selected}
          // The panel is focusable so that moving from the tab list lands
          // somewhere, even when the panel holds no controls of its own.
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
