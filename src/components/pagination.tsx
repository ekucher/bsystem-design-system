import { join } from "./button.js";

export interface PaginationProps {
  /** Whether a previous page exists. */
  hasPrevious: boolean;
  /** Whether a next page exists. */
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  /** How many items the current page shows. */
  shown?: number;
  /** How many items the whole collection holds. */
  total?: number;
  /** Names the landmark when a page paginates more than one collection. */
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

/**
 * Controls for walking a paginated collection.
 *
 * The component takes "is there a previous/next page" rather than page
 * numbers, because BSYSTEM collections are walked by opaque cursor: the
 * platform says whether more remains, and neither the caller nor this
 * component can compute a page count from that.
 *
 * The position summary is a live region, so a screen-reader user hears the
 * range change when they page rather than having to go looking for it.
 */
export function Pagination({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  shown,
  total,
  label = "Pagination",
  previousLabel = "Previous",
  nextLabel = "Next",
  className = "",
}: PaginationProps) {
  return (
    <nav className={join("bs-pagination", className)} aria-label={label}>
      {shown !== undefined && total !== undefined && (
        <p className="bs-pagination__summary" aria-live="polite">
          {shown} of {total}
        </p>
      )}
      <button type="button" className="bs-button bs-button--secondary" onClick={onPrevious} disabled={!hasPrevious}>
        {previousLabel}
      </button>
      <button type="button" className="bs-button bs-button--secondary" onClick={onNext} disabled={!hasNext}>
        {nextLabel}
      </button>
    </nav>
  );
}
