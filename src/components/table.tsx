import type { ReactNode } from "react";
import { join } from "./button.js";

export interface TableColumn<T> {
  /** Stable key for the column. */
  key: string;
  header: ReactNode;
  render: (item: T) => ReactNode;
  /** Right-aligns numeric columns, which are read more easily that way. */
  numeric?: boolean;
}

export interface TableProps<T> {
  /**
   * Describes the table. Required, not optional: a screen reader announces it
   * on entry, and without it a user landing in a table has no idea what they
   * are in.
   */
  caption: ReactNode;
  columns: TableColumn<T>[];
  rows: T[];
  /** Identity for each row. Defaults to an `id` property when present. */
  rowKey?: (item: T, index: number) => string;
  /** Shown in place of the body when there are no rows. */
  empty?: ReactNode;
  className?: string;
}

/**
 * A data table.
 *
 * Column headers are marked with `scope="col"` so each cell is associated with
 * its header when read out of order, which is how a screen-reader user
 * navigates a table.
 */
export function Table<T>({ caption, columns, rows, rowKey, empty, className = "" }: TableProps<T>) {
  return (
    <table className={join("bs-table", className)}>
      <caption className="bs-table__caption">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col" className={join(column.numeric && "bs-table__cell--numeric")}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="bs-table__empty">
              {empty ?? "No data"}
            </td>
          </tr>
        ) : (
          rows.map((item, index) => (
            <tr key={rowKey ? rowKey(item, index) : defaultKey(item, index)}>
              {columns.map((column) => (
                <td key={column.key} className={join(column.numeric && "bs-table__cell--numeric")}>
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function defaultKey(item: unknown, index: number): string {
  if (item && typeof item === "object" && "id" in item) {
    const id = (item as { id: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return String(index);
}
