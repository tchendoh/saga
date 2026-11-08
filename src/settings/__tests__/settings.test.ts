import { describe, expect, it } from "vitest";
import { defaultSettings, loadSettings, saveSettings, seriesProgress, STORAGE_KEY, type KeyValueStore } from "../settings";

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
    const settings = { language: "fr" as const, edition: "en" as const, series: { "red-rising": { book: "gs", level: "finished" as const } } };
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
    expect(seriesProgress(defaultSettings(), "red-rising", "rr")).toEqual({ book: "rr", level: "none" });
  });
});
