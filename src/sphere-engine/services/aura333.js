// Fonte do motor AURA do Sphere UI Kit; integração sem player.
export function get333AuraGradientGeometry(cx, cy, radius, flowX, flowY) {
  const driftLimit = radius * 0.12;
  const driftX = Math.max(-driftLimit, Math.min(driftLimit, flowX * 0.2));
  const driftY = Math.max(-driftLimit, Math.min(driftLimit, flowY * 0.2));
  return {
    focalX: cx - radius * 0.22 + driftX,
    focalY: cy - radius * 0.25 + driftY,
    innerRadius: radius * 0.025,
    centerX: cx,
    centerY: cy,
    outerRadius: radius * 1.08
  };
}
