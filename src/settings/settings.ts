import { z } from "zod";
import { Edition, Language } from "../model/schema";

const SpoilerLevel = z.enum(["none", "finished", "all"]);

const SeriesSettings = z.object({
  book: z.string(),
  level: SpoilerLevel.default("none"),
});
export type SeriesSettings = z.infer<typeof SeriesSettings>;

export const Settings = z.object({
  language: Language,
  edition: Edition,
  /** Reading progress, per series id. */
  series: z.record(z.string(), SeriesSettings).default({}),
});
export type Settings = z.infer<typeof Settings>;

export const STORAGE_KEY = "saga.settings.v1";

/** Interface language from the browser; the edition follows it by default. */
export function defaultSettings(browserLanguage = "fr"): Settings {
  const language: Language = browserLanguage.toLowerCase().startsWith("en") ? "en" : "fr";
  return { language, edition: language, series: {} };
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
  return settings.series[seriesId] ?? { book: firstBook, level: "none" };
}
