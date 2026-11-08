import { describe, expect, it } from "vitest";
import { Character, type Series } from "../schema";
import { compareViews, nameParts, normalize, search, viewCharacter } from "../view";

const series: Series = {
  id: "test",
  title: "Test",
  author: "Someone",
  books: [
    { id: "one", title: "One" },
    { id: "two", title: "Two" },
  ],
  colors: [
    { id: "red", name: { en: "Red", fr: "Rouge" }, hex: "#e5534b", particle: { en: "of", fr: "de" } },
    { id: "gold", name: { en: "Gold", fr: "Or" }, hex: "#d4a72c" },
  ],
};

const hero = Character.parse({
  id: "hero",
  introduced: "one",
  names: [
    { value: "Hero of Town", since: "one" },
    { value: "Hero au Gold", since: "two" },
  ],
  aliases: [{ value: { en: "The Reaper", fr: "le Faucheur" }, since: "two" }],
  colors: [
    { value: "red", since: "one" },
    { value: "gold", since: "two" },
  ],
  roles: [{ value: "protagonist", since: "one" }],
  facts: [{ since: "one", value: { fr: "Un mineur.", en: "A miner." } }],
});

const late = Character.parse({
  id: "late",
  introduced: "two",
  names: [{ value: "Aaron Late", since: "two" }],
  colors: [{ value: "gold", since: "two" }],
  death: undefined,
});

describe("viewCharacter", () => {
  it("hides a character who is not introduced yet", () => {
    expect(viewCharacter(series, late, 0, "en", "fr")).toBeNull();
  });

  it("shows only what is known at the start of the first book", () => {
    const view = viewCharacter(series, hero, 0, "en", "fr")!;
    expect(view.name).toBe("Hero of Town");
    expect(view.aliases).toEqual([]);
    expect(view.color).toEqual({ id: "red", name: "Red", hex: "#e5534b", particle: "of" });
    expect(view.previousNames).toEqual([]);
    expect(view.roles).toEqual(["protagonist"]);
    expect(view.facts).toEqual(["Un mineur."]);
  });

  it("uses the latest name and color, edition terms and interface language", () => {
    const view = viewCharacter(series, hero, 1, "fr", "en")!;
    expect(view.name).toBe("Hero au Gold");
    expect(view.previousNames).toEqual(["Hero of Town"]);
    expect(view.aliases).toEqual(["le Faucheur"]);
    expect(view.color.name).toBe("Or");
    expect(view.facts).toEqual(["A miner."]);
  });
});

describe("search", () => {
  const views = [viewCharacter(series, hero, 1, "en", "fr")!, viewCharacter(series, late, 1, "en", "fr")!];

  it("ignores case and accents", () => {
    expect(normalize("  Éo ")).toBe("eo");
  });
  it("finds a character by an alias from another edition", () => {
    expect(search(views, "faucheur").map((v) => v.id)).toEqual(["hero"]);
  });
  it("returns everyone for an empty query", () => {
    expect(search(views, " ")).toHaveLength(2);
  });
  it("never matches an alias that is not revealed yet", () => {
    const early = [viewCharacter(series, hero, 0, "en", "fr")!];
    expect(search(early, "reaper")).toEqual([]);
  });
});

describe("particle by edition", () => {
  it("uses the particle of the reader's edition", () => {
    expect(viewCharacter(series, hero, 0, "en", "fr")!.color.particle).toBe("of");
    expect(viewCharacter(series, hero, 0, "fr", "fr")!.color.particle).toBe("de");
  });
});

describe("compareViews", () => {
  it("puts the protagonist first, then sorts by name", () => {
    const views = [viewCharacter(series, late, 1, "en", "fr")!, viewCharacter(series, hero, 1, "en", "fr")!];
    expect(views.sort(compareViews("fr")).map((v) => v.id)).toEqual(["hero", "late"]);
  });
});

describe("nameParts", () => {
  it("marks the particle as a separate word", () => {
    expect(nameParts("Darrow au Andromedus", "au").filter((p) => p.isParticle).map((p) => p.text)).toEqual(["au"]);
  });
  it("does not match the particle inside another word", () => {
    expect(nameParts("Augustus of Lykos", "au").some((p) => p.isParticle)).toBe(false);
  });
  it("returns the whole name when the color has no particle", () => {
    expect(nameParts("Ragnar Volarus")).toEqual([{ text: "Ragnar Volarus", isParticle: false }]);
  });
});
