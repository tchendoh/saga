import type { STRINGS } from "../i18n";
import type { SpoilerLevel } from "../model/position";
import { EDITIONS, LANGUAGES, type Edition, type Language } from "../model/schema";
import type { Settings } from "../settings/settings";

type Props = {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onReset: () => void;
  onBack: () => void;
  onHelp: () => void;
  level: SpoilerLevel;
  onLevel: (level: SpoilerLevel) => void;
  t: (typeof STRINGS)["fr"];
};

const LEVELS: SpoilerLevel[] = ["none", "finished", "all"];

export function SettingsPage({ settings, onChange, onReset, onBack, onHelp, level, onLevel, t }: Props) {
  return (
    <div className="settings">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack}>
          ‹ {t.back}
        </button>
      </div>
      <h1>{t.settings}</h1>

      <section className="setting">
        <h2>{t.spoilerLevel}</h2>
        <p className="help">{t.spoilerHelp}</p>
        <div className="tabs" role="group" aria-label={t.spoilerLevel}>
          {LEVELS.map((value) => (
            <button key={value} aria-pressed={value === level} onClick={() => onLevel(value)}>
              {t.spoilers[value]}
            </button>
          ))}
        </div>
      </section>

      <section className="setting">
        <h2>{t.language}</h2>
        <p className="help">{t.languageHelp}</p>
        <div className="tabs" role="group" aria-label={t.language}>
          {LANGUAGES.map((language: Language) => (
            <button
              key={language}
              aria-pressed={settings.language === language}
              onClick={() => onChange({ ...settings, language })}
              lang={language}
            >
              {t.languages[language]}
            </button>
          ))}
        </div>
      </section>

      <section className="setting">
        <h2>{t.edition}</h2>
        <p className="help">{t.editionHelp}</p>
        <div className="tabs" role="group" aria-label={t.edition}>
          {EDITIONS.map((edition: Edition) => (
            <button key={edition} aria-pressed={settings.edition === edition} onClick={() => onChange({ ...settings, edition })}>
              {t.editions[edition]}
            </button>
          ))}
        </div>
      </section>

      <section className="setting">
        <button className="linkbtn" onClick={onHelp}>
          {t.help} ›
        </button>
      </section>

      <section className="setting">
        <p className="help">{t.storageNote}</p>
        <button className="reset" onClick={onReset}>
          {t.reset}
        </button>
      </section>
    </div>
  );
}
