import { record } from './science/model.js';

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

/** Display the existing periodogram bins; this view performs no signal processing. */
export function spectrumMarkup() {
  const spectrum = record.spectrum;
  const maxFrequency = 0.06; // Retain the original optional spectrum's viewing interval.
  const bins = spectrum.bins.filter((bin) => bin.frequency > 0 && bin.frequency <= maxFrequency);
  const width = 560;
  const height = 320;
  const left = 62;
  const right = 24;
  const top = 46;
  const bottom = 72;
  const graphWidth = width - left - right;
  const graphHeight = height - top - bottom;
  const highest = Math.max(...bins.map((bin) => bin.power));
  const maximum = Math.max(0.2, Math.ceil(highest * 5) / 5);
  const x = (frequency) => left + frequency / maxFrequency * graphWidth;
  const y = (density) => top + graphHeight * (1 - density / maximum);
  const line = bins.map((bin, index) => `${index ? 'L' : 'M'}${x(bin.frequency).toFixed(3)},${y(bin.power).toFixed(3)}`).join(' ');
  const frequencyTicks = [0, 0.02, 0.04, 0.06];
  const densityTicks = [0, maximum / 2, maximum];
  const peak = spectrum.peak;
  const units = spectrum.unit;
  const band = spectrum.inspectedBand;
  const peakText = `The largest bin within the declared ${band[0].toFixed(2)}–${band[1].toFixed(2)} Hz window is ${peak.frequency.toFixed(5)} Hz (${peak.period.toFixed(0)} seconds), with density ${peak.power.toFixed(3)} ${units}.`;
  const xTicks = frequencyTicks.map((value) => `<line x1="${x(value)}" x2="${x(value)}" y1="${y(0)}" y2="${y(0) + 6}" stroke="currentColor" opacity=".55"/><text x="${x(value)}" y="${y(0) + 28}" text-anchor="middle">${value.toFixed(2)}</text>`).join('');
  const yTicks = densityTicks.map((value) => `<line x1="${left}" x2="${width - right}" y1="${y(value)}" y2="${y(value)}" stroke="currentColor" opacity=".16"/><text x="${left - 12}" y="${y(value) + 6}" text-anchor="end">${value.toFixed(1)}</text>`).join('');

  return `<section class="evidence-method evidence-spectrum-section">
    <h3>Inspect the calculated spectrum</h3>
    <p>How is variation distributed across frequencies? This is the existing one-sided periodogram of all ${spectrum.duration} seconds of simulated sigma power, shown up to ${maxFrequency.toFixed(2)} Hz.</p>
    <figure class="evidence-spectrum" style="margin:20px 0">
      <svg class="evidence-spectrum-plot" viewBox="0 0 ${width} ${height}" style="display:block;width:100%;height:auto;overflow:visible" role="img" aria-labelledby="evidence-spectrum-title evidence-spectrum-description">
        <title id="evidence-spectrum-title">Calculated spectrum of simulated sigma power</title>
        <desc id="evidence-spectrum-description">Frequency in Hz along the horizontal axis, and spectral density in ${escape(units)} along the vertical axis. Shading identifies the declared ${band[0].toFixed(2)}–${band[1].toFixed(2)} Hz window. ${escape(peakText)} These are constructed simulation features, not independently discovered biological periods.</desc>
        <g fill="currentColor" font-family="var(--mono, monospace)" font-size="18">
          <text x="${left}" y="22" font-size="17">Spectral density (${escape(units)})</text>
          <rect x="${x(band[0])}" y="${top}" width="${x(band[1]) - x(band[0])}" height="${graphHeight}" fill="currentColor" opacity=".07"/>
          ${yTicks}${xTicks}
          <path d="M${left},${top}V${y(0)}H${width - right}" fill="none" stroke="currentColor" opacity=".6" stroke-width="1"/>
          <path class="evidence-spectrum-line" d="${line}" fill="none" stroke="var(--accent, currentColor)" stroke-width="2.8" stroke-linejoin="round"/>
          ${bins.map((bin) => `<circle cx="${x(bin.frequency)}" cy="${y(bin.power)}" r="2.3" fill="var(--accent, currentColor)"/>`).join('')}
          <text x="${left + graphWidth / 2}" y="${height - 10}" text-anchor="middle">Frequency (Hz)</text>
        </g>
      </svg>
      <figcaption class="evidence-status">Shaded: the declared 0.01–0.04 Hz study window. Dots are calculated frequency bins; the line joins adjacent bins. ${escape(peakText)}</figcaption>
    </figure>
    <p><strong>Calculation.</strong> ${escape(spectrum.method)}. Bin spacing is ${spectrum.resolution.toFixed(5)} Hz. Because the analyzed input is already power, spectral density is expressed in ${escape(units)}.</p>
    <p><strong>Interpretation.</strong> The 60- and 90-second amplitude variation was deliberately included in the simulation. Squaring and packet timing can introduce additional components. A peak does not establish a biological oscillator or statistical significance.</p>
    <details class="evidence-spectrum-values"><summary>Inspect the plotted frequency bins</summary><div class="evidence-table-wrap"><table class="evidence-reference-table"><caption>Existing calculated values, rounded for display</caption><thead><tr><th scope="col">Frequency (Hz)</th><th scope="col">Density (${escape(units)})</th></tr></thead><tbody>${bins.map((bin) => `<tr><td>${bin.frequency.toFixed(5)}</td><td>${bin.power.toFixed(6)}</td></tr>`).join('')}</tbody></table></div></details>
  </section>`;
}
