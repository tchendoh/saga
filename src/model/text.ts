import type { Edition, EditionText, Series } from "./schema";
import { bookIndex } from "./position";

/** Picks the value for the reader's edition. */
export function inEdition(text: EditionText, edition: Edition): string {
  return typeof text === "string" ? text : text[edition];
}

/** Number of the book in the series (1-based), derived from reading order. */
export function bookNumber(series: Series, bookId: string): number {
  return bookIndex(series, bookId) + 1;
}

/** Title with its number, e.g. "2. Golden Son". */
export function bookLabel(series: Series, bookId: string, edition: Edition): string {
  const book = series.books[bookIndex(series, bookId)];
  return `${bookNumber(series, bookId)}. ${inEdition(book.title, edition)}`;
}
