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
  /** Book label shown in "Introduced in". */
  introducedLabel: string;
  newInBook: boolean;
  highlighted: boolean;
  onGoTo: (id: string) => void;
};

export function CharacterRow(props: Props) {
  const { view, t, favorite, known, isNew, onToggleFavorite, onToggleKnown, onAcknowledge } = props;
  const [showPrevious, setShowPrevious] = useState(false);
  const color = { "--c": view.color.hex } as CSSProperties;

  const name = (
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
  );

  const hasFooterTags = isNew || props.newInBook || view.roles.length > 0 || view.death !== undefined;

  return (
    <SwipeRow
      className="card-swipe"
      style={color}
      actions={[
        { label: known ? t.unmarkKnownShort : t.markKnownShort, icon: "✓", onAction: onToggleKnown, tone: "accent" },
        { label: favorite ? t.unfavorite : t.favorite, icon: favorite ? "☆" : "★", onAction: onToggleFavorite },
      ]}
    >
      <article id={`char-${view.id}`} className={`card${favorite ? " pinned" : ""}${props.highlighted ? " highlight" : ""}`}>
        {/* Header: identity on the left, color always in the top-right corner */}
        <header className="card-head">
          <div className="card-id">
            {name}
            {view.aliases.length > 0 && (
              <div className="aliases">{view.aliases.map((a) => `« ${a} »`).join("  ")}</div>
            )}
          </div>
          <span className="tag caste">{view.color.name}</span>
        </header>

        {(view.facts.length > 0 || view.death) && (
          <div className="card-body">
            {view.facts.map((fact) => (
              <p key={fact} className="desc">
                {fact}
              </p>
            ))}
            {view.death && <p className="desc death">{view.death}</p>}
          </div>
        )}

        {/* Details: fixed fields, each shown only when it has a value */}
        <dl className="card-details">
          {view.title && (
            <div>
              <dt>{t.title}</dt>
              <dd>{view.title}</dd>
            </div>
          )}
          {view.house && (
            <div>
              <dt>{t.house}</dt>
              <dd>{view.house}</dd>
            </div>
          )}
          {view.allegiance && (
            <div>
              <dt>{t.allegiance}</dt>
              <dd>{view.allegiance}</dd>
            </div>
          )}
          {view.relations.map((relation) => (
            <div key={`${relation.type}-${relation.targetId}`}>
              <dt>{t.relation(relation.type, relation.targetGender)}</dt>
              <dd>
                <button className="link" onClick={() => props.onGoTo(relation.targetId)}>
                  {relation.targetName}
                </button>
              </dd>
            </div>
          ))}
          <div>
            <dt>{t.introducedIn}</dt>
            <dd>{props.introducedLabel}</dd>
          </div>
        </dl>

        {/* Footer: status tags, former names and (with a mouse) actions */}
        <footer className="card-foot">
          {hasFooterTags && (
            <span className="tags">
              {props.newInBook && <span className="tag fresh">{t.newInBook}</span>}
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
            </span>
          )}
          {view.previousNames.length > 0 && (
            <span className="previous">
              <button onClick={() => setShowPrevious(!showPrevious)} aria-expanded={showPrevious}>
                {showPrevious ? t.hidePreviousNames : t.previousNames(view.previousNames.length)}
              </button>
              {showPrevious && <span> {view.previousNames.join(", ")}</span>}
            </span>
          )}
          <span className="actions">
            <button className={`act${favorite ? " on" : ""}`} onClick={onToggleFavorite} aria-pressed={favorite} aria-label={favorite ? t.unfavorite : t.favorite} title={favorite ? t.unfavorite : t.favorite}>
              {favorite ? "★" : "☆"}
            </button>
            <button className={`act${known ? " on" : ""}`} onClick={onToggleKnown} aria-pressed={known} aria-label={known ? t.unmarkKnown : t.markKnown} title={known ? t.unmarkKnown : t.markKnown}>
              ✓
            </button>
          </span>
        </footer>
      </article>
    </SwipeRow>
  );
}
