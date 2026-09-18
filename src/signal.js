/**
 * Deterministic teaching data, not a physiological recording or a fitted model.
 * Data time is expressed in seconds. Nothing here reads narrative/scroll time.
 */
export const RECORD_DURATION = 240;
export const SAMPLE_RATE = 256;
export const POWER_SAMPLE_RATE = 8;
export const duration = RECORD_DURATION;
export const sampleRate = SAMPLE_RATE;
const TAU = Math.PI * 2;
const SEED = 20260914;
let cachedRecord;
const ranges = new WeakMap();

function randomGenerator(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function sinc(x) {
  return Math.abs(x) < 1e-12 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
}

/** Symmetric Blackman-windowed sinc filter, evaluated without a causal delay. */
export function makeLowpass(cutoff, rate, taps = 257) {
  if (taps % 2 !== 1 || cutoff <= 0 || cutoff >= rate / 2) throw new RangeError('Invalid FIR specification');
  const kernel = new Float64Array(taps);
  const middle = (taps - 1) / 2;
  for (let i = 0; i < taps; i++) {
    const window = 0.42 - 0.5 * Math.cos(TAU * i / (taps - 1)) + 0.08 * Math.cos(2 * TAU * i / (taps - 1));
    kernel[i] = 2 * cutoff / rate * sinc(2 * cutoff / rate * (i - middle)) * window;
  }
  const sum = kernel.reduce((total, value) => total + value, 0);
  return kernel.map(value => value / sum);
}

export function makeBandpass(low, high, rate, taps = 257) {
  if (low >= high) throw new RangeError('Band limits must ascend');
  const upper = makeLowpass(high, rate, taps);
  const lower = makeLowpass(low, rate, taps);
  const kernel = upper.map((value, i) => value - lower[i]);
  // Normalize the gain at the declared center frequency (13 Hz here).
  const middle = (taps - 1) / 2;
  const center = (low + high) / 2;
  const gain = kernel.reduce((total, value, i) => total + value * Math.cos(TAU * center / rate * (i - middle)), 0);
  return kernel.map(value => value / gain);
}

function reflectIndex(index, length) {
  if (length < 2) return 0;
  const period = 2 * (length - 1);
  const position = ((index % period) + period) % period;
  return position < length ? position : period - position;
}

export function applyFIR(input, kernel) {
  const output = new Float64Array(input.length);
  const middle = (kernel.length - 1) / 2;
  for (let i = 0; i < input.length; i++) {
    let value = 0;
    for (let j = 0; j < kernel.length; j++) {
      const index = i + j - middle;
      value += kernel[j] * input[index >= 0 && index < input.length ? index : reflectIndex(index, input.length)];
    }
    output[i] = value;
  }
  return output;
}

/** Centered 0.5 s mean square; even windows cover [-0.25, +0.25) s. */
export function movingMeanSquare(input, rate, windowSeconds = 0.5) {
  const windowSamples = Math.max(1, Math.round(windowSeconds * rate));
  const left = Math.floor(windowSamples / 2);
  const paddedLength = input.length + windowSamples;
  const cumulative = new Float64Array(paddedLength + 1);
  for (let i = 0; i < paddedLength; i++) {
    const value = input[reflectIndex(i - left, input.length)];
    cumulative[i + 1] = cumulative[i] + value * value;
  }
  const result = new Float64Array(input.length);
  for (let i = 0; i < input.length; i++) result[i] = (cumulative[i + windowSamples] - cumulative[i]) / windowSamples;
  return result;
}

function trace(values, rate, unit, label, extra = {}) {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) { min = Math.min(min, value); max = Math.max(max, value); }
  const displayRange = min < 0 ? [-Math.max(Math.abs(min), Math.abs(max)), Math.max(Math.abs(min), Math.abs(max))] : [0, max || 1];
  return Object.freeze({ values, sampleRate: rate, unit, label, timeStart: 0, duration: values.length / rate, displayRange, ...extra });
}

