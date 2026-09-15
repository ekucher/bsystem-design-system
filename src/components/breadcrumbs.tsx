import { Fragment, type ReactNode } from "react";
import { join } from "./button.js";

export interface Crumb {
  label: ReactNode;
  /** Omitted on the current page, which is not a link to itself. */
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  /** Distinguishes this landmark when a page has more than one navigation. */
  label?: string;
  className?: string;
}

/**
 * A trail showing where the current page sits.
 *
 * The last item is marked `aria-current="page"` and is not a link: linking a
 * page to itself gives a keyboard user a stop that does nothing.
 *
 * The separator is decorative and hidden from assistive technology, which
 * would otherwise read a slash between every level.
 */
export function Breadcrumbs({ items, label = "Breadcrumb", className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className={join("bs-breadcrumbs", className)}>
      <ol>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <Fragment key={index}>
              <li>
                {item.href && !last ? (
                  <a href={item.href}>{item.label}</a>
                ) : (
                  <span aria-current={last ? "page" : undefined}>{item.label}</span>
                )}
              </li>
              {!last && (
                <li className="bs-breadcrumbs__separator" aria-hidden="true">
                  /
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
