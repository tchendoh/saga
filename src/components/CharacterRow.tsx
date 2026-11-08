import { useState, type CSSProperties } from "react";
import type { STRINGS } from "../i18n";
import { nameParts, type CharacterView } from "../model/view";

type Props = { view: CharacterView; t: (typeof STRINGS)["fr"] };

export function CharacterRow({ view, t }: Props) {
  const [showPrevious, setShowPrevious] = useState(false);
  const color = { "--c": view.color.hex } as CSSProperties;
  return (
    <article className="row" style={color}>
      <div className="line1">
        <h2 className="name">
          {nameParts(view.name, view.color.particle).map((part, i) =>
            part.isParticle ? (
              <span key={i} className="particle">
                {part.text}
              </span>
            ) : (
              part.text
            ),
          )}
        </h2>
        <span className="tags">
          {view.roles.map((role) => (
            <span key={role} className="tag role">
              {t.roles[role]}
            </span>
          ))}
          {view.death && <span className="tag dead">† {t.dead}</span>}
          <span className="tag caste">{view.color.name}</span>
        </span>
      </div>

      {view.aliases.length > 0 && <div className="aliases">{view.aliases.map((a) => `« ${a} »`).join("  ")}</div>}

      {view.facts.map((fact) => (
        <p key={fact} className="desc">
          {fact}
        </p>
      ))}
      {view.death && <p className="desc death">{view.death}</p>}

      {view.previousNames.length > 0 && (
        <div className="previous">
          <button onClick={() => setShowPrevious(!showPrevious)} aria-expanded={showPrevious}>
            {showPrevious ? t.hidePreviousNames : t.previousNames(view.previousNames.length)}
          </button>
          {showPrevious && <span> {view.previousNames.join(", ")}</span>}
        </div>
      )}
    </article>
  );
}
