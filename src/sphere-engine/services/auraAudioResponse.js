// Fonte do motor AURA do Sphere UI Kit; integração sem player.
export class AuraAudioResponse {
  initialized = false;
  previous = [0, 0, 0];
  average = [0, 0, 0];
  peaks = [0.12, 0.12, 0.12];
  samples = [0, 0, 0];
  levels = { bass: 0, mids: 0, treble: 0, pulse: 0 };
  reset() {
    this.initialized = false;
    this.levels.pulse = 0;
  }
  update(audio, delta, comfort = false, reducedMotion = false, immediateAttacks = false) {
    const dt = Math.min(0.1, Math.max(0, delta));
    const values = this.samples;
    values[0] = audio.bass;
    values[1] = audio.mids;
    values[2] = audio.treble;
    for (let index = 0; index < values.length; index += 1) values[index] = Number.isFinite(values[index]) ? Math.max(0, values[index]) : 0;
    if (!this.initialized) {
      this.previous = [...values];
      this.average = [...values];
      this.peaks = values.map((value) => Math.max(0.12, value));
      this.initialized = true;
    }
    let onset = 0;
    for (let index = 0; index < values.length; index += 1) {
      const value = values[index];
      const peak = this.peaks[index] = Math.max(0.12, value, this.peaks[index] * Math.exp(-dt * 0.5));
      const rise = Math.max(0, value - this.previous[index] - 3e-3) / Math.max(0.025, peak * 0.1);
      const contrast = Math.max(0, value - this.average[index] - 0.012) / Math.max(0.055, peak * 0.22);
      const weight = index === 0 ? 1 : index === 1 ? 0.7 : 0.5;
      onset = Math.max(onset, Math.max(rise, contrast * 0.65) * weight);
      this.previous[index] = value;
      this.average[index] += (value - this.average[index]) * (1 - Math.exp(-dt * 5));
      const key = index === 0 ? "bass" : index === 1 ? "mids" : "treble";
      this.levels[key] += (Math.min(1, value / peak) - this.levels[key]) * (1 - Math.exp(-dt * 20));
    }
    const gentle = comfort || reducedMotion;
    const target = Math.min(reducedMotion ? 0.1 : comfort ? 0.18 : 0.62, Math.max(onset, audio.onset ?? 0, audio.beat ?? 0));
    if (gentle) this.levels.pulse = Math.min(this.levels.pulse, reducedMotion ? 0.1 : 0.18);
    if (immediateAttacks && !gentle && Number.isFinite(audio.onset) && (audio.onset ?? 0) > 0) {
      this.levels.pulse = Math.max(this.levels.pulse, Math.min(0.62, audio.onset));
    }
    const rate = target > this.levels.pulse ? gentle ? 10 : 22 : gentle ? 3 : 7.5;
    this.levels.pulse += (target - this.levels.pulse) * (1 - Math.exp(-dt * rate));
    return this.levels;
  }
}
