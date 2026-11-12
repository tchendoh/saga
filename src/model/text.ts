import type { Edition, EditionText, Series } from "./schema.ts";
import { bookIndex } from "./position.ts";

/** Picks the value for the reader's edition. */
export function inEdition(text: EditionText, edition: Edition): string {
  return typeof text === "string" ? text : text[edition];
}

/** Marker placed in a description to insert a term in the reader's edition, e.g. {term:howlers}. */
const TERM_MARKER = /\{term:([a-z0-9-]+)\}/g;

/** Ids of every term marker found in a text, in order of appearance. */
export function termIds(text: string): string[] {
  return [...text.matchAll(TERM_MARKER)].map((match) => match[1]);
}

/** Replaces each {term:id} marker with the term in the reader's edition. Unknown markers are left as is. */
export function resolveTerms(text: string, series: Series, edition: Edition): string {
  return text.replace(TERM_MARKER, (marker, id: string) => {
    const term = series.terms.find((t) => t.id === id);
    return term ? inEdition(term.name, edition) : marker;
  });
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
