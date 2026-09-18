import { atlas, processS } from './content.js';

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function atlasMarkup() {
  return `<details class="method-detail atlas-detail">
    <summary>Explore the broader time reference</summary>
    <p>These reference values compare different quantities. They are illustrative anchors or study-specific findings, not universal normal ranges. The guided story covers the electrical examples; the wider reference preserves the project's broader scope.</p>
    <div class="reference-table-wrap">
      <table class="reference-table">
        <caption>Different time quantities in the broader reference</caption>
        <thead><tr><th scope="col">Example</th><th scope="col">Time quantity</th><th scope="col">Reference value</th></tr></thead>
        <tbody>${atlas.map(item => `<tr><th scope="row">${escapeHTML(item.name)}</th><td>${escapeHTML(item.quantity)}</td><td>${escapeHTML(item.timeLabel)}</td></tr><tr class="reference-note"><td colspan="3">${escapeHTML(item.note)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <h3>${escapeHTML(processS.label)}</h3>
    <p>${escapeHTML(processS.summary)} ${escapeHTML(processS.note)}</p>
  </details>`;
}

/** Optional evidence-layer markup; rendering and event handling belong to the page. */
export function methodMarkup(key, data) {
  if (key === 'atlas') return atlasMarkup();
  if (!['spindle', 'power', 'iso'].includes(key)) return '';

  const meta = data.metadata;
  const clipped = escapeHTML(meta.clippedNegativeSamples);
  const resolution = escapeHTML(data.spectrum.resolution.toFixed(5));
  const duration = escapeHTML(data.duration);
  return `<details class="method-detail">
    <summary>How the signal and power are calculated</summary>
    <p><strong>Simulated input.</strong> One deterministic ${duration}-second EEG-like record contains a 13 Hz carrier in irregular packets, with deliberately imposed 60- and 90-second amplitude variation. The separate alpha example uses a 10 Hz carrier. Amplitudes have arbitrary units; these are not calibrated human EEG recordings.</p>
    <p><strong>Choose the band.</strong> A centered 257-tap Blackman-windowed FIR filter selects 10–16 Hz, with gain normalized at 13 Hz. The plotted sigma signal is this calculated filter output, in a.u.</p>
    <p><strong>Calculate power.</strong> Square that signal and average over a centered 0.5-second window. Apply a 513-tap 2 Hz low-pass filter before sampling the power at 8 Hz. Its units are a.u.². The smoother's ${clipped} negative undershoots are explicitly floored to zero.</p>
    <p><strong>Keep amplitude separate.</strong> RMS amplitude is the square root of this power and has units of a.u. It is not the same quantity as power. The method is a smoothed local mean square, not a Hilbert amplitude envelope.</p>
    <p><strong>Mark an illustrative event.</strong> The event rule requires RMS amplitude ≥0.43 a.u. for 0.5–2 seconds, at a temporal resolution of 0.125 seconds. The selected event spans 3.875–4.875 seconds. This threshold rule is not a clinically validated spindle detector; event timing and band power remain separate measurements.</p>
    <p><strong>Window and edges.</strong> Widening the view reprojects the same arrays and timestamps. It does not calculate another signal. Centered filters use reflected boundary padding; the first and last two seconds are boundary-sensitive.</p>
  </details>
  <details class="method-detail spectrum-detail">
    <summary>Inspect the calculated spectrum</summary>
    <p>This is the calculated spectrum of all ${duration} seconds of simulated sigma power. The mean is removed and a Hann window is applied before a one-sided periodogram, with no zero padding. Frequency-bin spacing is ${resolution} Hz; the vertical quantity is a.u.⁴/Hz because the analyzed input is already power.</p>
    <svg class="trace method-spectrum" id="method-spectrum" role="img" aria-label="Calculated spectrum of the simulated sigma-power time course"></svg>
    <p>The construction deliberately includes 60- and 90-second amplitude variation. Squaring and packet timing can add other components to power. A peak here demonstrates the construction; no significance test, biological discovery or independent oscillator is established.</p>
  </details>`;
}
