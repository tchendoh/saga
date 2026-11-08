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
});
export type Series = z.infer<typeof Series>;

/** The character's role in the storytelling, outside the story itself. */
export const ROLES = ["protagonist", "narrator"] as const;
export const Role = z.enum(ROLES);
export type Role = z.infer<typeof Role>;

/** Wraps a value with the book from which the reader knows it. */
const dated = <T extends z.ZodType>(value: T) => z.object({ value, since: BookId });

export const Character = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** Book where the character first appears. */
  introduced: BookId,
  names: z.array(dated(EditionText)).min(1),
  aliases: z.array(dated(EditionText)).default([]),
  colors: z.array(dated(z.string())).min(1),
  roles: z.array(dated(Role)).default([]),
  facts: z.array(dated(LocalizedText)).default([]),
  death: dated(LocalizedText).optional(),
});
export type Character = z.infer<typeof Character>;
