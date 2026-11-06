// Fonte do motor AURA do Sphere UI Kit; integração sem player.
export function videoAuraFrame(isVideo, cached, readyState, seeking) {
  const sample = isVideo && !seeking && readyState >= 2;
  return { sample, useVideo: isVideo && (cached || sample) };
}
