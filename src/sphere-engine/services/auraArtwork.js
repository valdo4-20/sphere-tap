// Fonte do motor AURA do Sphere UI Kit; integração sem player.
export function blendArtworkPalette(base, cover, weight = 0.35) {
  const amount = Math.max(0, Math.min(1, weight));
  return base.map((color, index) => {
    const artwork = cover[index % cover.length] ?? color;
    const hueDelta = (artwork.hue - color.hue + 540) % 360 - 180;
    return {
      hue: (color.hue + hueDelta * amount + 360) % 360,
      saturation: color.saturation + (artwork.saturation - color.saturation) * amount,
      lightness: color.lightness + (artwork.lightness - color.lightness) * amount
    };
  });
}
export const defaultArtworkPalette = [338, 274, 198, 42].map((hue) => ({ hue, saturation: 100, lightness: 50 }));
const coverPalettes = /* @__PURE__ */ new WeakMap();
function rgbToHsl(red, green, blue) {
  const r = red / 255, g = green / 255, b = blue / 255;
  const high = Math.max(r, g, b), low = Math.min(r, g, b), delta = high - low;
  const lightness = (high + low) / 2;
  let hue = 0;
  if (delta) {
    hue = high === r ? 60 * ((g - b) / delta % 6) : high === g ? 60 * ((b - r) / delta + 2) : 60 * ((r - g) / delta + 4);
  }
  return { hue: (hue + 360) % 360, saturation: delta ? delta / (1 - Math.abs(2 * lightness - 1)) * 100 : 0, lightness: lightness * 100 };
}
export function paletteFromArtworkPixels(pixels) {
  const buckets = /* @__PURE__ */ new Map();
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] < 128) continue;
    const red = pixels[index], green = pixels[index + 1], blue = pixels[index + 2];
    const color = rgbToHsl(red, green, blue);
    const key = color.saturation < 12 ? `neutral-${Math.floor(color.lightness / 20)}` : `color-${Math.floor(color.hue / 20)}-${Math.floor(color.lightness / 25)}`;
    const weight = (0.3 + color.saturation / 140) * (0.4 + color.lightness / 100);
    const bucket = buckets.get(key) ?? { red: 0, green: 0, blue: 0, weight: 0 };
    bucket.red += red * weight;
    bucket.green += green * weight;
    bucket.blue += blue * weight;
    bucket.weight += weight;
    buckets.set(key, bucket);
  }
  const ranked = [...buckets.values()].sort((a, b) => b.weight - a.weight).map((bucket) => rgbToHsl(bucket.red / bucket.weight, bucket.green / bucket.weight, bucket.blue / bucket.weight));
  const colors = [];
  for (const color of ranked) {
    const distinct = colors.every((old) => {
      const hueDistance = Math.abs((color.hue - old.hue + 540) % 360 - 180);
      return color.saturation >= 12 && old.saturation >= 12 && hueDistance >= 24 || Math.abs(color.saturation - old.saturation) >= 24 || Math.abs(color.lightness - old.lightness) >= 18;
    });
    if (distinct) colors.push(color);
    if (colors.length === 4) break;
  }
  return colors.length ? Array.from({ length: 4 }, (_, index) => ({ ...colors[index % colors.length] })) : defaultArtworkPalette;
}
async function sampleCoverPalette(cover) {
  let bitmap, imageUrl;
  try {
    let image;
    try {
      bitmap = await createImageBitmap(cover);
      image = bitmap;
    } catch {
      imageUrl = URL.createObjectURL(cover);
      const fallback = new Image();
      fallback.src = imageUrl;
      await fallback.decode();
      image = fallback;
    }
    const sample = document.createElement("canvas");
    sample.width = 48;
    sample.height = 48;
    const context = sample.getContext("2d", { willReadFrequently: true });
    if (!context) return defaultArtworkPalette;
    context.drawImage(image, 0, 0, sample.width, sample.height);
    return paletteFromArtworkPixels(context.getImageData(0, 0, sample.width, sample.height).data);
  } catch {
    return defaultArtworkPalette;
  } finally {
    bitmap?.close();
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }
}
export function paletteFromCover(cover) {
  if (!cover) return Promise.resolve(defaultArtworkPalette);
  let palette = coverPalettes.get(cover);
  if (!palette) {
    palette = sampleCoverPalette(cover);
    coverPalettes.set(cover, palette);
  }
  return palette;
}
