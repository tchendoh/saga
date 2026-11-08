import { isVisible, type Position } from "./position";
import type { Character, Edition, EditionText, Language, Role, Series } from "./schema";
import { inEdition } from "./text";

/** What the reader is allowed to see of a character, resolved for one edition and language. */
export type CharacterView = {
  id: string;
  name: string;
  /** Names the character had before the current one, most recent first. */
  previousNames: string[];
  aliases: string[];
  color: { id: string; name: string; hex: string; particle?: string };
  roles: Role[];
  facts: string[];
  death?: string;
  /** Every visible name and alias, in every edition, normalized for search. */
  searchKeys: string[];
};

type Dated<T> = { value: T; since: string };

/** Lowercase, without accents, for tolerant comparisons ("Éo" matches "eo"). */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function allEditions(text: EditionText): string[] {
  return typeof text === "string" ? [text] : Object.values(text);
}

/** Returns null when the character has not been introduced yet at this position. */
export function viewCharacter(
  series: Series,
  character: Character,
  position: Position,
  edition: Edition,
  language: Language,
): CharacterView | null {
  if (!isVisible(series, character.introduced, position)) return null;
  const visible = <T>(entries: Dated<T>[]) => entries.filter((entry) => isVisible(series, entry.since, position));

  const names = visible(character.names);
  const aliases = visible(character.aliases);
  const colorId = visible(character.colors).at(-1)!.value;
  const color = series.colors.find((c) => c.id === colorId)!;
  const death = character.death && isVisible(series, character.death.since, position) ? character.death.value[language] : undefined;

  return {
    id: character.id,
    // The latest revealed name is the one the reader knows best.
    name: inEdition(names.at(-1)!.value, edition),
    previousNames: names.slice(0, -1).reverse().map((n) => inEdition(n.value, edition)),
    aliases: aliases.map((alias) => inEdition(alias.value, edition)),
    color: { id: color.id, name: inEdition(color.name, edition), hex: color.hex, particle: color.particle && inEdition(color.particle, edition) },
    roles: [...new Set(visible(character.roles).map((r) => r.value))],
    facts: visible(character.facts).map((fact) => fact.value[language]),
    death,
    searchKeys: [...names, ...aliases].flatMap((entry) => allEditions(entry.value)).map(normalize),
  };
}

/** Keeps the characters whose visible names or aliases contain the query, in any edition. */
export function search(views: CharacterView[], query: string): CharacterView[] {
  const q = normalize(query);
  if (q === "") return views;
  return views.filter((view) => view.searchKeys.some((key) => key.includes(q)));
}

/** Protagonist first, then narrators, then everyone else by name. */
export function compareViews(locale: string) {
  const rank = (view: CharacterView) => (view.roles.includes("protagonist") ? 0 : view.roles.includes("narrator") ? 1 : 2);
  return (a: CharacterView, b: CharacterView) => rank(a) - rank(b) || a.name.localeCompare(b.name, locale);
}

/** Splits a name so the color particle ("au", "of"…) can be styled on its own. */
export function nameParts(name: string, particle?: string): { text: string; isParticle: boolean }[] {
  if (!particle) return [{ text: name, isParticle: false }];
  return name.split(/(\s+)/).map((text) => ({ text, isParticle: text.toLowerCase() === particle.toLowerCase() }));
}
