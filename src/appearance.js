export const palettes = [
  {
    id: "cristal",
    name: "Cristal",
    description: "Neutro, prata e vidro translúcido.",
    page: "#0c0d10",
    panel: "rgba(255,255,255,.045)",
    text: "#f3f3f2",
    muted: "#a6a6ae",
    aura: "#b7beca",
    light: false,
  },
  {
    id: "sereno",
    name: "Sereno",
    description: "Verde mineral e um fundo carvão.",
    page: "#0b1010",
    panel: "rgba(220,255,243,.045)",
    text: "#edf5f0",
    muted: "#a2b2ab",
    aura: "#86cdb5",
    light: false,
  },
  {
    id: "ametista",
    name: "Ametista",
    description: "Lavanda, ameixa e reflexos suaves.",
    page: "#100e15",
    panel: "rgba(242,225,255,.045)",
    text: "#f3eef8",
    muted: "#b1a5bd",
    aura: "#b6a0e0",
    light: false,
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Rosa queimado e pêssego sobre ônix.",
    page: "#140f12",
    panel: "rgba(255,228,230,.045)",
    text: "#faeef0",
    muted: "#bca8af",
    aura: "#df9fae",
    light: false,
  },
  {
    id: "oceano",
    name: "Oceano",
    description: "Petróleo e azul de vidro.",
    page: "#0a1116",
    panel: "rgba(221,246,255,.045)",
    text: "#edf3f9",
    muted: "#9cacb9",
    aura: "#8dbbd6",
    light: false,
  },
  {
    id: "ambar",
    name: "Âmbar",
    description: "Areia, dourado fosco e grafite.",
    page: "#14120e",
    panel: "rgba(255,243,219,.045)",
    text: "#f6f0e5",
    muted: "#b7ae9b",
    aura: "#d6bd88",
    light: false,
  },
  {
    id: "perola",
    name: "Pérola",
    description: "Marfim claro e vidro quente.",
    page: "#eeeae4",
    panel: "rgba(255,255,255,.25)",
    text: "#272523",
    muted: "#6b665f",
    aura: "#ae9c85",
    light: true,
  },
  {
    id: "neve",
    name: "Neve",
    description: "Branco frio, prata e transparência.",
    page: "#edf0f2",
    panel: "rgba(255,255,255,.3)",
    text: "#20252b",
    muted: "#626c76",
    aura: "#8ca1b7",
    light: true,
  },
];
export const paletteFor = (id) =>
  palettes.find((p) => p.id === id) || palettes[0];
export function appearanceFor(data) {
  const palette = paletteFor(data?.appearance?.palette);
  const value = data?.appearance?.auraColor;
  return {
    palette,
    color: /^#[0-9a-f]{6}$/i.test(value || "") ? value : palette.aura,
  };
}
export function colorChannels(hex) {
  return hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((v) => parseInt(v, 16));
}
export function greetingGradient(hex) {
  const [r, g, b] = colorChannels(hex);
  const mix = (amount, target) =>
    `rgb(${[r, g, b].map((v) => Math.round(v + (target - v) * amount)).join(" ")})`;
  return `linear-gradient(105deg,${mix(0.25, 255)} 0%,${hex} 34%,${mix(0.48, 255)} 66%,${hex} 100%)`;
}
export function themeVariables(p) {
  return {
    "--page": p.page,
    "--panel": p.panel,
    "--panel-raised": p.light ? "#ffffffdf" : "#191a1fe8",
    "--text": p.text,
    "--muted": p.muted,
    "--line": p.light ? "rgb(30 35 42 / 12%)" : "rgb(255 255 255 / 11%)",
    "--glass-line": p.light
      ? "rgb(255 255 255 / 82%)"
      : "rgb(255 255 255 / 27%)",
    "--glass": p.light ? "rgb(255 255 255 / 24%)" : "rgb(255 255 255 / 7%)",
    "--accent": p.light ? "#272b30" : "#f0f1f3",
    "--quiet": p.muted,
    "--glass-ink": p.light ? "#313439" : "#edf0f3",
    "--glass-shadow": p.light ? "#48505812" : "#00000020",
    "--surface-milk": p.light ? "#ffffff38" : "#ffffff0a",
  };
}
