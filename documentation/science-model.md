# Scientific data foundation

`src/science/signal.js` is a byte-for-byte copy of the current source at the earlier Invisible Rhythms prototype (`prototype/src/signal.js`). The redesign adapter does not change its construction, filters, estimator, event detection, or spectrum. No original project files were edited.

The stored record is **240 seconds**. The story's 180-second view is an observation window into that record, not its stored duration. Window changes reproject the same samples and preserve the same full-record vertical range.

## Interface

```js
import {
  record, traces, windows, selectedEvent, selection, cycle,
  sampleAt, normalize, projectTrace, sliceTrace,
} from './science/model.js';

const plot = projectTrace('sigma', {
  start: selection.overviewStart, duration: 2, width: 1000, height: 240,
});
// Canvas: connect plot.points in array order; x/y are pixel coordinates.
// Dense views: plot.columns retains each horizontal column's actual extrema.
const value = sampleAt('sigma', 4.25);
const verticalFraction = normalize('sigma', value);
```

- `record`: cached deterministic record and complete scientific metadata.
- `traces`: `raw`, `sigma`, `power`, `rms`, `alpha`. Each has `values`, `sampleRate`, `unit`, `label`, `timeStart`, `duration`, and `displayRange`. Treat the shared typed arrays as read-only; JavaScript cannot freeze a nonempty typed array. Use `sliceTrace` for a separate mutable copy.
- `windows`: `[2, 10, 60, 180]` seconds.
- `recordDuration`: `240` seconds.
- `selectedEvent`: existing threshold-derived event at 3.875–4.875 s, duration 1 s. This is the original teaching selection, not a new detection.
- `selection`: event bounds plus existing overview (3.4 s, 2 s wide), detail (3.65 s, 1.4 s wide), and cycle anchor (4.24 s).
- `cycle`: sigma carrier 13 Hz, approximate cycle duration 1/13 s; independent alpha carrier 10 Hz, approximate cycle duration 0.1 s. Phase modulation means the sigma interval describes the nominal carrier, not an exact zero-crossing measurement.
- `displayRanges`: frozen copies of each full-record range.
- `sampleAt(keyOrTrace, time)`: linear interpolation in record seconds; finite times outside the record hold an edge.
- `normalize(keyOrTrace, value)`: normalized full-record scale; 0 is the lower axis limit and 1 the upper. Does not silently rescale or clip.
- `projectTrace(keyOrTrace, options)`: original extrema-preserving projector. `points` contain `x,y,value,time`; `columns` contain `min,max,minY,maxY,start,end`. `minY` is the pixel position of the minimum signal value, typically **below** `maxY`. Options `duration` and `start` describe seconds. The original projector clamps oversized/out-of-range windows. `min/max`, `unit`, and `aggregation` state what is displayed. The adapter does not cache per-frame geometry; the UI should cache stable projections where appropriate.
- `sliceTrace(keyOrTrace, start, duration)`: sample copy with original units, full-record range, and data-time coordinates. Bounds snap outward to the sample grid, so the returned `timeStart`/`duration` are the actual copied interval. The original requested bounds are also retained.

## Measurement and interpretation

Input is a seeded synthetic EEG-like record at 256 Hz, in arbitrary units. It contains a nominal 13 Hz carrier in irregular packets, deliberate 60- and 90-second amplitude variation, and added components. The alpha record is a separate synthetic 10 Hz example; alpha never becomes sigma.

Sigma is the actual output of a centered 257-tap Blackman-windowed sinc FIR band-pass, 10–16 Hz, normalized at 13 Hz, with reflected boundaries. Power is the centered 0.5-second mean square of that output, then a centered 513-tap 2 Hz low-pass, sampled at 8 Hz. Negative smoothing undershoots are explicitly floored at zero. Its units are a.u.²; RMS is its square root, in a.u. Threshold-derived events remain a separate representation. The first and last two seconds are boundary-sensitive.

The source spectrum uses all 240 seconds of the computed power: mean removed, Hann window, one-sided periodogram, no zero padding or significance test. Its vertical unit is a.u.⁴/Hz. Constructed slow variation is not evidence for a biological clock. UI scroll, playback, focus and scale never change samples, sampling rate, event timestamps or scientific time.

## Validation

Run `node --test tests/science.test.mjs` from the redesign directory with Node supporting ESM. Tests check a fresh independent deterministic generation, exact rederivation of filtered sigma and power, units and selected interval, source immutability during forward/reverse window projections, fixed y ranges, extrema retention, and isolation of mutable slices.
