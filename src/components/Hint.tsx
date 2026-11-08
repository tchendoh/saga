type Props = { text: string; dismissLabel: string; onDismiss: () => void };

/** One-time inline hint; once dismissed it is remembered in the settings. */
export function Hint({ text, dismissLabel, onDismiss }: Props) {
  return (
    <div className="hint" role="note">
      <p>{text}</p>
      <button onClick={onDismiss}>{dismissLabel}</button>
    </div>
  );
}
