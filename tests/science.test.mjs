import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  record, traces, windows, selectedEvent, selection, cycle,
  sampleAt, normalize, projectTrace, sliceTrace,
} from '../src/science/model.js';
import { applyFIR, makeBandpass, makeLowpass, movingMeanSquare } from '../src/science/signal.js';

const digest = values => createHash('sha256').update(Buffer.from(values.buffer, values.byteOffset, values.byteLength)).digest('hex');

test('the stored record, selected event, and separate alpha example retain their scientific identities', () => {
  assert.equal(record.duration, 240);
  assert.equal(traces.raw.values.length, 240 * 256);
  assert.equal(traces.sigma.sampleRate, 256);
  assert.equal(traces.power.values.length, 240 * 8);
  assert.deepEqual(windows, [2, 10, 60, 180]);
  assert.equal(record.metadata.physiologicalData, false);
  assert.equal(record.metadata.identity, 'IR-SYNTH-20260914-v1');
  assert.equal(selectedEvent.start, 3.875);
  assert.equal(selectedEvent.end, 4.875);
  assert.equal(selectedEvent.duration, 1);
  assert.equal(selection.start, selectedEvent.start);
  assert.equal(cycle.sigmaSeconds, 1 / 13);
  assert.equal(cycle.alphaSeconds, 0.1);
  assert.notEqual(traces.alpha.values, traces.sigma.values);
  assert.notEqual(digest(traces.alpha.values), digest(traces.sigma.values));
});

test('the fixed generator produces identical samples and event times in a fresh module instance', async () => {
  const { buildRecord } = await import('../src/science/signal.js?independent-determinism-test');
  const independent = buildRecord();
  for (const key of Object.keys(traces)) assert.equal(digest(independent[key].values), digest(traces[key].values), key);
  assert.deepEqual(independent.events, record.events);
});

test('displayed sigma and power are exactly rederived from the documented pipeline', () => {
  const filtered = applyFIR(traces.raw.values, makeBandpass(10, 16, 256, 257));
  assert.equal(digest(filtered), digest(traces.sigma.values));
  const squareMean = movingMeanSquare(filtered, 256, 0.5);
  const smoothed = applyFIR(squareMean, makeLowpass(2, 256, 513));
  let negativeUndershoots = 0;
  for (let i = 0; i < traces.power.values.length; i++) {
    const beforeFloor = smoothed[i * 32];
    if (beforeFloor < 0) negativeUndershoots++;
    assert.equal(traces.power.values[i], Math.max(0, beforeFloor));
    assert.equal(traces.rms.values[i], Math.sqrt(traces.power.values[i]));
    assert.ok(traces.power.values[i] >= 0);
  }
  assert.equal(negativeUndershoots, record.metadata.clippedNegativeSamples);
  assert.equal(traces.sigma.unit, 'a.u.');
  assert.equal(traces.power.unit, 'a.u.²');
});

test('changing the observation window or viewport does not modify data, time, or y scales', () => {
  const before = Object.fromEntries(Object.entries(traces).map(([key, series]) => [key, digest(series.values)]));
  for (const duration of [...windows, ...windows.slice().reverse()]) {
    for (const width of [390, 1280, 1440]) {
      for (const key of ['raw', 'sigma', 'power']) {
        const projected = projectTrace(key, { start: 3.4, duration, width, height: 240 });
        assert.equal(projected.start, 3.4);
        assert.equal(projected.duration, duration);
        assert.deepEqual([projected.min, projected.max], traces[key].displayRange);
        assert.ok(projected.points.length > 0);
        for (const point of projected.points) {
          assert.ok(point.time >= projected.start - 1 / traces[key].sampleRate);
          assert.ok(point.time <= projected.start + duration);
          assert.ok(Math.abs(sampleAt(key, point.time) - point.value) < 1e-12);
        }
      }
    }
  }
  for (const [key, series] of Object.entries(traces)) assert.equal(digest(series.values), before[key]);
  assert.equal(selectedEvent.start, 3.875);
});

test('dense projection retains every column minimum and maximum', () => {
  const series = traces.sigma;
  const projected = projectTrace('sigma', { start: 3.4, duration: 180, width: 390, height: 240 });
  assert.equal(projected.aggregated, true);
  assert.equal(projected.columns.length, 390);
  for (const column of projected.columns) {
    const first = Math.round(column.start * series.sampleRate);
    const last = Math.round(column.end * series.sampleRate);
    let min = Infinity;
    let max = -Infinity;
    for (let index = first; index <= last; index++) {
      min = Math.min(min, series.values[index]);
      max = Math.max(max, series.values[index]);
    }
    assert.equal(column.min, min);
    assert.equal(column.max, max);
  }
});

test('copied time slices preserve units/scales and cannot mutate the record', () => {
  const copy = sliceTrace('sigma', selectedEvent.start, selectedEvent.duration);
  assert.equal(copy.timeStart, 3.875);
  assert.equal(copy.duration, 1);
  assert.equal(copy.values.length, 256);
  assert.deepEqual(copy.displayRange, traces.sigma.displayRange);
  assert.equal(sampleAt(copy, selectedEvent.start), sampleAt('sigma', selectedEvent.start));
  const original = sampleAt('sigma', selectedEvent.start);
  copy.values[0] = 12345;
  assert.equal(sampleAt('sigma', selectedEvent.start), original);
  assert.equal(normalize('power', 0), 0);
  assert.equal(normalize('sigma', 0), 0.5);
  assert.throws(() => sliceTrace('sigma', 0, 0), RangeError);
  assert.throws(() => sampleAt('sigma', NaN), RangeError);
  assert.throws(() => projectTrace('not-a-trace'), TypeError);
});
