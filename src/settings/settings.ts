import { z } from "zod";
import { Edition, Language } from "../model/schema";

const SpoilerLevel = z.enum(["none", "finished", "all"]);

const SeriesSettings = z.object({
  book: z.string(),
  level: SpoilerLevel.default("none"),
  /** Pinned character ids. */
  favorites: z.array(z.string()).default([]),
  /** Characters the reader knows, with the position they had reached when marking them. */
  known: z.record(z.string(), z.number().int().min(0)).default({}),
});
export type SeriesSettings = z.infer<typeof SeriesSettings>;

export const Settings = z.object({
  language: Language,
  edition: Edition,
  /** Reading progress, per series id. */
  series: z.record(z.string(), SeriesSettings).default({}),
  /** How the character list is grouped. */
  groupBy: z.enum(["name", "house", "allegiance"]).default("name"),
  /** One-time hints already shown. */
  seenHints: z.array(z.string()).default([]),
});
export type Settings = z.infer<typeof Settings>;

export const STORAGE_KEY = "saga.settings.v1";

/** Interface language from the browser; the edition follows it by default. */
export function defaultSettings(browserLanguage = "fr"): Settings {
  const language: Language = browserLanguage.toLowerCase().startsWith("en") ? "en" : "fr";
  return { language, edition: language, series: {}, groupBy: "name", seenHints: [] };
}

/** Minimal storage interface, so tests can pass a fake instead of localStorage. */
export type KeyValueStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Never throws: corrupted, outdated or unavailable storage falls back to defaults. */
export function loadSettings(store: KeyValueStore | undefined, browserLanguage?: string): Settings {
  const defaults = defaultSettings(browserLanguage);
  try {
    const raw = store?.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = Settings.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : defaults;
  } catch {
    return defaults;
  }
}

export function saveSettings(store: KeyValueStore | undefined, settings: Settings): void {
  try {
    store?.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Private browsing or full storage: settings simply won't persist.
  }
}

/** Progress for one series; a new reader always starts at the beginning of the first book. */
export function seriesProgress(settings: Settings, seriesId: string, firstBook: string): SeriesSettings {
  return settings.series[seriesId] ?? { book: firstBook, level: "none", favorites: [], known: {} };
}

export function toggleFavorite(progress: SeriesSettings, id: string): SeriesSettings {
  const favorites = progress.favorites.includes(id) ? progress.favorites.filter((f) => f !== id) : [...progress.favorites, id];
  return { ...progress, favorites };
}

/** Marks a character as known at the given position (also used to acknowledge new information). */
export function markKnown(progress: SeriesSettings, id: string, position: number): SeriesSettings {
  return { ...progress, known: { ...progress.known, [id]: position } };
}

export function unmarkKnown(progress: SeriesSettings, id: string): SeriesSettings {
  const { [id]: _removed, ...known } = progress.known;
  return { ...progress, known };
}

export function markHintSeen(settings: Settings, hint: string): Settings {
  return settings.seenHints.includes(hint) ? settings : { ...settings, seenHints: [...settings.seenHints, hint] };
}
