// Fonte do motor AURA do Sphere UI Kit; integração sem player.
export class AuraPulseLatch {
  peak = 0;
  sample(pulse) {
    if (Number.isFinite(pulse)) this.peak = Math.max(this.peak, Math.max(0, Math.min(1, pulse)));
  }
  consume() {
    const peak = this.peak;
    this.peak = 0;
    return peak;
  }
  reset() {
    this.peak = 0;
  }
}
export class AuraRenderBudget {
  profiles = [
    { edge: 540, fps: 24 },
    { edge: 540, fps: 30 },
    { edge: 720, fps: 30 },
    { edge: 960, fps: 30 },
    { edge: 960, fps: 60 },
    { edge: 1280, fps: 60 }
  ];
  level = 4;
  slow = 0;
  fast = 0;
  lastChange = 0;
  get edge() {
    return this.profiles[this.level].edge;
  }
  get frameRate() {
    return this.profiles[this.level].fps;
  }
  observe(drawMs, elapsedMs, now, targetMs) {
    if (![drawMs, elapsedMs, now, targetMs].every(Number.isFinite) || targetMs <= 0) return false;
    const overloaded = drawMs > targetMs * 0.65 || elapsedMs > targetMs * 1.4;
    this.slow = overloaded ? this.slow + 1 : Math.max(0, this.slow - 1);
    this.fast = !overloaded && drawMs < targetMs * 0.3 && elapsedMs < targetMs * 1.2 ? this.fast + 1 : Math.max(0, this.fast - 4);
    if (this.slow >= 8 && this.level > 0 && now - this.lastChange > 1200) {
      this.level -= 1;
      this.slow = 0;
      this.fast = 0;
      this.lastChange = now;
      return true;
    }
    if (this.fast >= 180 && this.level < this.profiles.length - 1 && now - this.lastChange > 6e3) {
      this.level += 1;
      this.slow = 0;
      this.fast = 0;
      this.lastChange = now;
      return true;
    }
    return false;
  }
}
