import { bookIndex } from "./position";
import type { Character, Series } from "./schema";

/**
 * Spoiler-safety rules that Zod alone cannot express, because they need the series.
 * Returns a list of human-readable problems (empty when everything is fine).
 */
export function checkCharacter(series: Series, character: Character): string[] {
  const problems: string[] = [];
  const where = `character "${character.id}"`;
  const index = (bookId: string, field: string): number | undefined => {
    try {
      return bookIndex(series, bookId);
    } catch {
      problems.push(`${where}: ${field} refers to unknown book "${bookId}"`);
      return undefined;
    }
  };

  const introduced = index(character.introduced, "introduced");
  if (introduced === undefined) return problems;

  const datedFields = {
    names: character.names,
    aliases: character.aliases,
    colors: character.colors,
    roles: character.roles,
    facts: character.facts,
  };
  for (const [field, entries] of Object.entries(datedFields)) {
    entries.forEach((entry, i) => {
      const since = index(entry.since, `${field}[${i}].since`);
      if (since !== undefined && since < introduced) {
        problems.push(`${where}: ${field}[${i}] is revealed before the character is introduced`);
      }
    });
  }

  for (const field of ["names", "colors"] as const) {
    if (!character[field].some((entry) => entry.since === character.introduced)) {
      problems.push(`${where}: needs at least one ${field} entry visible from "${character.introduced}"`);
    }
  }

  const colorIds = new Set(series.colors.map((color) => color.id));
  character.colors.forEach((entry, i) => {
    if (!colorIds.has(entry.value)) problems.push(`${where}: colors[${i}] "${entry.value}" is not a known color`);
  });

  if (character.death) {
    const since = index(character.death.since, "death.since");
    // What happens in a book is only shown from the next book on.
    if (since !== undefined && since <= introduced) {
      problems.push(`${where}: death must be revealed after the book where the character is introduced`);
    }
  }

  return problems;
}
