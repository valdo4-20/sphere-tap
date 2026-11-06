// Fonte do motor AURA do Sphere UI Kit; integração sem player.
import { useSyncExternalStore } from "react";
import { lightModeEnabled, subscribeDevicePerformance } from "../services/devicePerformance";
export function useDevicePerformance() {
  return useSyncExternalStore(subscribeDevicePerformance, lightModeEnabled, () => false);
}
