import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

export type SwipeAction = { label: string; icon: string; onAction: () => void; tone?: "accent" | "neutral" };

type Props = {
  /** First action is the primary one, triggered by a full swipe. */
  actions: [SwipeAction, ...SwipeAction[]];
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const ACTION_WIDTH = 76;
const EDGE = 24; // ignore swipes starting at the screen edge (Safari's back gesture)
const AXIS_LOCK = 8; // pixels before deciding between scrolling and swiping

/** Row that reveals actions when swiped to the left (touch only; mouse users use the visible buttons). */
export function SwipeRow({ actions, children, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; base: number; axis?: "x" | "y" } | null>(null);
  const moved = useRef(false);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const openWidth = ACTION_WIDTH * actions.length;

  // Close when touching anywhere else.
  useEffect(() => {
    if (offset === 0 || dragging) return;
    const close = (e: globalThis.PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOffset(0);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [offset, dragging]);

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" || e.clientX < EDGE) return;
    drag.current = { x: e.clientX, y: e.clientY, base: offset };
    moved.current = false;
  };

  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.axis) {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (d.axis === "x") {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDragging(true);
      }
    }
    if (d.axis !== "x") return;
    moved.current = true;
    const width = ref.current?.offsetWidth ?? 320;
    setOffset(Math.min(0, Math.max(-width, d.base + dx)));
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.axis !== "x") return;
    setDragging(false);
    const width = ref.current?.offsetWidth ?? 320;
    if (offset < -width * 0.6) {
      actions[0].onAction();
      setOffset(0);
    } else {
      setOffset(offset < -openWidth / 2 ? -openWidth : 0);
    }
  };

  const run = (action: SwipeAction) => {
    action.onAction();
    setOffset(0);
  };

  const full = ref.current ? offset < -ref.current.offsetWidth * 0.6 : false;

  return (
    <div ref={ref} className={`swipe ${className ?? ""}`} style={style}>
      <div className={`swipe-actions${full ? " full" : ""}`} aria-hidden={offset === 0} style={{ width: Math.max(openWidth, -offset) }}>
        {actions.map((action, i) => (
          <button
            key={action.label}
            className={`swipe-btn ${action.tone ?? "neutral"}`}
            style={full && i > 0 ? { display: "none" } : undefined}
            onClick={() => run(action)}
            tabIndex={offset === 0 ? -1 : 0}
          >
            <span aria-hidden="true">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
      <div
        className="swipe-content"
        style={{ transform: `translateX(${offset}px)`, transition: dragging ? "none" : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          // A swipe must not also count as a tap, and a tap on an open row closes it.
          if (moved.current || offset !== 0) {
            e.stopPropagation();
            e.preventDefault();
            moved.current = false;
            if (!dragging) setOffset(0);
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