/** Threshold events are a second representation, never synonymous with power. */
export function detectEvents(rmsValues, rate, threshold = 0.43, minDuration = 0.5, maxDuration = 2) {
  const events = [];
  let onset = -1;
  for (let i = 0; i <= rmsValues.length; i++) {
    const above = i < rmsValues.length && rmsValues[i] >= threshold;
    if (above && onset === -1) onset = i;
    if (!above && onset !== -1) {
      const eventDuration = (i - onset) / rate;
      if (eventDuration >= minDuration && eventDuration <= maxDuration) {
        let peakIndex = onset;
        for (let j = onset; j < i; j++) if (rmsValues[j] > rmsValues[peakIndex]) peakIndex = j;
        events.push(Object.freeze({ id: `demo-event-${String(events.length + 1).padStart(3, '0')}`, start: onset / rate, end: i / rate, duration: eventDuration, peakTime: peakIndex / rate, peakRms: rmsValues[peakIndex] }));
      }
      onset = -1;
    }
  }
  return Object.freeze(events);
}

/** One-sided, Hann-windowed periodogram of the power time course. */
export function computeSpectrum(values, rate, maxFrequency = 0.1) {
  const count = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / count;
  const weighted = new Float64Array(count);
  let windowEnergy = 0;
  for (let i = 0; i < count; i++) {
    const weight = 0.5 - 0.5 * Math.cos(TAU * i / (count - 1));
    weighted[i] = (values[i] - mean) * weight;
    windowEnergy += weight * weight;
  }
  const bins = [];
  const maxBin = Math.min(Math.floor(count / 2), Math.floor(maxFrequency * count / rate));
  for (let k = 0; k <= maxBin; k++) {
    let real = 0;
    let imaginary = 0;
    for (let i = 0; i < count; i++) {
      const phase = TAU * k * i / count;
      real += weighted[i] * Math.cos(phase);
      imaginary -= weighted[i] * Math.sin(phase);
    }
    const frequency = k * rate / count;
    const sidedness = k === 0 || k === count / 2 ? 1 : 2;
    bins.push(Object.freeze({ frequency, power: sidedness * (real * real + imaginary * imaginary) / (rate * windowEnergy), period: frequency === 0 ? null : 1 / frequency }));
  }
  const inspected = bins.filter(bin => bin.frequency >= 0.01 && bin.frequency <= 0.04);
  const peak = inspected.reduce((best, bin) => !best || bin.power > best.power ? bin : best, null);
  return Object.freeze({ bins: Object.freeze(bins), values: Object.freeze(bins), peak, resolution: rate / count, unit: 'a.u.⁴ / Hz', frequencyUnit: 'Hz', duration: count / rate, method: 'One-sided periodogram; mean removed; Hann window; no zero padding or significance test', inspectedBand: [0.01, 0.04] });
}

