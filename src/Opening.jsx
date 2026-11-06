import React, { useEffect, useState } from "react";
import {
  LiquidSignature,
  LIQUID_SIGNATURE_DURATION_MS,
} from "./sphere/LiquidSignature";
export default function Opening({ onComplete }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leave = setTimeout(
      () => setLeaving(true),
      reduced ? 200 : LIQUID_SIGNATURE_DURATION_MS - 500,
    );
    const done = setTimeout(
      onComplete,
      reduced ? 350 : LIQUID_SIGNATURE_DURATION_MS,
    );
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [onComplete]);
  return (
    <div className={`tap-opening ${leaving ? "is-leaving" : ""}`}>
      <LiquidSignature />
      <span className="opening-caption">SEU RITMO. SUAS ESCOLHAS.</span>
      <button className="opening-skip" onClick={onComplete} autoFocus>
        Pular abertura <span>↗</span>
      </button>
    </div>
  );
}
