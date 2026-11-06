import React from "react";
import { palettes } from "./appearance";
export const colorChoices = [
  "#b7beca",
  "#86cdb5",
  "#b6a0e0",
  "#df9fae",
  "#8dbbd6",
  "#d6bd88",
  "#e4a98e",
  "#d5d8a0",
];
export function ColorChoices({ value, onChange, label = "Escolher cor" }) {
  return (
    <div className="color-choices" aria-label={label}>
      {colorChoices.map((c) => (
        <button
          type="button"
          key={c}
          aria-label={`Cor ${c}`}
          aria-pressed={value === c}
          style={{ "--swatch": c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}
export function PaletteGallery({ onChoose, current }) {
  return (
    <div className="palette-gallery">
      {palettes.map((p) => (
        <button
          type="button"
          key={p.id}
          className="palette-card"
          aria-pressed={current === p.id}
          onClick={() => onChoose(p)}
          style={{ background: p.page, color: p.text, "--sample": p.aura }}
        >
          <div className="palette-preview">
            <span>sphere. tap</span>
            <i />
            <b>Olá.</b>
            <div className="mini-glass">○　◷　◇　☼</div>
          </div>
          <strong>{p.name}</strong>
          <small>{p.description}</small>
        </button>
      ))}
    </div>
  );
}
