import { describe, expect, it } from "vitest";
import { Character, type Series } from "../schema";
import { checkCharacter } from "../validate";

const series: Series = {
  id: "test",
  title: "Test",
  author: "Someone",
  books: [
    { id: "one", title: "One" },
    { id: "two", title: "Two" },
  ],
  colors: [{ id: "red", name: "Red", hex: "#e5534b" }],
  houses: [],
  allegiances: [],
  terms: [{ id: "howlers", name: "Howlers" }],
};

const valid = {
  id: "hero",
  introduced: "one",
  names: [{ value: "Hero", since: "one" }],
  colors: [{ value: "red", since: "one" }],
};

const check = (overrides: object) => checkCharacter(series, Character.parse({ ...valid, ...overrides }));

describe("checkCharacter", () => {
  it("accepts a valid character", () => {
    expect(check({})).toEqual([]);
  });

  it("accepts a fact that uses a known term", () => {
    expect(check({ facts: [{ since: "one", value: { fr: "Un des {term:howlers}.", en: "One of the {term:howlers}." } }] })).toEqual([]);
  });

  it("rejects a fact or death that uses an unknown term", () => {
    const problems = check({
      facts: [{ since: "one", value: { fr: "{term:nope}", en: "x" } }],
      death: { since: "two", value: { fr: "x", en: "{term:gone}" } },
    });
    expect(problems).toEqual([
      expect.stringMatching(/facts\[0\]\.fr uses unknown term "nope"/),
      expect.stringMatching(/death\.en uses unknown term "gone"/),
    ]);
  });

  it("rejects a fact revealed before the character is introduced", () => {
    const problems = check({
      introduced: "two",
      names: [{ value: "Hero", since: "two" }],
      colors: [{ value: "red", since: "two" }],
      facts: [{ since: "one", value: { fr: "x", en: "x" } }],
    });
    expect(problems).toEqual([expect.stringMatching(/facts\[0\] is revealed before/)]);
  });

  it("rejects a death revealed in the book where the character is introduced", () => {
    const problems = check({ death: { since: "one", value: { fr: "x", en: "x" } } });
    expect(problems).toEqual([expect.stringMatching(/death must be revealed after/)]);
  });

  it("accepts a death revealed in a later book", () => {
    expect(check({ death: { since: "two", value: { fr: "x", en: "x" } } })).toEqual([]);
  });

  it("requires a name visible from the introduction", () => {
    const problems = check({ names: [{ value: "Hero", since: "two" }] });
    expect(problems).toEqual([expect.stringMatching(/needs at least one names entry/)]);
  });

  it("rejects an unknown book or color", () => {
    const problems = check({ facts: [{ since: "nine", value: { fr: "x", en: "x" } }], colors: [{ value: "blue", since: "one" }] });
    expect(problems).toContainEqual(expect.stringMatching(/unknown book "nine"/));
    expect(problems).toContainEqual(expect.stringMatching(/"blue" is not a known color/));
  });

  it("rejects a description missing a language (Zod)", () => {
    expect(() => Character.parse({ ...valid, facts: [{ since: "one", value: { fr: "x" } }] })).toThrow();
  });
});
