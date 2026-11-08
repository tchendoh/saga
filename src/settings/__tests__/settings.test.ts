import { describe, expect, it } from "vitest";
import {
  defaultSettings,
  loadSettings,
  markHintSeen,
  markKnown,
  saveSettings,
  seriesProgress,
  STORAGE_KEY,
  toggleFavorite,
  unmarkKnown,
  type KeyValueStore,
} from "../settings";

function fakeStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
}

describe("defaultSettings", () => {
  it("follows an English browser, edition included", () => {
    expect(defaultSettings("en-CA")).toMatchObject({ language: "en", edition: "en" });
  });
  it("falls back to French otherwise", () => {
    expect(defaultSettings("es-ES")).toMatchObject({ language: "fr", edition: "fr" });
  });
});

describe("loadSettings and saveSettings", () => {
  it("round-trips settings", () => {
    const store = fakeStore();
    const settings = {
      language: "fr" as const,
      edition: "en" as const,
      series: { "red-rising": { book: "gs", level: "finished" as const, favorites: ["sevro"], known: { darrow: 1 } } },
      groupBy: "house" as const,
      seenHints: ["welcome"],
    };
    saveSettings(store, settings);
    expect(loadSettings(store)).toEqual(settings);
  });

  it("returns defaults when nothing is stored", () => {
    expect(loadSettings(fakeStore(), "fr-CA")).toEqual(defaultSettings("fr-CA"));
  });

  it("returns defaults for corrupted or invalid data", () => {
    expect(loadSettings(fakeStore({ [STORAGE_KEY]: "{not json" }), "fr")).toEqual(defaultSettings("fr"));
    expect(loadSettings(fakeStore({ [STORAGE_KEY]: '{"language":"klingon"}' }), "fr")).toEqual(defaultSettings("fr"));
  });

  it("survives unavailable storage", () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {},
    };
    expect(loadSettings(broken, "en")).toEqual(defaultSettings("en"));
    expect(() => saveSettings(broken, defaultSettings())).not.toThrow();
  });
});

describe("seriesProgress", () => {
  it("starts a new reader at the first book with no spoilers", () => {
    expect(seriesProgress(defaultSettings(), "red-rising", "rr")).toEqual({ book: "rr", level: "none", favorites: [], known: {} });
  });

  it("reads older saved progress without favorites or known characters", () => {
    const store = fakeStore({
      [STORAGE_KEY]: JSON.stringify({ language: "fr", edition: "en", series: { "red-rising": { book: "gs", level: "none" } } }),
    });
    expect(seriesProgress(loadSettings(store), "red-rising", "rr")).toEqual({ book: "gs", level: "none", favorites: [], known: {} });
  });
});

describe("favorites, known characters and hints", () => {
  const start = seriesProgress(defaultSettings(), "red-rising", "rr");

  it("toggles a favorite on and off", () => {
    const once = toggleFavorite(start, "sevro");
    expect(once.favorites).toEqual(["sevro"]);
    expect(toggleFavorite(once, "sevro").favorites).toEqual([]);
  });

  it("marks, updates and unmarks a known character", () => {
    const known = markKnown(start, "darrow", 0);
    expect(known.known).toEqual({ darrow: 0 });
    expect(markKnown(known, "darrow", 2).known).toEqual({ darrow: 2 });
    expect(unmarkKnown(known, "darrow").known).toEqual({});
  });

  it("records a hint only once", () => {
    const seen = markHintSeen(markHintSeen(defaultSettings(), "welcome"), "welcome");
    expect(seen.seenHints).toEqual(["welcome"]);
  });
});