export function buildRecord() {
  if (cachedRecord) return cachedRecord;
  const random = randomGenerator(SEED);
  const count = RECORD_DURATION * SAMPLE_RATE;
  const rawValues = new Float64Array(count);
  const alphaValues = new Float64Array(count);
  const injectedSigma = new Float64Array(count);
  const packetEnvelope = new Float64Array(count);
  // Irregular packet spacing is constructed independently of display zoom.
  const constructedPackets = [];
  for (let center = 1.35; center < RECORD_DURATION - 1; center += 2.35 + random() * 2.55) {
    const span = 0.85 + random() * 0.85;
    const height = 0.78 + random() * 0.45;
    constructedPackets.push({ center, span, height });
    const first = Math.max(0, Math.floor((center - span / 2) * SAMPLE_RATE));
    const last = Math.min(count, Math.ceil((center + span / 2) * SAMPLE_RATE));
    for (let i = first; i < last; i++) {
      const phase = (i / SAMPLE_RATE - center) / span;
      if (Math.abs(phase) <= 0.5) packetEnvelope[i] += height * Math.pow(Math.cos(Math.PI * phase), 2);
    }
  }
  let coloredNoise = 0;
  for (let i = 0; i < count; i++) {
    const t = i / SAMPLE_RATE;
    const slowVariation = 1 + 0.42 * Math.cos(TAU * t / 60) + 0.18 * Math.cos(TAU * t / 90 + 0.55);
    const amplitude = (0.12 + 1.45 * packetEnvelope[i]) * slowVariation;
    injectedSigma[i] = amplitude * Math.sin(TAU * 13 * t + 0.12 * Math.sin(TAU * 0.21 * t));
    coloredNoise = 0.9 * coloredNoise + (random() - 0.5) * 0.11;
    rawValues[i] = injectedSigma[i] + 0.27 * Math.sin(TAU * 2.3 * t + 0.4 * Math.sin(TAU * 0.13 * t)) + 0.08 * Math.sin(TAU * 24 * t + 0.3) + coloredNoise;
    const alphaEnvelope = 0.59 + 0.17 * Math.sin(TAU * 0.43 * t) + 0.08 * Math.sin(TAU * 0.17 * t + 1.4);
    alphaValues[i] = alphaEnvelope * Math.sin(TAU * 10 * t + 0.08 * Math.sin(TAU * 0.3 * t)) + 0.035 * Math.sin(TAU * 3.1 * t);
  }
  const sigmaValues = applyFIR(rawValues, makeBandpass(10, 16, SAMPLE_RATE, 257));
  const meanSquareValues = movingMeanSquare(sigmaValues, SAMPLE_RATE, 0.5);
  // Smooth before decimation. The 2 Hz cutoff is below the 4 Hz new Nyquist.
  const antiAliased = applyFIR(meanSquareValues, makeLowpass(2, SAMPLE_RATE, 513));
  const powerValues = new Float64Array(RECORD_DURATION * POWER_SAMPLE_RATE);
  const rmsValues = new Float64Array(powerValues.length);
  const stride = SAMPLE_RATE / POWER_SAMPLE_RATE;
  let clippedNegativeSamples = 0;
  for (let i = 0; i < powerValues.length; i++) {
    if (antiAliased[i * stride] < 0) clippedNegativeSamples++;
    // A windowed-sinc smoother can undershoot zero. Explicitly floor such values.
    powerValues[i] = Math.max(0, antiAliased[i * stride]);
    rmsValues[i] = Math.sqrt(powerValues[i]);
  }
  const raw = trace(rawValues, SAMPLE_RATE, 'a.u.', 'Synthetic EEG-like record');
  const sigma = trace(sigmaValues, SAMPLE_RATE, 'a.u.', 'Sigma-band signal · 10–16 Hz');
  const power = trace(powerValues, POWER_SAMPLE_RATE, 'a.u.²', 'Derived sigma power');
  const rms = trace(rmsValues, POWER_SAMPLE_RATE, 'a.u.', 'RMS amplitude · square root of displayed power');
  const alpha = trace(alphaValues, SAMPLE_RATE, 'a.u.', 'Independent synthetic alpha example · 10 Hz');
  const events = detectEvents(rmsValues, POWER_SAMPLE_RATE);
  cachedRecord = Object.freeze({
    duration: RECORD_DURATION, sampleRate: SAMPLE_RATE, powerSampleRate: POWER_SAMPLE_RATE,
    raw, sigma, power, rms, alpha,
    events,
    spectrum: computeSpectrum(powerValues, POWER_SAMPLE_RATE),
    metadata: Object.freeze({
      identity: 'IR-SYNTH-20260914-v1', seed: SEED, kind: 'SYNTHETIC DEMONSTRATION',
      physiologicalData: false, units: 'Arbitrary units; no voltage calibration',
      carrierHz: 13, alphaHz: 10, sigmaBandHz: [10, 16],
      imposedModulationPeriodsSeconds: [60, 90],
      imposedModulationFrequenciesHz: [1 / 60, 1 / 90],
      construction: 'A 13 Hz carrier in irregular packets has deliberately imposed 60 s and 90 s amplitude variation. Additional 2.3 Hz, 24 Hz and seeded irregular components form the EEG-like record. The alpha record is an independent 10 Hz illustration.',
      bandpass: 'Centered 257-tap Blackman-windowed sinc FIR; 10–16 Hz cutoffs; 13 Hz gain normalized; reflected edges; no causal time shift',
      powerEstimator: 'Centered 0.5 s (128 samples) mean square of the filtered signal; centered 513-tap Blackman FIR low-pass at 2 Hz; sample at 8 Hz; negative smoothing undershoots floored to zero',
      powerWindowSeconds: 0.5, powerSmoothingCutoffHz: 2, clippedNegativeSamples,
      edgeCautionSeconds: 2,
      eventDetector: 'Illustrative threshold on displayed RMS ≥ 0.43 a.u.; contiguous duration 0.5–2 s; temporal resolution 0.125 s; no trained classifier or clinical spindle validation',
      eventThresholdRms: 0.43, eventDurationSeconds: [0.5, 2],
      eventTimesSeconds: Object.freeze(events.map(event => Object.freeze({ start: event.start, end: event.end, peakTime: event.peakTime }))),
      constructedPacketCentersSeconds: Object.freeze(constructedPackets.map(packet => packet.center)),
      suggestedOpeningStartSeconds: 4,
      suggestedOpeningWindowSeconds: 1,
      spectrumCaution: 'The spectrum demonstrates intentionally constructed variation. Its bins do not establish a biological oscillator or statistical significance. No surrogate or empirical null is implemented.',
      interpretation: 'Observation-window changes reproject this same fixed record. Scroll position and animation playback do not change its physiological/data time or event timestamps.'
    })
  });
  return cachedRecord;
}

