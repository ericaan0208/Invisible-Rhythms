import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecord, RECORD_DURATION, SAMPLE_RATE, POWER_SAMPLE_RATE, movingMeanSquare, makeBandpass, applyFIR, sampleAt, project, computeSpectrum } from '../src/signal.js';

test('one deterministic record keeps data and event identity across views', () => {
  const record = buildRecord();
  assert.equal(record, buildRecord());
  assert.equal(record.raw.values.length, RECORD_DURATION * SAMPLE_RATE);
  assert.equal(record.power.values.length, RECORD_DURATION * POWER_SAMPLE_RATE);
  const initialEvents = JSON.stringify(record.events);
  const initialSample = sampleAt(record.sigma, 64.125);
  for (const window of [2, 8, 60, 240, 8]) project(record.sigma, 0, window, 480, 120);
  assert.equal(JSON.stringify(record.events), initialEvents);
  assert.equal(sampleAt(record.sigma, 64.125), initialSample);
  assert.ok(record.events.length > 10);
  for (const event of record.events) {
    assert.ok(event.duration >= 0.5 && event.duration <= 2);
    assert.ok(event.peakTime >= event.start && event.peakTime < event.end);
    assert.ok(event.peakRms >= record.metadata.eventThresholdRms);
  }
});

test('mean-square estimation uses squared amplitude and a 0.5 second window', () => {
  const values = Float64Array.from({ length: 512 }, (_, index) => index < 256 ? 2 : 4);
  const estimate = movingMeanSquare(values, 256, 0.5);
  assert.equal(estimate[128], 4);
  assert.equal(estimate[384], 16);
  assert.equal(estimate[256], 10);
  const record = buildRecord();
  assert.equal(record.power.unit, 'a.u.²');
  assert.equal(record.rms.unit, 'a.u.');
  for (let i = 0; i < record.power.values.length; i += 19) assert.ok(Math.abs(record.rms.values[i] ** 2 - record.power.values[i]) < 1e-12);
});

test('actual FIR retains 13 Hz and suppresses out-of-band background', () => {
  const rate = 256;
  const kernel = makeBandpass(10, 16, rate, 257);
  const energyAfter = frequency => {
    const source = Float64Array.from({ length: 2048 }, (_, i) => Math.sin(2 * Math.PI * frequency * i / rate));
    const filtered = applyFIR(source, kernel);
    let squareSum = 0;
    for (let i = 256; i < filtered.length - 256; i++) squareSum += filtered[i] ** 2;
    return squareSum / (filtered.length - 512);
  };
  assert.ok(Math.abs(energyAfter(13) - 0.5) < 0.001);
  assert.ok(energyAfter(2.3) < 0.0001);
  assert.ok(energyAfter(24) < 0.0001);
});

test('periodogram is calculated from power and resolves constructed slow variation', () => {
  const record = buildRecord();
  const spectrum = record.spectrum;
  assert.equal(spectrum.resolution, 1 / 240);
  assert.equal(spectrum.unit, 'a.u.⁴ / Hz');
  assert.ok(Math.abs(spectrum.peak.frequency - 1 / 60) <= spectrum.resolution);
  const flat = computeSpectrum(new Float64Array(1920).fill(4), 8);
  assert.ok(flat.bins.every(bin => bin.power === 0));
  const sine = Float64Array.from({ length: 1920 }, (_, i) => Math.sin(2 * Math.PI * i / 480));
  const reference = computeSpectrum(sine, 8);
  assert.equal(reference.peak.frequency, 1 / 60);
  const integratedVariance = reference.bins.reduce((sum, bin) => sum + bin.power * reference.resolution, 0);
  assert.ok(Math.abs(integratedVariance - 0.5) < 0.002);
});

test('dense projection retains every column extremum and fixed amplitude scale', () => {
  const values = Float64Array.from({ length: 4096 }, (_, index) => Math.sin(index * Math.PI / 2));
  values[15] = 6;
  values[2743] = -7;
  const series = { values, sampleRate: 256, unit: 'a.u.' };
  const wide = project(series, 0, 16, 64, 100);
  const narrow = project(series, 0, 1, 64, 100);
  assert.equal(wide.aggregated, true);
  assert.equal(Math.max(...wide.columns.map(column => column.max)), 6);
  assert.equal(Math.min(...wide.columns.map(column => column.min)), -7);
  assert.deepEqual([wide.min, wide.max], [narrow.min, narrow.max]);
  assert.ok(wide.points.some(point => point.value === 6));
  assert.ok(wide.points.some(point => point.value === -7));
  assert.ok(wide.points.every(point => point.x >= 0 && point.x <= 64));
  assert.equal(wide.start, 0);
  assert.equal(wide.duration, 16);
});

test('observation windows carry matching time coordinates and clamp to the record', () => {
  const record = buildRecord();
  const view = project(record.power, 230, 60, 600, 100);
  assert.equal(view.start, 180);
  assert.equal(view.duration, 60);
  assert.equal(view.points[0].time, 180);
  assert.equal(sampleAt(record.raw, -1), record.raw.values[0]);
  assert.equal(sampleAt(record.raw, 500), record.raw.values.at(-1));
  assert.throws(() => project(record.raw, 0, 0, 100, 100), RangeError);
});
