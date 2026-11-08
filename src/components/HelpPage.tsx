import type { STRINGS } from "../i18n";

type Props = { t: (typeof STRINGS)["fr"]; onBack: () => void };

export function HelpPage({ t, onBack }: Props) {
  return (
    <div className="settings">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack}>
          ‹ {t.back}
        </button>
      </div>
      <h1>{t.help}</h1>
      {t.helpSections.map((section) => (
        <section key={section.title} className="setting">
          <h2>{section.title}</h2>
          <p className="help">{section.body}</p>
        </section>
      ))}
    </div>
  );
}
