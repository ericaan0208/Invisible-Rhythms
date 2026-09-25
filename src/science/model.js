/**
 * Presentation adapter for the unchanged Invisible Rhythms teaching record.
 * Never write to trace.values. Use sliceTrace when a mutable copy is needed.
 */
import {
  buildRecord,
  project,
  sampleAt as interpolateAt,
} from './signal.js';

export const record = buildRecord();
export const traces = Object.freeze({
  raw: record.raw,
  sigma: record.sigma,
  power: record.power,
  rms: record.rms,
  alpha: record.alpha,
});

export const windows = Object.freeze([2, 10, 60, 180]);
export const recordDuration = record.duration; // 240 s stored; 180 s is a view.
export const selectedEvent = record.events.find(event => event.start === 3.875 && event.end === 4.875);
if (!selectedEvent) throw new Error('The fixed teaching record is missing its established selected event.');

export const selection = Object.freeze({
  start: selectedEvent.start,
  end: selectedEvent.end,
  duration: selectedEvent.duration,
  overviewStart: 3.4,
  overviewDuration: 2,
  detailStart: 3.65,
  detailDuration: 1.4,
  cycleStart: 4.24,
});

export const cycle = Object.freeze({
  sigmaHz: record.metadata.carrierHz,
  sigmaSeconds: 1 / record.metadata.carrierHz,
  alphaHz: record.metadata.alphaHz,
  alphaSeconds: 1 / record.metadata.alphaHz,
});

export const displayRanges = Object.freeze(Object.fromEntries(
  Object.entries(traces).map(([key, series]) => [key, Object.freeze([...series.displayRange])]),
));

/** Resolve a named trace or an existing trace object without copying samples. */
function resolveTrace(keyOrTrace) {
  const series = typeof keyOrTrace === 'string' ? traces[keyOrTrace] : keyOrTrace;
  if (!series?.values?.length || !Number.isFinite(series.sampleRate) || series.sampleRate <= 0) {
    throw new TypeError(`Unknown or invalid scientific trace: ${String(keyOrTrace)}`);
  }
  return series;
}

/** Linear interpolation in record seconds. Values outside the record hold an edge. */
export function sampleAt(keyOrTrace, time) {
  if (!Number.isFinite(time)) throw new RangeError('Sample time must be finite.');
  return interpolateAt(resolveTrace(keyOrTrace), time);
}

/**
 * Normalize against the original full-record range, never a window-local range.
 * The value 0 maps to the bottom and 1 to the top of a conventional plot.
 */
export function normalize(keyOrTrace, value) {
  const series = resolveTrace(keyOrTrace);
  const [min, max] = series.displayRange;
  return (value - min) / (max - min || 1);
}

/**
 * Draw points as a chronological line. Dense views also expose per-column extrema.
 * Bounds, axis units, data times, aggregation and fixed scales are in the result.
 */
export function projectTrace(keyOrTrace, {
  start = selection.overviewStart,
  duration = selection.overviewDuration,
  width = 1000,
  height = 200,
} = {}) {
  return project(resolveTrace(keyOrTrace), start, duration, width, height);
}

/**
 * Get an independent sample copy, retaining its original data-time coordinates.
 * Bounds enclose the requested interval and snap outward to the sample grid.
 * Oversized/out-of-range windows are clamped using the same rule as project().
 */
export function sliceTrace(keyOrTrace, start, duration) {
  const series = resolveTrace(keyOrTrace);
  if (!Number.isFinite(start) || !Number.isFinite(duration) || duration <= 0) {
    throw new RangeError('A slice requires a finite start and positive duration.');
  }
  const origin = series.timeStart || 0;
  const total = series.values.length / series.sampleRate;
  const visibleDuration = Math.min(total, duration);
  const visibleStart = Math.max(origin, Math.min(start, origin + total - visibleDuration));
  const first = Math.max(0, Math.floor((visibleStart - origin) * series.sampleRate));
  const afterLast = Math.min(series.values.length, Math.ceil((visibleStart + visibleDuration - origin) * series.sampleRate));
  return Object.freeze({
    ...series,
    values: series.values.slice(first, afterLast),
    timeStart: origin + first / series.sampleRate,
    duration: (afterLast - first) / series.sampleRate,
    displayRange: Object.freeze([...series.displayRange]),
    requestedStart: start,
    requestedDuration: duration,
  });
}

export const scienceModel = Object.freeze({
  record, traces, windows, recordDuration, selectedEvent, selection, cycle,
  displayRanges, sampleAt, normalize, projectTrace, sliceTrace,
});
