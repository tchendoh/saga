import type { SpoilerLevel } from "./model/position";
import type { Edition, Language, Role } from "./model/schema";

const fr = {
  tagline: (book: number, title: string) => `Tome ${book}, ${title} : seulement ce que vous savez déjà.`,
  searchPlaceholder: "Nom, surnom…",
  searchLabel: "Rechercher un personnage",
  clearSearch: "Effacer la recherche",
  currentBook: "Tome en cours",
  spoilerLevel: "Niveau de spoiler",
  spoilers: { none: "Rien", finished: "Tome fini", all: "Tout" } as Record<SpoilerLevel, string>,
  allBanner: "Mode « Tout » : toute la série est dévoilée.",
  noResults: "Aucun personnage ne correspond. Essayez un surnom.",
  roles: { protagonist: "Protagoniste", narrator: "Narrateur" } as Record<Role, string>,
  dead: "Mort",
  previousNames: (n: number) => `Anciens noms (${n})`,
  hidePreviousNames: "Masquer les anciens noms",
  settings: "Réglages",
  back: "Retour",
  language: "Langue de l'application",
  languageHelp: "Menus et descriptions des personnages.",
  edition: "Édition lue",
  editionHelp: "Noms, surnoms, titres et termes de l'univers, tels qu'ils apparaissent dans votre livre.",
  languages: { fr: "Français", en: "English" } as Record<Language, string>,
  editions: { en: "Anglaise (originale)", fr: "Française" } as Record<Edition, string>,
  storageNote: "Vos réglages sont enregistrés seulement dans ce navigateur.",
  reset: "Réinitialiser les réglages",
};

type Strings = typeof fr;

const en: Strings = {
  tagline: (book, title) => `Book ${book}, ${title}: only what you already know.`,
  searchPlaceholder: "Name, nickname…",
  searchLabel: "Search for a character",
  clearSearch: "Clear search",
  currentBook: "Current book",
  spoilerLevel: "Spoiler level",
  spoilers: { none: "None", finished: "Book done", all: "All" },
  allBanner: "“All” mode: the whole series is revealed.",
  noResults: "No matching character. Try a nickname.",
  roles: { protagonist: "Protagonist", narrator: "Narrator" },
  dead: "Dead",
  previousNames: (n) => `Former names (${n})`,
  hidePreviousNames: "Hide former names",
  settings: "Settings",
  back: "Back",
  language: "App language",
  languageHelp: "Menus and character descriptions.",
  edition: "Edition you read",
  editionHelp: "Names, nicknames, titles and world terms, as they appear in your book.",
  languages: { fr: "Français", en: "English" },
  editions: { en: "English (original)", fr: "French" },
  storageNote: "Your settings are stored only in this browser.",
  reset: "Reset settings",
};

export const STRINGS: Record<Language, Strings> = { fr, en };
