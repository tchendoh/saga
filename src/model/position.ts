import type { Series } from "./schema";

/**
 * Reading position as an index in the series' book list.
 * 0 = start of the first book. books.length = after the last book ("spoil everything").
 */
export type Position = number;

export type SpoilerLevel = "none" | "finished" | "all";

export function bookIndex(series: Series, bookId: string): number {
  const index = series.books.findIndex((book) => book.id === bookId);
  if (index === -1) throw new Error(`Unknown book "${bookId}" in series "${series.id}"`);
  return index;
}

/** Position actually used for filtering, given the book being read and the spoiler level. */
export function effectivePosition(series: Series, currentBook: string, level: SpoilerLevel): Position {
  if (level === "all") return series.books.length;
  const index = bookIndex(series, currentBook);
  return level === "finished" ? index + 1 : index;
}

/** A piece of information marked `since` is visible once the reader has reached that book. */
export function isVisible(series: Series, since: string, position: Position): boolean {
  return bookIndex(series, since) <= position;
}
