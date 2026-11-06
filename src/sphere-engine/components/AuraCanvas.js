// Fonte do motor AURA do Sphere UI Kit; integração sem player.
import { jsx } from "react/jsx-runtime";
import { useDevicePerformance } from "./useDevicePerformance";
import { auraDeviceBudget } from "../services/devicePerformance";
import { videoAuraFrame } from "../services/videoAuraFrame";
import { presetPalettes } from "../services/auraPalettes";
import { useEffect, useRef, useState } from "react";
import { AuraAudioResponse } from "../services/auraAudioResponse";
import { AuraPulseLatch, AuraRenderBudget } from "../services/auraPerformance";
import { get333AuraGradientGeometry } from "../services/aura333";
import { blendArtworkPalette, defaultArtworkPalette, paletteFromCover } from "../services/auraArtwork";
import { resolveTrackAuraPreset } from "../services/auraProfiles";
let darkSideBeamCanvas;
const streakFlamePalettes = {
  streak1: ["#ffd17b", "#ff9f2e", "#f77a20", "#d65b17"],
  streak2: ["#fff080", "#ff9e20", "#ff5b1c", "#e92532"],
  streak3: ["#ffd16b", "#ff7b32", "#bf55db", "#6541c4"],
  streak100: ["#ead7ff", "#a970f1", "#7358e9", "#315dc9"],
  streak150: ["#efffff", "#9deeff", "#3bbcf1", "#2d63ef"]
};
function renderStreakHeat(context, width, height, time, palette, bass, intensity, lightTheme) {
  context.save();
  context.globalCompositeOperation = lightTheme ? "source-over" : "screen";
  const glowStrength = Math.min(0.64, (0.36 + bass * 0.12) * intensity);
  const glowCount = 5;
  for (let index = 0; index < glowCount; index += 1) {
    const drift = Math.sin(time * 0.12 + index * 1.4) * width * 0.018;
    const centerX = width * ((index + 0.5) / glowCount) + drift;
    const centerY = height * (0.94 + (index % 3 - 1) * 0.08);
    const radiusX = width * (0.46 - index % 2 * 0.035) * (1 + bass * 0.035);
    const radiusY = height * (0.82 + index % 3 * 0.07);
    context.save();
    context.translate(centerX, centerY);
    context.scale(1, radiusY / radiusX);
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, radiusX);
    glow.addColorStop(0, `${palette[0]}e8`);
    glow.addColorStop(0.2, `${palette[1]}d8`);
    glow.addColorStop(0.48, `${palette[2]}a8`);
    glow.addColorStop(0.76, `${palette[3]}56`);
    glow.addColorStop(1, `${palette[3]}00`);
    context.globalAlpha = glowStrength * (0.78 + index % 3 * 0.08);
    context.fillStyle = glow;
    context.beginPath();
    context.arc(0, 0, radiusX, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
  context.restore();
}
function renderPresetTexture(context, preset, width, height, time, hues, mids, motion, bass, beat) {
  const [h0, h1, h2, h3] = hues;
  const size = Math.min(width, height);
  const drift = (rate, phase = 0) => Math.sin(time * rate + phase) * motion;
  const glow = (x, y, rx, ry, hue, alpha = 0.32, lightness = 58) => {
    context.save();
    context.globalCompositeOperation = "screen";
    context.globalAlpha = alpha;
    context.translate(x, y);
    context.scale(1, ry / rx);
    const gradient = context.createRadialGradient(0, 0, rx * 0.02, 0, 0, rx);
    gradient.addColorStop(0, `hsla(${hue}, 100%, ${lightness}%, 0.72)`);
    gradient.addColorStop(0.34, `hsla(${hue}, 94%, ${lightness - 8}%, 0.4)`);
    gradient.addColorStop(1, `hsla(${hue}, 90%, ${lightness - 14}%, 0)`);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, 0, rx, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };
  const drawWave = (baseY, amp, phase, hue, thickness, alpha) => {
    context.beginPath();
    for (let step = 0; step <= 48; step += 1) {
      const x = step / 48 * width;
      const y = baseY + Math.sin(step / 48 * Math.PI * 2.2 + time * 0.18 + phase) * amp + Math.sin(step / 48 * Math.PI * 4.1 - time * 0.11 + phase * 0.7) * amp * 0.24;
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    const gradient = context.createLinearGradient(0, baseY - amp, width, baseY + amp);
    gradient.addColorStop(0, `hsla(${hue}, 92%, 68%, 0)`);
    gradient.addColorStop(0.3, `hsla(${hue}, 98%, 70%, ${alpha})`);
    gradient.addColorStop(0.7, `hsla(${(hue + 28) % 360}, 96%, 72%, ${alpha * 0.8})`);
    gradient.addColorStop(1, `hsla(${hue}, 92%, 68%, 0)`);
    context.strokeStyle = gradient;
    context.lineWidth = thickness;
    context.lineCap = "round";
    context.shadowColor = `hsla(${hue}, 100%, 68%, ${alpha})`;
    context.shadowBlur = thickness * 1.35;
    context.globalAlpha = 1;
    context.stroke();
  };
  context.save();
  if (preset === "dawn") {
    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.56;
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "rgba(16, 23, 66, 0.52)");
    sky.addColorStop(0.28, "rgba(68, 57, 132, 0.42)");
    sky.addColorStop(0.52, "rgba(159, 83, 151, 0.42)");
    sky.addColorStop(0.69, "rgba(231, 112, 132, 0.48)");
    sky.addColorStop(0.82, "rgba(255, 165, 91, 0.62)");
    sky.addColorStop(0.9, "rgba(255, 218, 135, 0.62)");
    sky.addColorStop(1, "rgba(251, 150, 101, 0.36)");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    glow(width * (0.5 + drift(0.035) * 0.018), height * 0.83, width * 0.42, height * 0.34, 35, 0.34, 78);
  } else if (preset === "dusk") {
    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.58;
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "rgba(11, 19, 56, 0.65)");
    sky.addColorStop(0.34, "rgba(48, 45, 112, 0.5)");
    sky.addColorStop(0.56, "rgba(123, 63, 139, 0.45)");
    sky.addColorStop(0.73, "rgba(204, 91, 128, 0.52)");
    sky.addColorStop(0.86, "rgba(240, 139, 101, 0.55)");
    sky.addColorStop(1, "rgba(42, 42, 94, 0.48)");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    glow(width * (0.68 + drift(0.025) * 0.012), height * 0.82, width * 0.48, height * 0.3, 18, 0.2, 64);
  } else if (preset === "tide") {
    for (let layer = 0; layer < 5; layer += 1) {
      drawWave(
        height * (0.48 + layer * 0.105) + drift(0.08, layer) * height * 0.025,
        height * (0.075 - layer * 6e-3),
        layer * 0.92,
        [h0, h1, h2, h3, h0][layer],
        height * 0.075,
        0.2 + mids * 0.06
      );
    }
    glow(width * 0.35, height * 0.76, width * 0.42, height * 0.48, h1, 0.16, 62);
  } else if (preset === "eclipse") {
    const cx = width * (0.58 + drift(0.025) * 0.018);
    const cy = height * 0.48;
    const eclipsePulse = 1 + Math.sin(time * 1.55) * 0.025 * motion + bass * 0.08 + beat * 0.2;
    glow(cx, cy, Math.min(width, height) * 0.48 * eclipsePulse, Math.min(width, height) * 0.44 * eclipsePulse, h2, 0.3 + beat * 0.18, 62);
    glow(cx, cy, Math.min(width, height) * 0.32 * eclipsePulse, Math.min(width, height) * 0.3 * eclipsePulse, h0, 0.24 + bass * 0.08 + beat * 0.12, 76);
    const radius = Math.min(width, height) * 0.18 * eclipsePulse;
    context.save();
    context.globalCompositeOperation = "screen";
    context.beginPath();
    context.arc(cx, cy, radius * (1.08 + beat * 0.12), 0, Math.PI * 2);
    context.strokeStyle = `hsla(${h2}, 100%, ${66 + beat * 18}%, ${0.46 + beat * 0.38})`;
    context.lineWidth = Math.max(1, size * (4e-3 + beat * 8e-3));
    context.shadowColor = `hsla(${h2}, 100%, 64%, ${0.42 + beat * 0.5})`;
    context.shadowBlur = size * (0.025 + beat * 0.045);
    context.stroke();
    context.restore();
    const shadow = context.createRadialGradient(cx - radius * 0.18, cy - radius * 0.2, radius * 0.05, cx, cy, radius);
    shadow.addColorStop(0, "rgba(2, 3, 12, 0.98)");
    shadow.addColorStop(0.72, "rgba(4, 6, 20, 0.96)");
    shadow.addColorStop(0.92, `hsla(${h1}, 62%, 10%, 0.88)`);
    shadow.addColorStop(1, `hsla(${h2}, 76%, 30%, 0)`);
    context.globalCompositeOperation = "source-over";
    context.fillStyle = shadow;
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.fill();
  } else if (preset === "frequency") {
    for (let band = 0; band < 8; band += 1) {
      drawWave(
        height * (0.22 + band * 0.085),
        height * (0.018 + mids * 0.012),
        band * 0.9 + time * 0.12,
        [h0, h1, h2, h3][band % 4],
        height * (0.012 + band % 3 * 4e-3),
        0.21
      );
    }
    glow(width * 0.5, height * 0.55, width * 0.48, height * 0.26, h1, 0.12, 66);
  }
  context.restore();
}
function renderDarkSideAura(context, width, height, motion, bass, mids, beat, resolutionScale = 1) {
  const size = Math.min(width, height);
  const prismX = width * 0.49;
  const prismY = height * 0.5;
  const prismSize = size * 0.2;
  const left = prismX - prismSize * 0.44;
  const tip = prismX + prismSize * 0.52;
  const top = prismY - prismSize * 0.62;
  const bottom = prismY + prismSize * 0.62;
  const rayPulse = 1;
  const tonalMid = Math.max(0, Math.min(1, (mids - 0.12) / 0.72));
  const lowSupport = Math.max(0, Math.min(1, bass));
  const spectralPresence = Math.min(1, tonalMid * 0.82 + lowSupport * 0.18);
  const beatOnlyDamping = Math.min(0.72, beat * 0.95) * (1 - tonalMid);
  const beamPresence = Math.max(0, spectralPresence - beatOnlyDamping);
  context.save();
  context.globalCompositeOperation = "screen";
  const sourceLight = Math.min(1, 0.28 + beamPresence * 0.58 + beat * 0.22);
  const incoming = context.createLinearGradient(0, prismY, left, prismY);
  incoming.addColorStop(0, "rgba(255, 255, 255, 0)");
  incoming.addColorStop(0.72, `rgba(224, 232, 255, ${0.14 + sourceLight * 0.3})`);
  incoming.addColorStop(1, `rgba(255, 255, 255, ${0.28 + sourceLight * 0.58})`);
  context.strokeStyle = incoming;
  context.lineWidth = Math.max(1, size * (28e-4 + sourceLight * 18e-4));
  context.shadowColor = `rgba(228, 237, 255, ${0.25 + sourceLight * 0.65})`;
  context.shadowBlur = size * (0.014 + sourceLight * 0.032);
  context.beginPath();
  context.moveTo(0, prismY);
  context.lineTo(left, prismY);
  context.stroke();
  const spread = height * (0.035 + 0.165 * beamPresence);
  const beamCanvas = darkSideBeamCanvas ?? document.createElement("canvas");
  darkSideBeamCanvas = beamCanvas;
  const beamScale = Math.min(0.5, resolutionScale);
  const beamWidth = Math.max(1, Math.ceil(width * beamScale));
  const beamHeight = Math.max(1, Math.ceil(height * beamScale));
  if (beamCanvas.width !== beamWidth || beamCanvas.height !== beamHeight) {
    beamCanvas.width = beamWidth;
    beamCanvas.height = beamHeight;
  }
  const beamContext = beamCanvas.getContext("2d");
  if (beamContext) {
    beamContext.clearRect(0, 0, beamWidth, beamHeight);
    beamContext.save();
    beamContext.beginPath();
    beamContext.moveTo(tip * beamScale, prismY * beamScale);
    beamContext.lineTo(width * beamScale, (prismY - spread) * beamScale);
    beamContext.lineTo(width * beamScale, (prismY + spread) * beamScale);
    beamContext.closePath();
    beamContext.clip();
    const bandPulse = Math.min(0.075, beat * 0.12 * motion);
    const spectrum = beamContext.createLinearGradient(tip * beamScale, (prismY - spread) * beamScale, tip * beamScale, (prismY + spread) * beamScale);
    spectrum.addColorStop(0, "rgba(255, 42, 65, 0.08)");
    spectrum.addColorStop(0.12 - bandPulse, "rgba(255, 40, 48, 0.82)");
    spectrum.addColorStop(0.25 - bandPulse * 0.66, "rgba(255, 118, 38, 0.88)");
    spectrum.addColorStop(0.38 - bandPulse * 0.33, "rgba(255, 226, 38, 0.92)");
    spectrum.addColorStop(0.51, "rgba(40, 231, 115, 0.94)");
    spectrum.addColorStop(0.64 + bandPulse * 0.33, "rgba(0, 207, 236, 0.9)");
    spectrum.addColorStop(0.77 + bandPulse * 0.66, "rgba(45, 101, 255, 0.86)");
    spectrum.addColorStop(0.9 + bandPulse, "rgba(150, 59, 255, 0.8)");
    spectrum.addColorStop(1, "rgba(217, 54, 240, 0.08)");
    beamContext.fillStyle = spectrum;
    beamContext.fillRect(tip * beamScale, (prismY - spread) * beamScale, (width - tip) * beamScale, spread * 2 * beamScale);
    beamContext.globalCompositeOperation = "destination-in";
    const horizontalFade = beamContext.createLinearGradient(tip * beamScale, 0, width * beamScale, 0);
    horizontalFade.addColorStop(0, "rgba(255,255,255,0.94)");
    horizontalFade.addColorStop(0.18, "rgba(255,255,255,0.88)");
    horizontalFade.addColorStop(0.62, "rgba(255,255,255,0.72)");
    horizontalFade.addColorStop(1, "rgba(255,255,255,0.38)");
    beamContext.fillStyle = horizontalFade;
    beamContext.fillRect(tip * beamScale, 0, (width - tip) * beamScale, beamHeight);
    const edgeFade = beamContext.createLinearGradient(0, (prismY - spread) * beamScale, 0, (prismY + spread) * beamScale);
    edgeFade.addColorStop(0, "rgba(255,255,255,0)");
    edgeFade.addColorStop(0.15, "rgba(255,255,255,0.68)");
    edgeFade.addColorStop(0.5, "rgba(255,255,255,0.95)");
    edgeFade.addColorStop(0.85, "rgba(255,255,255,0.68)");
    edgeFade.addColorStop(1, "rgba(255,255,255,0)");
    beamContext.fillStyle = edgeFade;
    beamContext.fillRect(tip * beamScale, (prismY - spread) * beamScale, (width - tip) * beamScale, spread * 2 * beamScale);
    beamContext.restore();
    context.save();
    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.94;
    context.shadowColor = "rgba(101, 170, 238, 0.36)";
    context.shadowBlur = size * 0.045;
    context.drawImage(beamCanvas, 0, 0, width, height);
    context.restore();
  }
  const glass = context.createLinearGradient(left, top, tip, bottom);
  glass.addColorStop(0, `rgba(217, 227, 255, ${0.14 * rayPulse})`);
  glass.addColorStop(0.52, `rgba(62, 83, 129, ${0.08 * rayPulse})`);
  glass.addColorStop(1, `rgba(255, 255, 255, ${0.2 * rayPulse})`);
  context.globalCompositeOperation = "screen";
  context.shadowColor = "rgba(230, 239, 255, 0.62)";
  context.shadowBlur = size * 0.025;
  context.beginPath();
  context.moveTo(left, top);
  context.lineTo(left, bottom);
  context.lineTo(tip, prismY);
  context.closePath();
  context.fillStyle = glass;
  context.fill();
  context.strokeStyle = "rgba(236, 242, 255, 0.42)";
  context.lineWidth = Math.max(1, size * 25e-4);
  context.stroke();
  context.restore();
}
const brazilStars = [
  [0.5, 0.22],
  [0.37, 0.29],
  [0.61, 0.28],
  [0.27, 0.4],
  [0.46, 0.37],
  [0.7, 0.38],
  [0.33, 0.5],
  [0.55, 0.48],
  [0.78, 0.49],
  [0.42, 0.58],
  [0.63, 0.59],
  [0.22, 0.64],
  [0.49, 0.68],
  [0.74, 0.65],
  [0.34, 0.75],
  [0.58, 0.78],
  [0.85, 0.7],
  [0.14, 0.48],
  [0.19, 0.8],
  [0.29, 0.87],
  [0.44, 0.88],
  [0.68, 0.86],
  [0.81, 0.82],
  [0.9, 0.57],
  [0.12, 0.3],
  [0.53, 0.11],
  [0.76, 0.27]
];
function renderBrazilAura(context, width, height, time, motion) {
  const driftX = Math.sin(time * 0.055) * width * 8e-3 * motion;
  const driftY = Math.cos(time * 0.045) * height * 6e-3 * motion;
  context.save();
  context.globalCompositeOperation = "screen";
  context.fillStyle = "rgba(255, 255, 255, 0.92)";
  context.shadowColor = "rgba(221, 246, 255, 0.85)";
  context.shadowBlur = Math.min(width, height) * 0.012;
  for (const [starX, starY] of brazilStars) {
    const x = width * (0.2 + starX * 0.6) + driftX;
    const y = height * (0.12 + starY * 0.76) + driftY;
    const starSize = Math.max(1.5, Math.min(width, height) * 6e-3);
    context.beginPath();
    for (let point = 0; point < 10; point += 1) {
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const r = starSize * (point % 2 === 0 ? 1 : 0.46);
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (point === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.closePath();
    context.fill();
  }
  context.restore();
}
function renderAuroraBorealis(context, width, height, time, motion, mids) {
  const strength = Math.min(0.58, 0.34 + mids * 0.14);
  const sway = Math.sin(time * 0.075) * width * 0.018 * motion;
  const lift = Math.sin(time * 0.055 + 1.2) * height * 0.018 * motion;
  const top = height * 0.055;
  const bottom = height * (0.54 + lift / height);
  context.save();
  context.globalCompositeOperation = "screen";
  context.globalAlpha = strength;
  context.beginPath();
  context.moveTo(-width * 0.04, top + height * 0.08);
  context.bezierCurveTo(width * 0.22 + sway, top - height * 0.04, width * 0.4 - sway * 0.3, top + height * 0.11, width * 0.58 + sway, top + height * 0.015);
  context.bezierCurveTo(width * 0.78 + sway * 0.2, top - height * 0.08, width * 0.91 - sway, top + height * 0.06, width * 1.04, top + height * 0.01);
  context.lineTo(width * 1.04, bottom - height * 0.08);
  context.bezierCurveTo(width * 0.83 - sway, bottom + height * 0.13, width * 0.62 + sway, bottom - height * 0.02, width * 0.43 - sway * 0.4, bottom + height * 0.12);
  context.bezierCurveTo(width * 0.24 + sway, bottom + height * 0.2, width * 0.1 - sway, bottom - height * 0.025, -width * 0.04, bottom + height * 0.035);
  context.closePath();
  const curtain = context.createLinearGradient(0, top, 0, bottom + height * 0.16);
  curtain.addColorStop(0, "rgba(91, 255, 174, 0.08)");
  curtain.addColorStop(0.28, "rgba(52, 241, 164, 0.66)");
  curtain.addColorStop(0.58, "rgba(45, 218, 215, 0.54)");
  curtain.addColorStop(0.82, "rgba(98, 161, 255, 0.34)");
  curtain.addColorStop(1, "rgba(160, 111, 255, 0)");
  context.fillStyle = curtain;
  context.shadowColor = "rgba(74, 255, 191, 0.38)";
  context.shadowBlur = Math.min(width, height) * 0.085;
  context.fill();
  context.restore();
}
function renderOceanAura(context, width, height, time, motion, bass, mids) {
  const horizon = height * 0.53;
  const sea = context.createLinearGradient(0, horizon, 0, height);
  sea.addColorStop(0, "rgba(29, 194, 207, 0.27)");
  sea.addColorStop(0.32, "rgba(12, 111, 175, 0.23)");
  sea.addColorStop(0.72, "rgba(14, 62, 132, 0.2)");
  sea.addColorStop(1, "rgba(14, 28, 79, 0)");
  context.save();
  context.globalCompositeOperation = "screen";
  context.fillStyle = sea;
  context.fillRect(0, horizon, width, height - horizon);
  const horizonGlow = context.createLinearGradient(0, horizon - height * 0.035, 0, horizon + height * 0.045);
  horizonGlow.addColorStop(0, "rgba(91, 232, 232, 0)");
  horizonGlow.addColorStop(0.5, "rgba(91, 232, 232, 0.2)");
  horizonGlow.addColorStop(1, "rgba(91, 232, 232, 0)");
  context.fillStyle = horizonGlow;
  context.fillRect(0, horizon - height * 0.035, width, height * 0.08);
  const waveLift = Math.min(height * 0.035, height * (bass * 0.018 + mids * 0.012));
  for (let row = 0; row < 4; row += 1) {
    const baseY = horizon + height * (0.09 + row * 0.105);
    const phase = time * (0.18 + row * 0.035) * (0.25 + motion * 0.75) + row * 1.7;
    context.beginPath();
    for (let step = 0; step <= 48; step += 1) {
      const x = step / 48 * width;
      const envelope = 0.35 + Math.sin(step / 48 * Math.PI) * 0.65;
      const y = baseY + Math.sin(step * 0.19 + phase) * (height * 6e-3 + waveLift) * envelope;
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    const crest = context.createLinearGradient(0, baseY, width, baseY);
    crest.addColorStop(0, "rgba(83, 231, 227, 0)");
    crest.addColorStop(0.35, `rgba(100, 235, 233, ${0.11 - row * 0.018})`);
    crest.addColorStop(0.68, `rgba(96, 180, 244, ${0.1 - row * 0.016})`);
    crest.addColorStop(1, "rgba(96, 180, 244, 0)");
    context.strokeStyle = crest;
    context.lineWidth = Math.max(1, height * 2e-3);
    context.shadowColor = "rgba(70, 215, 232, 0.18)";
    context.shadowBlur = height * 0.012;
    context.stroke();
  }
  context.restore();
}
function renderDawnAura(context, width, height, time, motion, bass) {
  const size = Math.min(width, height);
  const horizon = height * 0.7;
  const drift = Math.sin(time * 0.07) * width * 0.012 * motion;
  const sunX = width * 0.5 + drift;
  const breath = 1 + Math.min(0.06, bass * 0.035);
  const sunRadius = size * 0.19 * breath;
  const sunriseProgress = 0.5 + Math.sin(time * 0.075) * 0.5;
  const visibleSun = size * (0.12 + sunriseProgress * 0.085 * motion);
  const sunY = horizon + sunRadius - visibleSun;
  context.save();
  context.globalCompositeOperation = "screen";
  const skyGlow = context.createLinearGradient(0, horizon - height * 0.48, 0, horizon + height * 0.18);
  skyGlow.addColorStop(0, "rgba(92, 89, 194, 0)");
  skyGlow.addColorStop(0.48, "rgba(221, 113, 175, 0.14)");
  skyGlow.addColorStop(0.78, "rgba(255, 153, 104, 0.22)");
  skyGlow.addColorStop(1, "rgba(255, 222, 153, 0)");
  context.fillStyle = skyGlow;
  context.fillRect(0, horizon - height * 0.48, width, height * 0.66);
  const haloRadius = sunRadius * 2.5;
  const halo = context.createRadialGradient(sunX, horizon, sunRadius * 0.2, sunX, horizon, haloRadius);
  halo.addColorStop(0, "rgba(255, 211, 139, 0.32)");
  halo.addColorStop(0.42, "rgba(255, 146, 121, 0.16)");
  halo.addColorStop(1, "rgba(255, 126, 104, 0)");
  context.fillStyle = halo;
  context.fillRect(sunX - haloRadius, horizon - haloRadius, haloRadius * 2, haloRadius * 2);
  context.save();
  context.beginPath();
  context.rect(0, 0, width, horizon);
  context.clip();
  const sun = context.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
  sun.addColorStop(0, "rgba(255, 248, 211, 0.96)");
  sun.addColorStop(0.52, "rgba(255, 194, 112, 0.94)");
  sun.addColorStop(1, "rgba(255, 126, 104, 0.88)");
  context.fillStyle = sun;
  context.shadowColor = "rgba(255, 178, 113, 0.72)";
  context.shadowBlur = size * (0.035 + bass * 0.012);
  context.beginPath();
  context.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  context.fill();
  context.restore();
  const horizonLine = context.createLinearGradient(0, 0, width, 0);
  horizonLine.addColorStop(0, "rgba(255, 177, 133, 0)");
  horizonLine.addColorStop(0.5, `rgba(255, 207, 155, ${0.24 + bass * 0.1})`);
  horizonLine.addColorStop(1, "rgba(255, 177, 133, 0)");
  context.fillStyle = horizonLine;
  context.fillRect(0, horizon - Math.max(1, size * 2e-3), width, Math.max(2, size * 4e-3));
  context.restore();
}
function renderDuskAura(context, width, height, time, motion, bass) {
  const size = Math.min(width, height);
  const horizon = height * 0.68;
  const drift = Math.sin(time * 0.055) * width * 9e-3 * motion;
  const sunX = width * 0.57 + drift;
  const breath = 1 + Math.min(0.05, bass * 0.025);
  const sunRadius = size * 0.17 * breath;
  const descent = 0.5 + Math.sin(time * 0.055 + 0.8) * 0.5;
  const visibleSun = sunRadius * (0.82 - descent * 0.42 * motion);
  const sunY = horizon + sunRadius - visibleSun;
  context.save();
  context.globalCompositeOperation = "screen";
  const twilight = context.createLinearGradient(0, height * 0.16, 0, horizon + height * 0.24);
  twilight.addColorStop(0, "rgba(59, 67, 155, 0)");
  twilight.addColorStop(0.45, "rgba(122, 89, 194, 0.12)");
  twilight.addColorStop(0.72, "rgba(207, 105, 161, 0.19)");
  twilight.addColorStop(1, "rgba(255, 151, 104, 0)");
  context.fillStyle = twilight;
  context.fillRect(0, height * 0.16, width, horizon - height * 0.16 + height * 0.24);
  const haloRadius = sunRadius * 2.2;
  const halo = context.createRadialGradient(sunX, horizon, sunRadius * 0.16, sunX, horizon, haloRadius);
  halo.addColorStop(0, "rgba(255, 165, 123, 0.28)");
  halo.addColorStop(0.46, "rgba(222, 98, 154, 0.16)");
  halo.addColorStop(1, "rgba(131, 67, 183, 0)");
  context.fillStyle = halo;
  context.fillRect(sunX - haloRadius, horizon - haloRadius, haloRadius * 2, haloRadius * 2);
  context.save();
  context.beginPath();
  context.rect(0, 0, width, horizon);
  context.clip();
  const sun = context.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
  sun.addColorStop(0, "rgba(255, 223, 177, 0.94)");
  sun.addColorStop(0.48, "rgba(255, 151, 117, 0.92)");
  sun.addColorStop(1, "rgba(217, 91, 154, 0.86)");
  context.fillStyle = sun;
  context.shadowColor = "rgba(252, 128, 125, 0.58)";
  context.shadowBlur = size * (0.03 + bass * 0.01);
  context.beginPath();
  context.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  context.fill();
  context.restore();
  const horizonLine = context.createLinearGradient(0, 0, width, 0);
  horizonLine.addColorStop(0, "rgba(247, 142, 153, 0)");
  horizonLine.addColorStop(0.58, `rgba(255, 180, 150, ${0.18 + bass * 0.08})`);
  horizonLine.addColorStop(1, "rgba(247, 142, 153, 0)");
  context.fillStyle = horizonLine;
  context.fillRect(0, horizon - Math.max(1, size * 2e-3), width, Math.max(2, size * 4e-3));
  context.restore();
}
function render333Aura(context, width, height, time, motion, bass, mids, beat) {
  const size = Math.min(width, height);
  const pulse = 1 + bass * 0.018 + beat * 0.025;
  const radius = size * 0.16 * pulse;
  const cx = width * 0.5 + Math.sin(time * 0.2) * size * 0.012 * motion;
  const cy = height * 0.46 + Math.sin(time * 0.27 + 0.8) * size * 0.012 * motion;
  const flowMotion = Math.max(0.42, motion);
  const flowX = Math.sin(time * 0.31) * radius * 0.34 * flowMotion + Math.sin(time * 0.7) * radius * 0.035 * bass;
  const flowY = Math.cos(time * 0.23 + 0.8) * radius * 0.28 * flowMotion + Math.cos(time * 0.55) * radius * 0.03 * mids;
  context.save();
  const gradient = get333AuraGradientGeometry(cx, cy, radius, flowX, flowY);
  const sphere = context.createRadialGradient(gradient.focalX, gradient.focalY, gradient.innerRadius, gradient.centerX, gradient.centerY, gradient.outerRadius);
  sphere.addColorStop(0, "rgba(250, 255, 255, 0.96)");
  sphere.addColorStop(0.2, "rgba(177, 255, 237, 0.94)");
  sphere.addColorStop(0.43, "rgba(103, 219, 245, 0.9)");
  sphere.addColorStop(0.65, "rgba(112, 204, 255, 0.86)");
  sphere.addColorStop(0.82, "rgba(112, 222, 255, 0.82)");
  sphere.addColorStop(0.96, "rgba(165, 241, 255, 0.76)");
  sphere.addColorStop(1, "rgba(173, 239, 255, 0.72)");
  context.fillStyle = sphere;
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = `rgba(239, 255, 255, ${0.46 + mids * 0.04})`;
  context.lineWidth = Math.max(1, size * 15e-4);
  context.beginPath();
  context.arc(cx, cy, radius * 0.99, 0, Math.PI * 2);
  context.stroke();
  const cycle = 2.2;
  const particleCount = 3;
  const fontSize = Math.max(7, size * 0.014);
  context.font = `600 ${fontSize}px sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const digits = context.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  digits.addColorStop(0, "rgba(171, 255, 231, 0.62)");
  digits.addColorStop(0.5, "rgba(103, 220, 255, 0.62)");
  digits.addColorStop(1, "rgba(171, 244, 255, 0.62)");
  context.fillStyle = digits;
  for (let index = 0; index < particleCount; index += 1) {
    const phase = ((time / cycle + index / particleCount) % 1 + 1) % 1;
    const angle = index * 2.399 + Math.sin(time * 0.16 + index) * 0.08 * motion;
    const distance = radius * 0.94 + phase * size * 0.11;
    const x = cx + Math.cos(angle) * distance;
    const y = cy + Math.sin(angle) * distance - phase * size * 0.018;
    const fade = Math.sin(phase * Math.PI);
    const alpha = Math.max(0, Math.min(0.56, fade * (0.38 + beat * 0.08)));
    if (alpha < 0.025) continue;
    context.globalAlpha = alpha;
    context.fillText("333", x, y);
  }
  context.globalAlpha = 1;
  context.restore();
}
function renderIceAura(context, width, height, time, motion, treble, beat) {
  const size = Math.min(width, height);
  const flakes = [
    { x: 0.27, y: 0.36, scale: 0.72, phase: 0.2 },
    { x: 0.72, y: 0.41, scale: 0.94, phase: 1.8 },
    { x: 0.57, y: 0.7, scale: 0.62, phase: 3.4 },
    { x: 0.16, y: 0.66, scale: 0.46, phase: 4.7 }
  ];
  const alpha = Math.min(0.72, 0.3 + treble * 0.18 + beat * 0.22);
  context.save();
  context.globalCompositeOperation = "screen";
  for (const flake of flakes) {
    const drift = Math.sin(time * 0.11 + flake.phase) * size * 0.012 * motion;
    const x = width * flake.x + drift;
    const y = height * flake.y + Math.cos(time * 0.09 + flake.phase) * size * 0.01 * motion;
    const radius = size * 0.052 * flake.scale * (1 + beat * 0.16);
    const rotation = time * 0.035 * motion + flake.phase;
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.strokeStyle = `rgba(218, 246, 255, ${alpha})`;
    context.fillStyle = `rgba(249, 254, 255, ${alpha * 0.78})`;
    context.lineWidth = Math.max(1, size * 22e-4);
    context.lineCap = "round";
    context.shadowColor = `rgba(109, 207, 255, ${alpha})`;
    context.shadowBlur = radius * (0.9 + beat * 0.5);
    for (let arm = 0; arm < 6; arm += 1) {
      const angle = arm * Math.PI / 3;
      const endX = Math.cos(angle) * radius;
      const endY = Math.sin(angle) * radius;
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(endX, endY);
      context.stroke();
      const branchStart = radius * 0.58;
      const branchLength = radius * 0.28;
      for (const side of [-1, 1]) {
        const branchAngle = angle + side * 0.72;
        context.beginPath();
        context.moveTo(Math.cos(angle) * branchStart, Math.sin(angle) * branchStart);
        context.lineTo(Math.cos(angle) * branchStart + Math.cos(branchAngle) * branchLength, Math.sin(angle) * branchStart + Math.sin(branchAngle) * branchLength);
        context.stroke();
      }
    }
    context.beginPath();
    context.arc(0, 0, Math.max(1.3, radius * 0.075), 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
  context.restore();
}
function renderGemstoneAura(context, width, height, time, motion, bass, beat, preset) {
  const gems = {
    violet: { glow: "192, 114, 255", light: "220, 183, 255", mid: "142, 74, 218", deep: "62, 22, 118", facets: ["237, 208, 255", "119, 54, 190", "173, 112, 231", "103, 48, 176"], edge: "232, 204, 255" },
    ruby: { glow: "255, 57, 103", light: "255, 184, 195", mid: "196, 24, 69", deep: "84, 7, 35", facets: ["255, 222, 226", "160, 12, 52", "235, 76, 111", "118, 12, 49"], edge: "255, 199, 211" },
    emerald: { glow: "62, 237, 162", light: "190, 255, 222", mid: "38, 174, 117", deep: "8, 76, 58", facets: ["215, 255, 233", "15, 121, 82", "93, 218, 157", "18, 99, 82"], edge: "184, 255, 218" },
    sapphire: { glow: "76, 151, 255", light: "196, 224, 255", mid: "44, 106, 211", deep: "14, 38, 105", facets: ["220, 239, 255", "27, 67, 155", "100, 166, 248", "20, 58, 136"], edge: "191, 222, 255" }
  }[preset];
  const size = Math.min(width, height);
  const cx = width * 0.5;
  const cy = height * 0.53;
  const scale = 1 + Math.min(0.035, bass * 0.018 + beat * 0.025);
  const drift = Math.sin(time * 0.11) * size * 8e-3 * motion;
  const halfWidth = size * 0.17 * scale;
  const top = cy - size * 0.34 * scale;
  const shoulder = cy - size * 0.13 * scale;
  const base = cy + size * 0.29 * scale;
  context.save();
  context.globalCompositeOperation = "screen";
  const halo = context.createRadialGradient(cx + drift, cy, size * 0.025, cx, cy, size * 0.62);
  halo.addColorStop(0, `rgba(${gems.glow}, ${0.24 + beat * 0.04})`);
  halo.addColorStop(0.36, `rgba(${gems.mid}, 0.16)`);
  halo.addColorStop(1, `rgba(${gems.deep}, 0)`);
  context.fillStyle = halo;
  context.fillRect(0, 0, width, height);
  const points = [
    [cx, top],
    [cx + halfWidth * 0.7, shoulder],
    [cx + halfWidth, base],
    [cx, base + size * 0.045],
    [cx - halfWidth, base],
    [cx - halfWidth * 0.7, shoulder]
  ];
  context.beginPath();
  points.forEach(([x, y], index) => index === 0 ? context.moveTo(x + drift, y) : context.lineTo(x + drift, y));
  context.closePath();
  const body = context.createLinearGradient(cx - halfWidth, top, cx + halfWidth, base);
  body.addColorStop(0, `rgba(${gems.light}, 0.46)`);
  body.addColorStop(0.42, `rgba(${gems.mid}, 0.38)`);
  body.addColorStop(1, `rgba(${gems.deep}, 0.54)`);
  context.fillStyle = body;
  context.shadowColor = `rgba(${gems.glow}, 0.66)`;
  context.shadowBlur = size * 0.055;
  context.fill();
  const facets = [
    { points: [[cx + drift, top], [cx + halfWidth * 0.7 + drift, shoulder], [cx + drift, base + size * 0.045]], color: `rgba(${gems.facets[0]}, 0.44)` },
    { points: [[cx + drift, top], [cx + drift, base + size * 0.045], [cx - halfWidth + drift, base]], color: `rgba(${gems.facets[1]}, 0.5)` },
    { points: [[cx + drift, top], [cx - halfWidth * 0.7 + drift, shoulder], [cx - halfWidth + drift, base]], color: `rgba(${gems.facets[2]}, 0.32)` },
    { points: [[cx + drift, top], [cx + halfWidth * 0.7 + drift, shoulder], [cx + halfWidth + drift, base]], color: `rgba(${gems.facets[3]}, 0.48)` }
  ];
  for (const facet of facets) {
    context.beginPath();
    facet.points.forEach(([x, y], index) => index === 0 ? context.moveTo(x, y) : context.lineTo(x, y));
    context.closePath();
    context.fillStyle = facet.color;
    context.fill();
  }
  context.shadowBlur = size * 0.018;
  context.strokeStyle = `rgba(${gems.edge}, ${0.46 + beat * 0.12})`;
  context.lineWidth = Math.max(1, size * 24e-4);
  context.beginPath();
  points.forEach(([x, y], index) => index === 0 ? context.moveTo(x + drift, y) : context.lineTo(x + drift, y));
  context.closePath();
  context.stroke();
  context.restore();
}
const starPoints = [
  [0.08, 0.16, 0.8],
  [0.17, 0.32, 0.55],
  [0.24, 0.12, 0.7],
  [0.31, 0.24, 0.6],
  [0.39, 0.09, 0.45],
  [0.46, 0.31, 0.8],
  [0.57, 0.14, 0.55],
  [0.66, 0.27, 0.7],
  [0.73, 0.11, 0.5],
  [0.82, 0.22, 0.75],
  [0.92, 0.13, 0.6],
  [0.12, 0.43, 0.5],
  [0.34, 0.4, 0.65],
  [0.62, 0.42, 0.55],
  [0.87, 0.39, 0.6],
  [0.76, 0.49, 0.45]
];
const meteorPaths = [
  { period: 8.8, phase: 7.4, duration: 0.78, x: 0.04, y: 0.12, dx: 0.72, dy: 0.54 },
  { period: 11.6, phase: 5.1, duration: 0.72, x: 0.91, y: 0.04, dx: -0.62, dy: 0.63 },
  { period: 14.2, phase: 9.8, duration: 0.9, x: 0.16, y: 0.02, dx: 0.58, dy: 0.66 }
];
let auraNoiseCanvas;
function getAuraNoiseCanvas() {
  if (auraNoiseCanvas) return auraNoiseCanvas;
  const texture = document.createElement("canvas");
  texture.width = 256;
  texture.height = 256;
  const context = texture.getContext("2d");
  if (!context) return void 0;
  const image = context.createImageData(texture.width, texture.height);
  let seed = 1103515245;
  for (let index = 0; index < image.data.length; index += 4) {
    seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
    const shade = 96 + (seed >>> 24) * 0.25;
    image.data[index] = shade;
    image.data[index + 1] = shade;
    image.data[index + 2] = shade;
    image.data[index + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  auraNoiseCanvas = texture;
  return texture;
}
function auraPaletteBrightness(palette) {
  if (!palette.length) return 0;
  const luminances = palette.map(({ hue, saturation, lightness }) => {
    const h = (hue % 360 + 360) % 360 / 360;
    const s = Math.max(0, Math.min(1, saturation / 100));
    const l = Math.max(0, Math.min(1, lightness / 100));
    const channel = (n) => {
      const k = (n + h * 12) % 12;
      const a = s * Math.min(l, 1 - l);
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    const rgb = [channel(0), channel(8), channel(4)].map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  });
  return luminances.reduce((sum, value) => sum + value, 0) / luminances.length;
}
export function AuraSurface({ currentTrack, isPlaying, isVideo = false, videoElement, auraEnabled, auraPreset, auraPreferences, getAudioLevels, maxFrameRate = 60, adaptiveResolution = false, backgroundRendering = false, blendArtwork = false, onDiagnostics }) {
  const lightMode = useDevicePerformance();
  const diagnosticsRef = useRef(onDiagnostics);
  useEffect(() => {
    diagnosticsRef.current = onDiagnostics;
  }, [onDiagnostics]);
  const activeAuraPreset = resolveTrackAuraPreset(currentTrack, auraPreset);
  const theme = document.documentElement.dataset.theme || "dark";
  const canvasRef = useRef(null);
  const targetColors = useRef(defaultArtworkPalette);
  const [contrastPalette, setContrastPalette] = useState(defaultArtworkPalette);
  const currentColors = useRef((auraPreferences.customPalette ?? defaultArtworkPalette).map((color) => ({ ...color })));
  const auraPreferencesRef = useRef(auraPreferences);
  useEffect(() => {
    auraPreferencesRef.current = auraPreferences;
  }, [auraPreferences]);
  const [audioResponse] = useState(() => new AuraAudioResponse());
  useEffect(() => {
    audioResponse.reset();
  }, [audioResponse, currentTrack?.id]);
  const visualIntensity = useRef(1);
  const rhythmAnalysis = useRef(currentTrack?.rhythmAnalysis);
  useEffect(() => {
    rhythmAnalysis.current = currentTrack?.rhythmAnalysis;
  }, [currentTrack?.rhythmAnalysis]);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);
  const active = Boolean(auraEnabled && currentTrack && isPlaying);
  useEffect(() => {
    if (!active) {
      delete document.documentElement.dataset.auraContrast;
      return;
    }
    document.documentElement.dataset.auraContrast = auraPaletteBrightness(contrastPalette) >= 0.42 ? "light" : "dark";
    return () => {
      delete document.documentElement.dataset.auraContrast;
    };
  }, [active, contrastPalette]);
  useEffect(() => {
    if (auraPreferences.customPalette || isVideo || activeAuraPreset !== "cover" && !blendArtwork) {
      targetColors.current = auraPreferences.customPalette ?? (isVideo || activeAuraPreset === "cover" ? defaultArtworkPalette.map((color) => ({ ...color })) : presetPalettes[activeAuraPreset].map((hue) => ({ hue, saturation: 100, lightness: 50 })));
      setContrastPalette(targetColors.current);
      return;
    }
    let cancelled = false;
    void paletteFromCover(currentTrack?.coverThumbnailBlob ?? currentTrack?.coverBlob).then((palette) => {
      if (!cancelled) {
        targetColors.current = activeAuraPreset !== "cover" && blendArtwork ? blendArtworkPalette(presetPalettes[activeAuraPreset].map((hue) => ({ hue, saturation: 100, lightness: 50 })), palette) : palette;
        setContrastPalette(targetColors.current);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeAuraPreset, blendArtwork, currentTrack?.id, currentTrack?.coverBlob, currentTrack?.coverThumbnailBlob, isVideo, auraPreferences.customPalette]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      diagnosticsRef.current?.({ frames: 0, energy: 0, error: "Canvas 2D indispon\xEDvel na TV." });
      return;
    }
    const scheduleFrame = (callback) => backgroundRendering ? window.setTimeout(() => callback(performance.now()), 1e3 / Math.min(maxFrameRate, 30)) : window.requestAnimationFrame(callback);
    const cancelFrame = (id) => {
      if (backgroundRendering) window.clearTimeout(id);
      else window.cancelAnimationFrame(id);
    };
    const mobileCanvas = window.matchMedia("(max-width: 900px), (hover: none) and (pointer: coarse)").matches;
    const noiseTexture = mobileCanvas || lightMode ? void 0 : getAuraNoiseCanvas();
    const noisePattern = noiseTexture ? context.createPattern(noiseTexture, "repeat") : void 0;
    const videoAuraCanvas = document.createElement("canvas");
    videoAuraCanvas.width = lightMode ? 240 : 480;
    videoAuraCanvas.height = lightMode ? 135 : 270;
    const videoAuraContext = videoAuraCanvas.getContext("2d", { alpha: false });
    let lastVideoAuraFrame = 0;
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastFrame = 0;
    let lastAudioFrame = 0;
    let callbackInterval = 1e3 / 60;
    let time = 0;
    let transitionBass = 0;
    let transitionMids = 0;
    let transitionTreble = 0;
    let transitionPulse = 0;
    let pixelRatio = 1;
    let fullscreenResizeFrame = 0;
    let frames = 0;
    let lastReport = 0;
    let peakEnergy = 0;
    let reportFrames = 0;
    let averageDrawMs = 0;
    let needsResize = false;
    const pulseLatch = new AuraPulseLatch();
    const budget = new AuraRenderBudget();
    const deviceBudget = auraDeviceBudget(lightMode);
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1, Math.min(deviceBudget.edge, adaptiveResolution ? budget.edge : 1280) / Math.max(width, height, 1));
      const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
      const pixelHeight = Math.max(1, Math.round(height * pixelRatio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
    };
    const render = (now) => {
      try {
        drawFrame(now);
      } catch (cause) {
        frame = 0;
        if (!diagnosticsRef.current) console.error("A AURA n\xE3o conseguiu desenhar o quadro.", cause);
        diagnosticsRef.current?.({ frames, energy: peakEnergy, error: cause instanceof Error ? cause.message : "Falha ao desenhar a AURA." });
      }
    };
    const drawFrame = (now) => {
      frame = 0;
      if (document.hidden && !backgroundRendering || !width || !height) return;
      const preferences = auraPreferencesRef.current;
      const comfortMode = preferences.sensitivityMode ?? false;
      const callbackDelta = lastAudioFrame ? now - lastAudioFrame : 1e3 / 60;
      callbackInterval += (Math.max(8, Math.min(100, callbackDelta)) - callbackInterval) * 0.08;
      const audioDelta = Math.min(callbackDelta / 1e3, 0.1);
      lastAudioFrame = now;
      const audio = preferences.audioReactive === false ? { bass: 0, mids: 0, treble: 0, energy: 0, beat: 0, onset: 0 } : getAudioLevels(rhythmAnalysis.current);
      const response = audioResponse.update(audio, audioDelta, comfortMode, reducedMotion, adaptiveResolution);
      pulseLatch.sample(response.pulse);
      peakEnergy = Math.max(peakEnergy, audio.energy);
      const callbackCeiling = adaptiveResolution && callbackInterval > 25 ? 30 : 60;
      const frameInterval = 1e3 / Math.max(1, Math.min(deviceBudget.fps, reducedMotion ? 24 : 60, maxFrameRate, callbackCeiling, adaptiveResolution ? budget.frameRate : 60));
      if (lastFrame && now - lastFrame < frameInterval - Math.min(4, frameInterval * 0.12)) {
        if (!reducedMotion || isPlaying) frame = scheduleFrame(render);
        return;
      }
      const drawStarted = performance.now();
      if (needsResize) {
        resize();
        needsResize = false;
      }
      const elapsedMs = lastFrame ? now - lastFrame : frameInterval;
      const delta = lastFrame ? Math.min((now - lastFrame) / 1e3, 0.1) : 1 / 60;
      lastFrame = now;
      time += delta;
      if (preferences.freeze && frames > 0) return;
      frames += 1;
      const softness = Math.max(0, Math.min(1, preferences.transitionSoftness ?? 0.5));
      const transitionSpeed = 2.4 + (1 - softness) * 9;
      const responseBlend = 1 - Math.exp(-delta * transitionSpeed);
      transitionBass += (response.bass - transitionBass) * responseBlend;
      transitionMids += (response.mids - transitionMids) * responseBlend;
      transitionTreble += (response.treble - transitionTreble) * responseBlend;
      transitionPulse += (pulseLatch.consume() - transitionPulse) * responseBlend;
      const sensitivity = Math.max(0, Math.min(1.5, preferences.musicalSensitivity ?? 1)) * (comfortMode ? 0.62 : 1);
      const smoothedBass = transitionBass * sensitivity;
      const smoothedMids = transitionMids * sensitivity;
      const smoothedTreble = transitionTreble * sensitivity;
      const beatPulse = Math.min(reducedMotion ? 0.1 : comfortMode ? 0.18 : 1, transitionPulse) * sensitivity;
      const paletteBlend = 1 - Math.exp(-delta * transitionSpeed);
      for (let i = 0; i < currentColors.current.length; i += 1) {
        const from = currentColors.current[i];
        const to = targetColors.current[i] ?? defaultArtworkPalette[i];
        const hueDelta = (to.hue - from.hue + 540) % 360 - 180;
        from.hue = (from.hue + hueDelta * paletteBlend + 360) % 360;
        from.saturation += (to.saturation - from.saturation) * paletteBlend;
        from.lightness += (to.lightness - from.lightness) * paletteBlend;
      }
      const intensityTarget = comfortMode ? 0.58 : 1;
      visualIntensity.current += (intensityTarget - visualIntensity.current) * (1 - Math.exp(-delta * 2.8));
      const lightThemePresence = theme === "light" && activeAuraPreset !== "event-horizon" && activeAuraPreset !== "dark-side" ? 1.22 : 1;
      const darkSide = activeAuraPreset === "dark-side";
      const intensity = visualIntensity.current * lightThemePresence * (darkSide ? 1 : 1 + beatPulse * (reducedMotion ? 0.1 : comfortMode ? 0.12 : 0.28));
      const motionIntensity = Math.max(0.1, Math.min(1.5, preferences.motionIntensity ?? 1));
      const motionScale = darkSide ? 0 : (reducedMotion ? 0.18 : comfortMode ? 0.26 : 1) * motionIntensity;
      const bassExpansion = darkSide ? 1 : 1 + smoothedBass * 0.06 * motionScale + beatPulse * (reducedMotion ? 0.1 : comfortMode ? 0.1 : 0.2);
      const oblivion = activeAuraPreset === "oblivion";
      const eventHorizon = activeAuraPreset === "event-horizon";
      const presetRadius = oblivion ? 1.12 : 1;
      const radius = Math.max(width * 0.78, height * 1.2) * bassExpansion * presetRadius * (comfortMode ? 0.9 : 1);
      const centerBaseX = 0.5;
      const fluidDriftX = Math.sin(time * 0.18 + Math.sin(time * 0.055) * 0.42) * 0.65 + Math.sin(time * 0.11 + 2.4) * 0.35;
      const fluidDriftY = Math.sin(time * 0.15 + Math.sin(time * 0.048 + 0.8) * 0.38);
      const centerX = darkSide ? width * centerBaseX : width * (centerBaseX + (reducedMotion ? 0 : fluidDriftX * (9e-3 + smoothedMids * 9e-3) * motionScale));
      const centerYOffset = oblivion ? -0.03 : -0.16;
      const centerY = darkSide ? height * centerYOffset : height * (centerYOffset + (smoothedBass * 0.012 + beatPulse * 0.018) * motionScale + (reducedMotion ? 0 : fluidDriftY * 9e-3 * motionScale));
      context.clearRect(0, 0, width, height);
      const videoFrame = videoAuraFrame(isVideo, Boolean(lastVideoAuraFrame), videoElement?.readyState ?? 0, videoElement?.seeking ?? false);
      const videoAura = videoElement && videoAuraContext && videoFrame.useVideo;
      if (videoAura) {
        if (videoFrame.sample && now - lastVideoAuraFrame >= 60) {
          try {
            videoAuraContext.drawImage(videoElement, 0, 0, videoAuraCanvas.width, videoAuraCanvas.height);
            lastVideoAuraFrame = now;
          } catch {
          }
        }
        if (lastVideoAuraFrame) {
          context.save();
          context.filter = "blur(30px) brightness(.58) saturate(1.3)";
          context.drawImage(videoAuraCanvas, -34, -34, width + 68, height + 68);
          context.restore();
          const shade = context.createLinearGradient(0, 0, 0, height);
          shade.addColorStop(0, "rgba(5, 7, 12, .18)");
          shade.addColorStop(1, "rgba(5, 7, 12, .42)");
          context.fillStyle = shade;
          context.fillRect(0, 0, width, height);
        }
      }
      if (darkSide) {
        const black = context.createLinearGradient(0, 0, width, height);
        black.addColorStop(0, "#020307");
        black.addColorStop(0.5, "#05070d");
        black.addColorStop(1, "#010205");
        context.fillStyle = black;
        context.fillRect(0, 0, width, height);
      }
      const verticalScale = oblivion ? 0.88 : 0.72;
      context.save();
      context.translate(centerX, centerY);
      context.scale(1, verticalScale);
      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
      const hueShift = activeAuraPreset === "prismatic" ? (time * 34 + smoothedMids * 28) % 360 : 0;
      const colors = currentColors.current;
      const [baseHueA, baseHueB, baseHueC, baseHueD] = colors.map((color) => color.hue);
      const hueA = (baseHueA + hueShift) % 360;
      const hueB = (baseHueB + hueShift) % 360;
      const hueC = (baseHueC + hueShift) % 360;
      const hueD = (baseHueD + hueShift) % 360;
      const presetSaturation = activeAuraPreset === "monochrome" ? 0 : activeAuraPreset === "silver" ? 0.16 : activeAuraPreset === "ice" ? 0.62 : 1;
      const colorIntensity = Math.max(0.25, Math.min(1.5, preferences.colorIntensity ?? 1));
      const saturationScale = presetSaturation * (comfortMode ? 0.76 : 1) * colorIntensity;
      const coverMode = activeAuraPreset === "cover";
      const artworkSaturation = colors.map((color) => coverMode ? color.saturation / 100 : 1);
      const artworkLightness = colors.map((color, index) => Math.max(16 - index * 3, Math.min(68 - index * 7, color.lightness * (1 - index * 0.15))));
      const colorBandA = 0.18 + (smoothedMids * 0.05 + beatPulse * 0.018) * motionScale;
      const colorBandB = 0.46 + (smoothedMids * 0.08 + beatPulse * 0.025) * motionScale;
      const colorBandC = 0.72 + smoothedTreble * 0.04 * motionScale;
      const monochrome = activeAuraPreset === "monochrome";
      const silver = activeAuraPreset === "silver";
      if (darkSide) {
        gradient.addColorStop(0, `rgba(5, 7, 14, ${0.34 * intensity})`);
        gradient.addColorStop(0.28, `rgba(8, 12, 24, ${0.28 * intensity})`);
        gradient.addColorStop(0.58, `rgba(6, 9, 18, ${0.2 * intensity})`);
        gradient.addColorStop(0.86, `rgba(2, 3, 8, ${0.12 * intensity})`);
      } else if (oblivion) {
        gradient.addColorStop(0, `hsla(${hueA}, 76%, 18%, ${0.34 * intensity})`);
        gradient.addColorStop(0.28, `hsla(${hueB}, 88%, 26%, ${0.4 * intensity})`);
        gradient.addColorStop(0.56, `hsla(${hueC}, 86%, 36%, ${0.3 * intensity})`);
        gradient.addColorStop(0.82, `hsla(${hueD}, 82%, 24%, ${0.12 * intensity})`);
      } else if (eventHorizon) {
        gradient.addColorStop(0, `hsla(225, 48%, 2%, ${0.82 * intensity})`);
        gradient.addColorStop(0.08, `hsla(222, 64%, 4%, ${0.78 * intensity})`);
        gradient.addColorStop(0.2, `hsla(218, 88%, 22%, ${0.58 * intensity})`);
        gradient.addColorStop(0.34, `hsla(211, 100%, 58%, ${0.46 * intensity})`);
        gradient.addColorStop(0.48, `hsla(202, 34%, 94%, ${0.4 * intensity})`);
        gradient.addColorStop(0.62, `hsla(215, 90%, 56%, ${0.27 * intensity})`);
        gradient.addColorStop(0.82, `hsla(225, 75%, 25%, ${0.12 * intensity})`);
      } else if (activeAuraPreset === "album-333") {
        gradient.addColorStop(0, `hsla(188, 90%, 68%, ${0.62 * intensity})`);
        gradient.addColorStop(colorBandA, `hsla(192, 92%, 60%, ${0.58 * intensity})`);
        gradient.addColorStop(colorBandB, `hsla(200, 88%, 48%, ${0.48 * intensity})`);
        gradient.addColorStop(colorBandC, `hsla(214, 82%, 28%, ${0.3 * intensity})`);
      } else {
        const centerLightness = monochrome ? 88 : silver ? 76 : 48;
        gradient.addColorStop(0, `hsla(${hueA}, ${88 * saturationScale * artworkSaturation[0]}%, ${coverMode ? artworkLightness[0] : centerLightness}%, ${0.42 * intensity})`);
        gradient.addColorStop(colorBandA, `hsla(${hueB}, ${90 * saturationScale * artworkSaturation[1]}%, ${coverMode ? artworkLightness[1] : monochrome ? 70 : silver ? 60 : 49}%, ${0.48 * intensity})`);
        gradient.addColorStop(colorBandB, `hsla(${hueC}, ${88 * saturationScale * artworkSaturation[2]}%, ${coverMode ? artworkLightness[2] : monochrome ? 46 : silver ? 42 : 43}%, ${0.34 * intensity})`);
        gradient.addColorStop(colorBandC, `hsla(${hueD}, ${86 * saturationScale * artworkSaturation[3]}%, ${coverMode ? artworkLightness[3] : monochrome ? 20 : silver ? 22 : 36}%, ${0.16 * intensity})`);
      }
      gradient.addColorStop(1, `hsla(${hueD}, ${88 * saturationScale}%, ${monochrome ? 3 : silver ? 8 : 18}%, 0)`);
      context.fillStyle = gradient;
      if (videoAura) context.globalAlpha = 0.2;
      context.fillRect(-centerX, -centerY / verticalScale, width, height / verticalScale);
      context.globalAlpha = 1;
      context.restore();
      if (["dawn", "dusk", "tide", "eclipse", "frequency"].includes(activeAuraPreset)) {
        renderPresetTexture(context, activeAuraPreset, width, height, time, [hueA, hueB, hueC, hueD], smoothedMids, motionScale, smoothedBass, beatPulse);
      }
      if (darkSide) renderDarkSideAura(context, width, height, motionIntensity, smoothedBass, smoothedMids, beatPulse, adaptiveResolution ? pixelRatio : 1);
      if (activeAuraPreset === "album-333") render333Aura(context, width, height, time, motionScale, smoothedBass, smoothedMids, beatPulse);
      if (activeAuraPreset === "aurora") renderAuroraBorealis(context, width, height, time, motionScale, smoothedMids);
      if (activeAuraPreset === "ocean") renderOceanAura(context, width, height, time, motionScale, smoothedBass, smoothedMids);
      if (activeAuraPreset === "dawn") renderDawnAura(context, width, height, time, motionScale, smoothedBass);
      if (activeAuraPreset === "dusk") renderDuskAura(context, width, height, time, motionScale, smoothedBass);
      if (activeAuraPreset === "ice") renderIceAura(context, width, height, time, motionScale, smoothedTreble, beatPulse);
      if (activeAuraPreset === "violet" || activeAuraPreset === "ruby" || activeAuraPreset === "emerald" || activeAuraPreset === "sapphire") {
        renderGemstoneAura(context, width, height, time, motionScale, smoothedBass, beatPulse, activeAuraPreset);
      }
      if (activeAuraPreset === "brasil") renderBrazilAura(context, width, height, time, motionScale);
      const flamePalette = streakFlamePalettes[activeAuraPreset];
      if (flamePalette) {
        renderStreakHeat(context, width, height, time, flamePalette, smoothedBass, intensity, theme === "light");
      }
      if (noiseTexture) {
        context.save();
        context.globalCompositeOperation = "soft-light";
        context.globalAlpha = eventHorizon ? 0.035 : flamePalette ? 0.06 : comfortMode ? 0.045 : 0.075;
        context.fillStyle = noisePattern ?? "#888";
        context.fillRect(0, 0, width, height);
        context.restore();
      }
      if (activeAuraPreset === "cosmic" || oblivion || eventHorizon) {
        context.save();
        context.fillStyle = "#fff";
        for (let index = 0; index < starPoints.length; index += 1) {
          const [baseX, baseY, alpha] = starPoints[index];
          const drift = reducedMotion ? 0 : time;
          const x = activeAuraPreset === "cosmic" || eventHorizon ? ((baseX + drift * (14e-4 + index % 4 * 4e-4)) % 1 + 1) % 1 : (baseX + drift * (3e-3 + index % 4 * 8e-4) + 1) % 1;
          const y = activeAuraPreset === "cosmic" || eventHorizon ? (baseY + Math.sin(drift * 0.08 + index * 1.3) * 4e-3 + 1) % 1 : (baseY + drift * (15e-4 + index % 3 * 5e-4)) % 1;
          const twinkle = 0.84 + Math.sin(time * 0.7 + index * 1.7) * 0.12;
          context.globalAlpha = alpha * 0.62 * twinkle;
          context.beginPath();
          context.arc(x * width, y * height, 0.55 + alpha * 0.55, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      }
      if (activeAuraPreset === "cosmic" || oblivion || eventHorizon) {
        context.save();
        context.lineCap = "round";
        context.shadowColor = "rgba(190, 148, 255, 0.88)";
        context.shadowBlur = 8;
        for (const meteor of meteorPaths) {
          const progress = (time + meteor.phase) % meteor.period / meteor.period;
          if (progress > meteor.duration / meteor.period) continue;
          const travel = progress / (meteor.duration / meteor.period);
          const headX = (meteor.x + meteor.dx * travel) * width;
          const headY = (meteor.y + meteor.dy * travel) * height;
          const tailX = headX - meteor.dx * width * 0.095;
          const tailY = headY - meteor.dy * height * 0.095;
          const trail = context.createLinearGradient(tailX, tailY, headX, headY);
          trail.addColorStop(0, "rgba(255,255,255,0)");
          trail.addColorStop(0.72, "rgba(193,151,255,0.12)");
          trail.addColorStop(1, "rgba(255,255,255,0.96)");
          context.globalAlpha = Math.sin(Math.PI * travel);
          context.beginPath();
          context.moveTo(tailX, tailY);
          context.lineTo(headX, headY);
          context.strokeStyle = trail;
          context.lineWidth = 1.2;
          context.stroke();
        }
        context.restore();
      }
      const drawMs = performance.now() - drawStarted;
      averageDrawMs += (drawMs - averageDrawMs) * 0.15;
      if (adaptiveResolution && budget.observe(drawMs, elapsedMs, now, frameInterval)) needsResize = true;
      if (!lastReport) {
        lastReport = now;
        reportFrames = frames;
      }
      if (now - lastReport >= 1e3) {
        diagnosticsRef.current?.({ frames, energy: peakEnergy, error: "", fps: (frames - reportFrames) * 1e3 / (now - lastReport), drawMs: averageDrawMs, width: canvas.width, height: canvas.height });
        lastReport = now;
        reportFrames = frames;
        peakEnergy = 0;
      }
      if (!reducedMotion || isPlaying) frame = scheduleFrame(render);
    };
    const start = () => {
      if (document.hidden && !backgroundRendering) return;
      if (frame) cancelFrame(frame);
      lastFrame = 0;
      lastAudioFrame = 0;
      pulseLatch.reset();
      lastReport = 0;
      audioResponse.reset();
      if (reducedMotion && !isPlaying) render(performance.now());
      else frame = scheduleFrame(render);
    };
    const onResize = () => {
      if (fullscreenResizeFrame) return;
      fullscreenResizeFrame = window.requestAnimationFrame(() => {
        fullscreenResizeFrame = 0;
        if (frame) cancelFrame(frame);
        frame = 0;
        resize();
        lastFrame = 0;
        lastAudioFrame = 0;
        pulseLatch.reset();
        render(performance.now());
      });
    };
    const onVisibilityChange = () => {
      if (document.hidden && !backgroundRendering) {
        if (frame) cancelFrame(frame);
        frame = 0;
      } else {
        start();
      }
    };
    const onFullscreenChange = onResize;
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);
    resize();
    start();
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      if (frame) cancelFrame(frame);
      if (fullscreenResizeFrame) window.cancelAnimationFrame(fullscreenResizeFrame);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
    };
  }, [active, activeAuraPreset, audioResponse, getAudioLevels, isPlaying, isVideo, videoElement, reducedMotion, theme, maxFrameRate, adaptiveResolution, backgroundRendering, lightMode]);
  const brightness = Math.max(0.45, Math.min(1.5, auraPreferences.brightness ?? 1));
  return /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: `aura-canvas${active ? " is-active" : ""}`, style: { filter: brightness === 1 ? "none" : `brightness(${brightness})` }, "aria-hidden": "true" });
}
