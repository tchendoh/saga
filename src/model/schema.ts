import { z } from "zod";

/** Languages available for the interface and for descriptions. */
export const LANGUAGES = ["fr", "en"] as const;
export const Language = z.enum(LANGUAGES);
export type Language = z.infer<typeof Language>;

/** Editions of the books (which translation the reader is reading). */
export const EDITIONS = ["en", "fr"] as const;
export const Edition = z.enum(EDITIONS);
export type Edition = z.infer<typeof Edition>;

/** Description text, required in every interface language. */
export const LocalizedText = z.object({ fr: z.string().min(1), en: z.string().min(1) });
export type LocalizedText = z.infer<typeof LocalizedText>;

/**
 * Text coming from the book itself (names, titles, terms).
 * A plain string when identical in every edition, otherwise one value per edition.
 */
export const EditionText = z.union([
  z.string().min(1),
  z.object({ en: z.string().min(1), fr: z.string().min(1) }),
]);
export type EditionText = z.infer<typeof EditionText>;

const BookId = z.string().regex(/^[a-z]+$/, "book id: lowercase letters only");

export const Book = z.object({
  id: BookId,
  title: EditionText,
});
export type Book = z.infer<typeof Book>;

export const Series = z.object({
  id: z.string(),
  title: EditionText,
  author: z.string(),
  /** In reading order. */
  books: z.array(Book).min(1),
  colors: z.array(
    z.object({
      id: z.string(),
      name: EditionText,
      hex: z.string().regex(/^#[0-9a-f]{6}$/i),
      /** Word that marks this color in names, e.g. "au" for Gold; may differ per edition. */
      particle: EditionText.optional(),
    }),
  ),
  /** Noble or family houses, e.g. Augustus. */
  houses: z.array(z.object({ id: z.string(), name: EditionText })).default([]),
  /** Factions and allegiances, e.g. Sons of Ares. */
  allegiances: z.array(z.object({ id: z.string(), name: EditionText })).default([]),
});
export type Series = z.infer<typeof Series>;

/** The character's role in the storytelling, outside the story itself. */
export const ROLES = ["protagonist", "narrator"] as const;
export const Role = z.enum(ROLES);
export type Role = z.infer<typeof Role>;

/** Family and personal links. The label is chosen from the target's point of view ("Wife: Eo"). */
export const RELATION_TYPES = ["spouse", "parent", "child", "sibling", "mentor", "student"] as const;
export const RelationType = z.enum(RELATION_TYPES);
export type RelationType = z.infer<typeof RelationType>;

/** Only used to pick gendered labels (époux/épouse); optional. */
export const Gender = z.enum(["f", "m"]);
export type Gender = z.infer<typeof Gender>;

/** Wraps a value with the book from which the reader knows it. */
const dated = <T extends z.ZodType>(value: T) => z.object({ value, since: BookId });

export const Character = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** Book where the character first appears. */
  introduced: BookId,
  names: z.array(dated(EditionText)).min(1),
  aliases: z.array(dated(EditionText)).default([]),
  colors: z.array(dated(z.string())).min(1),
  gender: Gender.optional(),
  roles: z.array(dated(Role)).default([]),
  houses: z.array(dated(z.string())).default([]),
  allegiances: z.array(dated(z.string())).default([]),
  /** Rank, function or title as written in the books (e.g. Lancer). */
  titles: z.array(dated(EditionText)).default([]),
  relations: z.array(dated(z.object({ type: RelationType, target: z.string() }))).default([]),
  facts: z.array(dated(LocalizedText)).default([]),
  death: dated(LocalizedText).optional(),
});
export type Character = z.infer<typeof Character>;
