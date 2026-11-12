import { bookIndex } from "./position.ts";
import type { Character, Language, Series } from "./schema.ts";
import { termIds } from "./text.ts";

/**
 * Spoiler-safety rules that Zod alone cannot express, because they need the series.
 * Returns a list of human-readable problems (empty when everything is fine).
 */
export function checkCharacter(series: Series, character: Character, all: Character[] = [character]): string[] {
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
    houses: character.houses,
    allegiances: character.allegiances,
    titles: character.titles,
    relations: character.relations,
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

  for (const [field, list] of [
    ["houses", series.houses],
    ["allegiances", series.allegiances],
  ] as const) {
    const ids = new Set(list.map((item) => item.id));
    character[field].forEach((entry, i) => {
      if (!ids.has(entry.value)) problems.push(`${where}: ${field}[${i}] "${entry.value}" is not defined in the series`);
    });
  }

  const byId = new Map(all.map((c) => [c.id, c]));
  character.relations.forEach((entry, i) => {
    const target = byId.get(entry.value.target);
    if (!target) {
      problems.push(`${where}: relations[${i}] targets unknown character "${entry.value.target}"`);
      return;
    }
    // A relation must not reveal a character the reader has not met yet.
    const since = index(entry.since, `relations[${i}].since`);
    const targetIntroduced = index(target.introduced, `relations[${i}] target introduced`);
    if (since !== undefined && targetIntroduced !== undefined && since < targetIntroduced) {
      problems.push(`${where}: relations[${i}] is revealed before "${target.id}" is introduced`);
    }
  });

  // Every {term:id} marker in a description must point to a term defined in the series.
  const termSet = new Set(series.terms.map((term) => term.id));
  const texts: { field: string; value: Partial<Record<Language, string>> }[] = [
    ...character.facts.map((fact, i) => ({ field: `facts[${i}]`, value: fact.value })),
    ...(character.death ? [{ field: "death", value: character.death.value }] : []),
  ];
  for (const { field, value } of texts) {
    for (const [language, text] of Object.entries(value)) {
      for (const id of termIds(text ?? "")) {
        if (!termSet.has(id)) problems.push(`${where}: ${field}.${language} uses unknown term "${id}"`);
      }
    }
  }

  if (character.death) {
    const since = index(character.death.since, "death.since");
    // What happens in a book is only shown from the next book on.
    if (since !== undefined && since <= introduced) {
      problems.push(`${where}: death must be revealed after the book where the character is introduced`);
    }
  }

  return problems;
}
