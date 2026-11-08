import { useState, type CSSProperties } from "react";
import type { STRINGS } from "../i18n";
import { nameParts, type CharacterView } from "../model/view";
import { SwipeRow } from "./SwipeRow";

type Props = {
  view: CharacterView;
  t: (typeof STRINGS)["fr"];
  favorite: boolean;
  known: boolean;
  isNew: boolean;
  onToggleFavorite: () => void;
  onToggleKnown: () => void;
  onAcknowledge: () => void;
};

export function CharacterRow({ view, t, favorite, known, isNew, onToggleFavorite, onToggleKnown, onAcknowledge }: Props) {
  const [showPrevious, setShowPrevious] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const collapsed = known && !expanded;
  const color = { "--c": view.color.hex } as CSSProperties;

  return (
    <SwipeRow
      className={known ? "known" : ""}
      style={color}
      actions={[
        { label: known ? t.unmarkKnownShort : t.markKnownShort, icon: "✓", onAction: onToggleKnown, tone: "accent" },
        { label: favorite ? t.unfavorite : t.favorite, icon: favorite ? "☆" : "★", onAction: onToggleFavorite },
      ]}
    >
    <article className={`row${known ? " known" : ""}`}>
      <div className="line1">
        <h2 className="name">
          <button className="namebtn" onClick={() => known && setExpanded(!expanded)} disabled={!known} aria-expanded={known ? expanded : undefined}>
            {nameParts(view.name, view.color.particle).map((part, i) =>
              part.isParticle ? (
                <span key={i} className="particle">
                  {part.text}
                </span>
              ) : (
                part.text
              ),
            )}
          </button>
        </h2>
        <span className="tags">
          {isNew && (
            <button className="tag new" onClick={onAcknowledge} title={t.acknowledge}>
              {t.newInfo}
            </button>
          )}
          {view.roles.map((role) => (
            <span key={role} className="tag role">
              {t.roles[role]}
            </span>
          ))}
          {view.death && <span className="tag dead">† {t.dead}</span>}
          <span className="tag caste">{view.color.name}</span>
        </span>
        <span className="actions">
          <button className={`act${favorite ? " on" : ""}`} onClick={onToggleFavorite} aria-pressed={favorite} aria-label={favorite ? t.unfavorite : t.favorite} title={favorite ? t.unfavorite : t.favorite}>
            {favorite ? "★" : "☆"}
          </button>
          <button className={`act${known ? " on" : ""}`} onClick={onToggleKnown} aria-pressed={known} aria-label={known ? t.unmarkKnown : t.markKnown} title={known ? t.unmarkKnown : t.markKnown}>
            ✓
          </button>
        </span>
      </div>

      {!collapsed && (
        <>
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
        </>
      )}
    </article>
    </SwipeRow>
  );
}
