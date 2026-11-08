import { useMemo, useState } from "react";
import { CharacterRow } from "./components/CharacterRow";
import { SettingsPage } from "./components/SettingsPage";
import { STRINGS } from "./i18n";
import { loadAll } from "./model/load";
import { effectivePosition, type SpoilerLevel } from "./model/position";
import { bookNumber, inEdition } from "./model/text";
import { compareViews, search, viewCharacter, type CharacterView } from "./model/view";
import { seriesProgress, type SeriesSettings } from "./settings/settings";
import { useSettings } from "./settings/useSettings";

const [{ series, characters }] = loadAll();
const LEVELS: SpoilerLevel[] = ["none", "finished", "all"];

export default function App() {
  const { settings, setSettings, reset } = useSettings();
  const [page, setPage] = useState<"list" | "settings">("list");
  const [query, setQuery] = useState("");

  const { language, edition } = settings;
  const t = STRINGS[language];
  const { book, level } = seriesProgress(settings, series.id, series.books[0].id);
  const setProgress = (change: Partial<SeriesSettings>) =>
    setSettings({ ...settings, series: { ...settings.series, [series.id]: { book, level, ...change } } });

  const views = useMemo(() => {
    const position = effectivePosition(series, book, level);
    return characters
      .map((character) => viewCharacter(series, character, position, edition, language))
      .filter((view): view is CharacterView => view !== null)
      .sort(compareViews(language));
  }, [book, level, edition, language]);

  if (page === "settings") {
    return (
      <div className="wrap">
        <SettingsPage settings={settings} onChange={setSettings} onReset={reset} onBack={() => setPage("list")} t={t} />
      </div>
    );
  }

  const results = search(views, query);
  const currentTitle = inEdition(series.books.find((b) => b.id === book)!.title, edition);

  return (
    <div className="wrap">
      <header className="top">
        <div className="topline">
          <div className="eyebrow">
            {inEdition(series.title, edition)} · {series.author}
          </div>
          <button className="iconbtn" onClick={() => setPage("settings")} aria-label={t.settings} title={t.settings}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.07 7.07 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54c.05.24.25.42.5.42h3.84c.25 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.56 1.63-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
              />
            </svg>
          </button>
        </div>
        <h1>Saga</h1>
        <p className="sub">{t.tagline(bookNumber(series, book), currentTitle)}</p>
      </header>

      <div className="bar">
        <label className="search">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M10.68 11.74a6 6 0 1 1 1.06-1.06l3.04 3.04a.75.75 0 1 1-1.06 1.06l-3.04-3.04ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z"
            />
          </svg>
          <input
            type="search"
            placeholder={t.searchPlaceholder}
            aria-label={t.searchLabel}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="clear" onClick={() => setQuery("")} aria-label={t.clearSearch}>
              ×
            </button>
          )}
        </label>

        <div className="row2">
          <label className="book">
            <span className="visually-hidden">{t.currentBook}</span>
            <select value={book} onChange={(e) => setProgress({ book: e.target.value })}>
              {series.books.map((b) => (
                <option key={b.id} value={b.id}>
                  {bookNumber(series, b.id)}. {inEdition(b.title, edition)}
                </option>
              ))}
            </select>
          </label>
          <div className="tabs" role="group" aria-label={t.spoilerLevel}>
            {LEVELS.map((value) => (
              <button key={value} aria-pressed={value === level} onClick={() => setProgress({ level: value })}>
                {t.spoilers[value]}
              </button>
            ))}
          </div>
          <span className="count">{results.length}</span>
        </div>
      </div>

      {level === "all" && <p className="banner">{t.allBanner}</p>}

      <main>
        {results.length === 0 ? (
          <p className="empty">{t.noResults}</p>
        ) : (
          results.map((view) => <CharacterRow key={view.id} view={view} t={t} />)
        )}
      </main>
    </div>
  );
}
