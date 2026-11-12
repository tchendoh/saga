import { bookIndex, isVisible, type Position } from "./position";
import type { Character, Edition, EditionText, Gender, Language, RelationType, Role, Series } from "./schema";
import { inEdition, resolveTerms } from "./text";

/** What the reader is allowed to see of a character, resolved for one edition and language. */
export type CharacterView = {
  id: string;
  name: string;
  /** Names the character had before the current one, most recent first. */
  previousNames: string[];
  aliases: string[];
  color: { id: string; name: string; hex: string; particle?: string };
  roles: Role[];
  house?: string;
  allegiance?: string;
  title?: string;
  relations: { type: RelationType; targetId: string; targetName: string; targetGender?: Gender }[];
  /** Index of the book where the character first appears. */
  introducedIndex: number;
  facts: string[];
  death?: string;
  /** Every visible name and alias, in every edition, normalized for search. */
  searchKeys: string[];
};

type Dated<T> = { value: T; since: string };

/**
 * Rewritten facts accumulate; draft facts are snapshots of the character at each book,
 * so only the latest visible draft is shown.
 */
function visibleFacts<T extends { draft?: boolean }>(facts: T[]): T[] {
  const latestDraft = facts.filter((f) => f.draft).at(-1);
  return facts.filter((f) => !f.draft || f === latestDraft);
}

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
  all: Character[] = [],
): CharacterView | null {
  if (!isVisible(series, character.introduced, position)) return null;
  // Generic over the whole entry, so extra fields (like a fact's `draft`) keep their type.
  const visible = <E extends { since: string }>(entries: E[]) => entries.filter((entry) => isVisible(series, entry.since, position));

  const names = visible(character.names);
  const aliases = visible(character.aliases);
  const colorId = visible(character.colors).at(-1)!.value;
  const color = series.colors.find((c) => c.id === colorId)!;
  const death = character.death && isVisible(series, character.death.since, position) ? resolveTerms(character.death.value[language], series, edition) : undefined;

  const latest = <T>(entries: Dated<T>[]) => visible(entries).at(-1)?.value;
  const nameOf = (id: string, list: { id: string; name: EditionText }[]) => {
    const item = list.find((x) => x.id === id);
    return item && inEdition(item.name, edition);
  };
  const houseId = latest(character.houses);
  const allegianceId = latest(character.allegiances);
  const title = latest(character.titles);

  const relations = visible(character.relations).flatMap(({ value }) => {
    const target = all.find((c) => c.id === value.target);
    if (!target || !isVisible(series, target.introduced, position)) return [];
    const targetNames = target.names.filter((n) => isVisible(series, n.since, position));
    return [{ type: value.type, targetId: target.id, targetName: inEdition(targetNames.at(-1)!.value, edition), targetGender: target.gender }];
  });

  return {
    id: character.id,
    house: houseId && nameOf(houseId, series.houses),
    allegiance: allegianceId && nameOf(allegianceId, series.allegiances),
    title: title && inEdition(title, edition),
    relations,
    introducedIndex: bookIndex(series, character.introduced),
    // The latest revealed name is the one the reader knows best.
    name: inEdition(names.at(-1)!.value, edition),
    previousNames: names.slice(0, -1).reverse().map((n) => inEdition(n.value, edition)),
    aliases: aliases.map((alias) => inEdition(alias.value, edition)),
    color: { id: color.id, name: inEdition(color.name, edition), hex: color.hex, particle: color.particle && inEdition(color.particle, edition) },
    roles: [...new Set(visible(character.roles).map((r) => r.value))],
    facts: visibleFacts(visible(character.facts)).map((fact) => resolveTerms(fact.value[language] ?? fact.value.fr ?? fact.value.en ?? "", series, edition)),
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

/**
 * True when something about the character became visible after the reader marked them as known,
 * i.e. revealed in a book after `knownAt` and up to the current position.
 */
export function hasNewInfo(series: Series, character: Character, knownAt: Position, position: Position): boolean {
  const entries: { since: string }[] = [
    ...character.names,
    ...character.aliases,
    ...character.colors,
    ...character.roles,
    ...character.houses,
    ...character.allegiances,
    ...character.titles,
    ...character.relations,
    ...character.facts,
    ...(character.death ? [character.death] : []),
  ];
  return entries.some((entry) => {
    const index = bookIndex(series, entry.since);
    return index > knownAt && index <= position;
  });
}

export type GroupBy = "name" | "house" | "allegiance";

/** Splits views into titled groups; characters without a value go last, under `otherLabel`. */
export function groupViews(views: CharacterView[], by: GroupBy, otherLabel: string): { title?: string; views: CharacterView[] }[] {
  if (by === "name") return [{ views }];
  const groups = new Map<string, CharacterView[]>();
  for (const view of views) {
    const key = view[by] ?? "";
    groups.set(key, [...(groups.get(key) ?? []), view]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)))
    .map(([key, list]) => ({ title: key || otherLabel, views: list }));
}
