import { describe, expect, it } from "vitest";
import { Character, Series } from "../schema";
import { checkCharacter } from "../validate";
import { groupViews, viewCharacter } from "../view";

const series = Series.parse({
  id: "test",
  title: "Test",
  author: "Someone",
  books: [
    { id: "one", title: "One" },
    { id: "two", title: "Two" },
  ],
  colors: [{ id: "red", name: "Red", hex: "#e5534b" }],
  houses: [{ id: "mars", name: "Mars" }],
  allegiances: [{ id: "rebels", name: { en: "Rebels", fr: "Rebelles" } }],
});

const base = (id: string, introduced: string) => ({
  id,
  introduced,
  names: [{ value: id[0].toUpperCase() + id.slice(1), since: introduced }],
  colors: [{ value: "red", since: introduced }],
});

const hero = Character.parse({
  ...base("hero", "one"),
  gender: "m",
  houses: [{ value: "mars", since: "one" }],
  allegiances: [{ value: "rebels", since: "two" }],
  titles: [{ value: { en: "Lancer", fr: "Lancier" }, since: "two" }],
  relations: [
    { value: { type: "spouse", target: "wife" }, since: "one" },
    { value: { type: "sibling", target: "brother" }, since: "two" },
  ],
});
const wife = Character.parse({ ...base("wife", "one"), gender: "f" });
const brother = Character.parse(base("brother", "two"));
const all = [hero, wife, brother];

describe("character details", () => {
  it("shows house, but not yet the allegiance, title or a later relation", () => {
    const view = viewCharacter(series, hero, 0, "en", "fr", all)!;
    expect(view.house).toBe("Mars");
    expect(view.allegiance).toBeUndefined();
    expect(view.title).toBeUndefined();
    expect(view.relations).toEqual([{ type: "spouse", targetId: "wife", targetName: "Wife", targetGender: "f" }]);
    expect(view.introducedIndex).toBe(0);
  });

  it("reveals the rest in the next book, in the reader's edition", () => {
    const view = viewCharacter(series, hero, 1, "fr", "fr", all)!;
    expect(view.allegiance).toBe("Rebelles");
    expect(view.title).toBe("Lancier");
    expect(view.relations.map((r) => r.targetId)).toEqual(["wife", "brother"]);
  });
});

describe("checkCharacter with details", () => {
  it("accepts valid houses, allegiances and relations", () => {
    expect(checkCharacter(series, hero, all)).toEqual([]);
  });

  it("rejects a relation that reveals a character before they are introduced", () => {
    const early = Character.parse({ ...base("early", "one"), relations: [{ value: { type: "sibling", target: "brother" }, since: "one" }] });
    expect(checkCharacter(series, early, [...all, early])).toEqual([expect.stringMatching(/revealed before "brother" is introduced/)]);
  });

  it("rejects unknown houses, allegiances and relation targets", () => {
    const bad = Character.parse({
      ...base("bad", "one"),
      houses: [{ value: "venus", since: "one" }],
      allegiances: [{ value: "pirates", since: "one" }],
      relations: [{ value: { type: "parent", target: "nobody" }, since: "one" }],
    });
    const problems = checkCharacter(series, bad, [bad]);
    expect(problems).toContainEqual(expect.stringMatching(/houses\[0\] "venus"/));
    expect(problems).toContainEqual(expect.stringMatching(/allegiances\[0\] "pirates"/));
    expect(problems).toContainEqual(expect.stringMatching(/unknown character "nobody"/));
  });
});

describe("groupViews", () => {
  const views = all.map((c) => viewCharacter(series, c, 1, "en", "fr", all)!);

  it("keeps a single group when grouping by name", () => {
    expect(groupViews(views, "name", "Other")).toEqual([{ views }]);
  });

  it("groups by house, characters without one last", () => {
    const groups = groupViews(views, "house", "Other");
    expect(groups.map((g) => g.title)).toEqual(["Mars", "Other"]);
    expect(groups[0].views.map((v) => v.id)).toEqual(["hero"]);
  });
});