/** Linear readout in data time; values outside the record are held at the edge. */
export function sampleAt(series, time) {
  const coordinate = Math.max(0, Math.min(series.values.length - 1, (time - (series.timeStart || 0)) * series.sampleRate));
  const left = Math.floor(coordinate);
  const right = Math.min(series.values.length - 1, left + 1);
  const fraction = coordinate - left;
  return series.values[left] * (1 - fraction) + series.values[right] * fraction;
}

function seriesRange(series) {
  if (series.displayRange) return series.displayRange;
  if (ranges.has(series)) return ranges.get(series);
  let min = Infinity;
  let max = -Infinity;
  for (const value of series.values) { min = Math.min(min, value); max = Math.max(max, value); }
  const range = min === max ? [min - 1, max + 1] : [min, max];
  ranges.set(series, range);
  return range;
}

/**
 * Reproject data rather than stretching a bitmap. Dense columns retain extrema.
 * The y range stays fixed for a given series across observation-window changes.
 * Canvas users may draw `columns`; SVG users can use `path` or `points` directly.
 */
export function project(series, start = 0, windowSeconds = 4, width = 1000, height = 100) {
  if (!series?.values?.length || !Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0 || !Number.isFinite(windowSeconds) || windowSeconds <= 0) throw new RangeError('Projection requires a nonempty trace and positive finite dimensions');
  const recordDuration = series.values.length / series.sampleRate;
  const visibleDuration = Math.min(recordDuration, windowSeconds);
  const origin = series.timeStart || 0;
  const visibleStart = Math.max(origin, Math.min(Number.isFinite(start) ? start : origin, origin + recordDuration - visibleDuration));
  const begin = Math.max(0, Math.floor((visibleStart - origin) * series.sampleRate));
  const end = Math.min(series.values.length, Math.ceil((visibleStart + visibleDuration - origin) * series.sampleRate));
  const range = seriesRange(series);
  const scale = range[1] - range[0] || 1;
  const y = value => 4 + (1 - (value - range[0]) / scale) * Math.max(1, height - 8);
  const x = index => ((index / series.sampleRate + origin) - visibleStart) / visibleDuration * width;
  const points = [];
  const columns = [];
  const sampleCount = end - begin;
  const columnCount = Math.min(Math.max(1, Math.floor(width)), sampleCount);
  const aggregated = sampleCount > width * 2;
  if (!aggregated) {
    for (let i = begin; i < end; i++) {
      if (x(i) >= 0 && x(i) <= width) points.push({ x: x(i), y: y(series.values[i]), value: series.values[i], time: origin + i / series.sampleRate });
    }
  } else {
    for (let column = 0; column < columnCount; column++) {
      const firstIndex = begin + Math.floor(column * sampleCount / columnCount);
      const lastIndex = begin + Math.floor((column + 1) * sampleCount / columnCount) - 1;
      let minIndex = firstIndex;
      let maxIndex = firstIndex;
      for (let i = firstIndex + 1; i <= lastIndex; i++) {
        if (series.values[i] < series.values[minIndex]) minIndex = i;
        if (series.values[i] > series.values[maxIndex]) maxIndex = i;
      }
      const midpoint = Math.max(0, Math.min(width, (x(firstIndex) + x(lastIndex)) / 2));
      columns.push({ x: midpoint, min: series.values[minIndex], max: series.values[maxIndex], first: series.values[firstIndex], last: series.values[lastIndex], minY: y(series.values[minIndex]), maxY: y(series.values[maxIndex]), start: origin + firstIndex / series.sampleRate, end: origin + lastIndex / series.sampleRate });
      for (const index of [...new Set([firstIndex, minIndex, maxIndex, lastIndex])].sort((a, b) => a - b)) points.push({ x: Math.max(0, Math.min(width, x(index))), y: y(series.values[index]), value: series.values[index], time: origin + index / series.sampleRate });
    }
  }
  const path = points.map((point, i) => `${i === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
  return { path, points, columns, aggregated, min: range[0], max: range[1], start: visibleStart, duration: visibleDuration, width, height, unit: series.unit, aggregation: aggregated ? 'Extrema retained within each horizontal pixel column' : 'Individual samples' };
}

export const tracePoints = project;
