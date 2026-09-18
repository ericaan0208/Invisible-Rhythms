# Invisible Rhythms

A local, scroll-led scientific storytelling prototype. The experience moves from an illustrative page pulse to EEG, alpha and sigma, spindle-like events, band power, and variation over longer observation windows.

## Run locally

Requires Node.js 22.12 or later and pnpm.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:5173/.

```sh
pnpm build
pnpm test
pnpm preview
```

The production output is written to `dist/`. Preview runs at http://127.0.0.1:4173/.

## Interaction

Ordinary scrolling completes the main story. The observation window also supports 2, 10, 60 and 180 second presets, a keyboard-accessible slider, and **Resume guided view**. **Evidence** opens sources and methods for the current scene. **Pause motion**, reduced-motion preferences and compact screens provide a natural reading layout.

## Scientific boundaries

- The plotted signals are deterministic synthetic demonstrations, not participant recordings.
- Alpha is a separate simulated waking example. Filtered sigma, power, RMS amplitude, event duration and the power spectrum remain distinct quantities.
- The sleep-like input is a fixed 240-second record. The demonstration includes a 13 Hz carrier and deliberately imposed 60- and 90-second amplitude variation; it does not establish a biological clock.
- Source mappings and measurement methods are retained in the code and evidence layer. Selected public content is described in `public/public-content-manifest.json`.
- Private research files, PDFs, manuscripts, owner references, QA recordings and unpublished findings are not included in this package.

## Project structure

- `src/main.js`: current entry point.
- `src/pulse.js`, `src/pulse-hero.js`, `src/journey-scenes.js`: current story and controls.
- `src/continuity.js`, `src/live-trace.js`, `src/teaching-views.js`: continuous scientific views.
- `src/signal.js`, `src/plot.js`: deterministic calculations and plotting.
- `src/content.js`, `src/intro-evidence.js`, `src/teaching-methods.js`: approved public evidence and definitions.
- `src/pulse.css`, `src/refinement.css`: current presentation and responsive design.
- `public/`: local assets and the public-content manifest.
- `tests/`: retained numerical tests.

Other retained presentation modules are historical code and are not loaded by the current entry point. The stack is Vite, vanilla JavaScript, GSAP/ScrollTrigger and SVG. No public deployment is configured.

## Upload to GitHub

Create an empty repository, then upload the contents of this folder to its root, including `.gitignore`. Upload the extracted files, not just the ZIP archive. Installing dependencies and building locally will recreate `node_modules/` and `dist/`; neither belongs in this source upload.
