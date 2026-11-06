// Fonte do motor AURA do Sphere UI Kit; integração sem player.
const KEY = "sphere.device.light-mode.v1";
const EVENT = "sphere:device-performance";
let sessionValue;
export function lightModeEnabled() {
  if (sessionValue !== void 0) return sessionValue;
  try {
    const saved = window.localStorage.getItem(KEY);
    return saved === "1";
  } catch {
    return false;
  }
}
export function applyDevicePerformance() {
  document.documentElement.dataset.lightMode = String(lightModeEnabled());
}
export function setLightMode(enabled) {
  sessionValue = enabled;
  try {
    window.localStorage.setItem(KEY, enabled ? "1" : "0");
  } catch {
  }
  applyDevicePerformance();
  window.dispatchEvent(new Event(EVENT));
}
export function subscribeDevicePerformance(listener) {
  const update = () => {
    applyDevicePerformance();
    listener();
  };
  const storage = (event) => {
    if (event.key === KEY || event.key === null) {
      sessionValue = void 0;
      update();
    }
  };
  window.addEventListener(EVENT, update);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(EVENT, update);
    window.removeEventListener("storage", storage);
  };
}
export function auraDeviceBudget(light) {
  return light ? { edge: 720, fps: 30 } : { edge: 1280, fps: 60 };
}
