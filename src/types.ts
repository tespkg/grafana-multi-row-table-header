export interface MultiHeaderOptions {
  /**
   * Delimiter used inside a column's display name to split it into two header
   * rows. Everything before the delimiter becomes the top (group) header, the
   * remainder becomes the bottom (sub) header. Columns whose name does not
   * contain the delimiter are rendered as a single cell spanning both rows.
   *
   * Defaults to a carriage return ("\r") so a field named `2015\r1P` renders as
   * `2015` on top and `1P` below.
   */
  delimiter: string;
  /** Prepend an auto-incrementing row-number ("#") column. */
  showRowNumbers: boolean;
  /** Keep the two header rows pinned while the body scrolls. */
  stickyHeader: boolean;
}
