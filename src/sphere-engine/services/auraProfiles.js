// Fonte do motor AURA do Sphere UI Kit; integração sem player.
function normalize(value) {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
const darkSideTrackTitles = /* @__PURE__ */ new Set([
  "speak to me",
  "breathe",
  "breathe in the air",
  "on the run",
  "time",
  "the great gig in the sky",
  "money",
  "us and them",
  "any colour you like",
  "any color you like",
  "brain damage",
  "eclipse"
]);
function isPinkFloyd(track) {
  return [track.albumArtist, track.artist, ...track.artists ?? []].some((artist) => normalize(artist).includes("pink floyd"));
}
function isDarkSideTrack(track) {
  if (!isPinkFloyd(track)) return false;
  return normalize(track.album).includes("the dark side of the moon") || darkSideTrackTitles.has(normalize(track.title));
}
function isMatue333Track(track) {
  const hasMatue = [track.albumArtist, track.artist, ...track.artists ?? []].some((artist) => normalize(artist).includes("matue"));
  return hasMatue && normalize(track.album).split(" ").includes("333");
}
function albumAuraForTrack(track) {
  if (isDarkSideTrack(track)) return "dark-side";
  if (isMatue333Track(track)) return "album-333";
  return void 0;
}
export function resolveTrackAuraPreset(track, preference) {
  if (preference !== "cover" || !track) return preference;
  return albumAuraForTrack(track) ?? "cover";
}
