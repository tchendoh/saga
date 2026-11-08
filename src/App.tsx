import { useEffect, useMemo, useState } from "react";
import { CharacterRow } from "./components/CharacterRow";
import { HelpPage } from "./components/HelpPage";
import { Hint } from "./components/Hint";
import { SettingsPage } from "./components/SettingsPage";
import { STRINGS } from "./i18n";
import { loadAll } from "./model/load";
import { effectivePosition } from "./model/position";
import { bookNumber, inEdition } from "./model/text";
import { compareViews, groupViews, hasNewInfo, search, viewCharacter, type CharacterView, type GroupBy } from "./model/view";
import { markHintSeen, markKnown, seriesProgress, toggleFavorite, unmarkKnown, type SeriesSettings } from "./settings/settings";
import { useSettings } from "./settings/useSettings";

const [{ series, characters }] = loadAll();
const byId = new Map(characters.map((c) => [c.id, c]));
const bookIndexOf = (id: string) => series.books.findIndex((b) => b.id === id);
const isTouch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;

export default function App() {
  const { settings, setSettings, reset } = useSettings();
  const [page, setPage] = useState<"list" | "settings" | "help">("list");
  const [query, setQuery] = useState("");
  const [hideKnown, setHideKnown] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    if (!highlighted) return;
    const timer = setTimeout(() => setHighlighted(null), 1600);
    return () => clearTimeout(timer);
  }, [highlighted]);

  const goTo = (id: string) => {
    setQuery("");
    setHideKnown(false);
    setHighlighted(id);
    // Wait for the list to re-render without the search filter.
    requestAnimationFrame(() => document.getElementById(`char-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const { language, edition } = settings;
  const t = STRINGS[language];
  const progress = seriesProgress(settings, series.id, series.books[0].id);
  const { book, level, favorites, known } = progress;
  const position = effectivePosition(series, book, level);
  const saveProgress = (next: SeriesSettings) => setSettings({ ...settings, series: { ...settings.series, [series.id]: next } });
  const dismiss = (hint: string) => setSettings(markHintSeen(settings, hint));
  const showHint = (hint: string) => !settings.seenHints.includes(hint);

  const views = useMemo(() => {
    return characters
      .map((character) => viewCharacter(series, character, position, edition, language, characters))
      .filter((view): view is CharacterView => view !== null)
      .sort(compareViews(language));
  }, [position, edition, language]);

  if (page === "help") {
    return (
      <div className="wrap">
        <HelpPage t={t} onBack={() => setPage("settings")} />
      </div>
    );
  }

  if (page === "settings") {
    return (
      <div className="wrap">
        <SettingsPage
          settings={settings}
          onChange={setSettings}
          onReset={reset}
          onBack={() => setPage("list")}
          onHelp={() => setPage("help")}
          level={level}
          onLevel={(value) => saveProgress({ ...progress, level: value })}
          t={t}
        />
      </div>
    );
  }

  const isKnown = (view: CharacterView) => view.id in known;
  const knownCount = views.filter(isKnown).length;
  const results = search(views, query).filter((view) => !(hideKnown && isKnown(view) && !favorites.includes(view.id)));
  const pinned = results.filter((view) => favorites.includes(view.id));
  // Characters the reader already knows go to the end; the sort is stable, so the usual order is kept within each group.
  const others = results
    .filter((view) => !favorites.includes(view.id))
    .sort((a, b) => Number(isKnown(a)) - Number(isKnown(b)));

  const renderRow = (view: CharacterView) => (
    <CharacterRow
      key={view.id}
      view={view}
      t={t}
      favorite={favorites.includes(view.id)}
      known={isKnown(view)}
      isNew={isKnown(view) && hasNewInfo(series, byId.get(view.id)!, known[view.id], position)}
      onToggleFavorite={() => saveProgress(toggleFavorite(progress, view.id))}
      onToggleKnown={() => saveProgress(isKnown(view) ? unmarkKnown(progress, view.id) : markKnown(progress, view.id, position))}
      onAcknowledge={() => saveProgress(markKnown(progress, view.id, position))}
      newInBook={view.introducedIndex === bookIndexOf(book) && view.introducedIndex > 0}
      highlighted={highlighted === view.id}
      onGoTo={goTo}
    />
  );
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
            <select value={book} onChange={(e) => saveProgress({ ...progress, book: e.target.value })}>
              {series.books.map((b) => (
                <option key={b.id} value={b.id}>
                  {bookNumber(series, b.id)}. {inEdition(b.title, edition)}
                </option>
              ))}
            </select>
          </label>
          <label className="book">
            <span className="visually-hidden">{t.groupBy}</span>
            <select value={settings.groupBy} onChange={(e) => setSettings({ ...settings, groupBy: e.target.value as GroupBy })}>
              {(Object.keys(t.groups) as GroupBy[]).map((value) => (
                <option key={value} value={value}>
                  {t.groups[value]}
                </option>
              ))}
            </select>
          </label>
          {knownCount > 0 && (
            <button className="chip" aria-pressed={hideKnown} onClick={() => setHideKnown(!hideKnown)}>
              {hideKnown ? t.showKnown(knownCount) : t.hideKnown}
            </button>
          )}
          <span className="count">{results.length}</span>
        </div>
      </div>

      {level === "all" && <p className="banner">{t.allBanner}</p>}

      <main>
        {showHint("welcome") && <Hint text={t.welcome} dismissLabel={t.gotIt} onDismiss={() => dismiss("welcome")} />}
        {favorites.length > 0 && showHint("favorite") && (
          <Hint text={t.hintFavorite} dismissLabel={t.gotIt} onDismiss={() => dismiss("favorite")} />
        )}
        {isTouch && !showHint("welcome") && showHint("swipe") && (
          <Hint text={t.hintSwipe} dismissLabel={t.gotIt} onDismiss={() => dismiss("swipe")} />
        )}
        {Object.keys(known).length > 0 && showHint("known") && (
          <Hint text={t.hintKnown} dismissLabel={t.gotIt} onDismiss={() => dismiss("known")} />
        )}

        {results.length === 0 && <p className="empty">{t.noResults}</p>}
        {pinned.length > 0 && (
          <section>
            <h2 className="group">{t.pinned}</h2>
            {pinned.map(renderRow)}
          </section>
        )}
        {others.length > 0 &&
          groupViews(others, settings.groupBy, t.otherGroup).map((group, i) => (
            <section key={group.title ?? "all"}>
              {group.title ? (
                <h2 className="group">
                  {group.title} · {group.views.length}
                </h2>
              ) : (
                pinned.length > 0 && i === 0 && <h2 className="group">{t.everyone}</h2>
              )}
              {group.views
                .slice()
                .sort((a, b) => Number(isKnown(a)) - Number(isKnown(b)))
                .map(renderRow)}
            </section>
          ))}
      </main>
    </div>
  );
}
